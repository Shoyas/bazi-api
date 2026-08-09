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
const redis_1 = require("../../../shared/redis");
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
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '7d') });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '180d') });
    // Store refresh token in Redis set
    await redis_1.redisClient.sadd(`user:${user.id}:refreshTokens`, refreshToken);
    // Set expiry on the individual refresh token string key
    const refreshExpirySeconds = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS || '15552000', 10);
    await redis_1.redisClient.setex(`rt:${refreshToken}`, refreshExpirySeconds, user.id);
    // Also add to set for easy revocation
    await redis_1.redisClient.sadd(`user:${user.id}:refreshTokens`, `rt:${refreshToken}`);
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
};
const refreshToken = async (token) => {
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    }
    catch (error) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid or expired refresh token');
    }
    const userId = decoded.userId;
    // Check if token exists in Redis (hasn't been revoked)
    const exists = await redis_1.redisClient.get(`rt:${token}`);
    if (!exists) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Refresh token has been revoked or is invalid');
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '7d') });
    return { accessToken };
};
const logout = async (token, userId) => {
    await redis_1.redisClient.del(`rt:${token}`);
    await redis_1.redisClient.srem(`user:${userId}:refreshTokens`, `rt:${token}`);
    return null;
};
const revokeAllUserTokens = async (userId) => {
    // Get all refresh tokens for user
    const tokens = await redis_1.redisClient.smembers(`user:${userId}:refreshTokens`);
    if (tokens.length > 0) {
        await redis_1.redisClient.del(...tokens); // Delete the individual token keys
    }
    await redis_1.redisClient.del(`user:${userId}:refreshTokens`); // Delete the set
};
const changePassword = async (userId, payload) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const isPasswordMatched = await bcryptjs_1.default.compare(payload.oldPassword, user.password);
    if (!isPasswordMatched) {
        throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Incorrect old password');
    }
    const newHashedPassword = await bcryptjs_1.default.hash(payload.newPassword, 12);
    await prisma_1.prisma.user.update({
        where: { id: userId },
        data: { password: newHashedPassword },
    });
    // Strict token revocation
    await revokeAllUserTokens(userId);
    return null;
};
const forgotPassword = async (email) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.prisma.otp.create({
        data: {
            email,
            otp: otpCode,
            expiresAt,
        },
    });
    const emailHtml = `
    <h1>Password Reset</h1>
    <p>Your password reset code is: <strong>${otpCode}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;
    await (0, mailer_1.sendEmail)(email, 'Password Reset - BaZi SaaS', emailHtml);
    return null;
};
const resetPassword = async (payload) => {
    const otpRecord = await prisma_1.prisma.otp.findFirst({
        where: {
            email: payload.email,
            otp: payload.otp,
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
        where: { email: payload.email },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const newHashedPassword = await bcryptjs_1.default.hash(payload.newPassword, 12);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.otp.update({
            where: { id: otpRecord.id },
            data: { isUsed: true },
        }),
        prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password: newHashedPassword },
        })
    ]);
    // Strict token revocation
    await revokeAllUserTokens(user.id);
    return null;
};
const getMe = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            country: true,
            isEmailVerified: true,
            createdAt: true,
            subscription: true,
        },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
};
exports.AuthService = {
    registerUser,
    verifyEmail,
    loginUser,
    refreshToken,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    getMe,
};
