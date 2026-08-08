"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../../shared/prisma");
const AppError_1 = require("../../../errors/AppError");
const mailer_1 = require("../../../helpers/mailer");
const registerUser = async (payload) => {
    const isExist = await prisma_1.prisma.user.findUnique({
        where: { email: payload.email },
    });
    if (isExist) {
        throw new AppError_1.AppError(http_status_1.default.CONFLICT, 'User already exists');
    }
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, 12);
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const newUser = await prisma_1.prisma.user.create({
        data: {
            ...payload,
            password: hashedPassword,
        },
    });
    await prisma_1.prisma.otp.create({
        data: {
            email: newUser.email,
            otp: otpCode,
            expiresAt,
        },
    });
    const emailHtml = `
    <h1>Verify your email</h1>
    <p>Your verification code is: <strong>${otpCode}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;
    await (0, mailer_1.sendEmail)(newUser.email, 'Verify your email - BaZi SaaS', emailHtml);
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
    };
};
const verifyEmail = async (email, otpCode) => {
    const otpRecord = await prisma_1.prisma.otp.findFirst({
        where: {
            email,
            otp: otpCode,
            isUsed: false,
        },
    });
    if (!otpRecord) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid OTP');
    }
    if (otpRecord.expiresAt < new Date()) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'OTP has expired');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.isEmailVerified) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Email already verified');
    }
    // Mark OTP as used and verify user
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.otp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        }),
        prisma_1.prisma.user.update({
            where: { email },
            data: {
                isEmailVerified: true,
            },
        }),
        prisma_1.prisma.subscription.create({
            data: {
                userId: user.id,
                plan: 'FREE',
            },
        }),
    ]);
    return null;
};
const loginUser = async (payload) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!user.isEmailVerified) {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, 'Please verify your email first');
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid credentials');
    }
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
};
exports.AuthService = {
    registerUser,
    verifyEmail,
    loginUser,
};
