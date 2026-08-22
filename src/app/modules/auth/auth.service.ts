import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../shared/prisma';
import { redisClient } from '../../../shared/redis';
import { AppError } from '../../../errors/AppError';
import { sendEmail } from '../../../helpers/mailer';
import { ILoginResponse } from './auth.interface';
import config from '../../../config';

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

  if (user.status === 'blocked' || user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account has been disabled or blocked. Please contact support.');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expires_in as any }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwt.refresh_secret,
    { expiresIn: config.jwt.refresh_expires_in as any }
  );

  // Store refresh token in Redis set
  await redisClient.sadd(`user:${user.id}:refreshTokens`, refreshToken);
  // Set expiry on the individual refresh token string key
  const refreshExpirySeconds = config.jwt.refresh_expires_in_seconds;
  await redisClient.setex(`rt:${refreshToken}`, refreshExpirySeconds, user.id);
  // Also add to set for easy revocation
  await redisClient.sadd(`user:${user.id}:refreshTokens`, `rt:${refreshToken}`);

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

const refreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(token, config.jwt.refresh_secret);
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired refresh token');
  }

  const userId = decoded.userId;

  // Check if token exists in Redis (hasn't been revoked)
  const exists = await redisClient.get(`rt:${token}`);
  if (!exists) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Refresh token has been revoked or is invalid');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expires_in as any }
  );

  return { accessToken };
};

const logout = async (token: string, userId: string) => {
  await redisClient.del(`rt:${token}`);
  await redisClient.srem(`user:${userId}:refreshTokens`, `rt:${token}`);
  return null;
};

const revokeAllUserTokens = async (userId: string) => {
  // Get all refresh tokens for user
  const tokens = await redisClient.smembers(`user:${userId}:refreshTokens`);
  if (tokens.length > 0) {
    await redisClient.del(...tokens); // Delete the individual token keys
  }
  await redisClient.del(`user:${userId}:refreshTokens`); // Delete the set
};

const changePassword = async (userId: string, payload: any) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }

  const newHashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword },
  });

  // Strict token revocation
  await revokeAllUserTokens(userId);

  return null;
};

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.create({
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

  await sendEmail(email, 'Password Reset - BaZi SaaS', emailHtml);

  return null;
};

const resetPassword = async (payload: any) => {
  const otpRecord = await prisma.otp.findFirst({
    where: { 
      email: payload.email, 
      otp: payload.otp,
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
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const newHashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.$transaction([
    prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword },
    })
  ]);

  // Strict token revocation
  await revokeAllUserTokens(user.id);

  return null;
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
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
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export const AuthService = {
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
