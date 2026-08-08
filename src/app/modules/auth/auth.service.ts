import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../shared/prisma';
import { AppError } from '../../../errors/AppError';
import { sendEmail } from '../../../helpers/mailer';
import { ILoginResponse } from './auth.interface';

const registerUser = async (payload: any) => {
  const isExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  const newUser = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  await prisma.otp.create({
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

  await sendEmail(newUser.email, 'Verify your email - BaZi SaaS', emailHtml);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
};

const verifyEmail = async (email: string, otpCode: string) => {
  const otpRecord = await prisma.otp.findFirst({
    where: { 
      email, 
      otp: otpCode,
      isUsed: false,
    },
  });

  if (!otpRecord) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid OTP');
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'OTP has expired');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email already verified');
  }

  // Mark OTP as used and verify user
  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    }),
    prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
      },
    }),
    prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
      },
    }),
  ]);

  return null;
};

const loginUser = async (payload: any): Promise<ILoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.isEmailVerified) {
    throw new AppError(httpStatus.FORBIDDEN, 'Please verify your email first');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

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

export const AuthService = {
  registerUser,
  verifyEmail,
  loginUser,
};
