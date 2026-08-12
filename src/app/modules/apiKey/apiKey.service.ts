import httpStatus from 'http-status';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../shared/prisma';
import { AppError } from '../../../errors/AppError';

const generateApiKey = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const activeKeysCount = await prisma.apiKey.count({
    where: { userId, isActive: true },
  });

  const plan = user.subscription?.plan || 'FREE';

  if (plan === 'FREE' && activeKeysCount >= 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Free users can only have 1 active API Key at a time.'
    );
  }

  if ((plan === 'MONTHLY' || plan === 'YEARLY') && activeKeysCount >= 20) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Subscribed users can have a maximum of 20 active API Keys at a time.'
    );
  }

  // Generate a raw API Key
  const rawKey = crypto.randomBytes(32).toString('hex');
  const apiKey = `bazi_${rawKey}`;
  const prefix = apiKey.substring(0, 10);
  
  const keyHash = await bcrypt.hash(apiKey, 10);

  const newKey = await prisma.apiKey.create({
    data: {
      userId,
      prefix,
      keyHash,
      isActive: true,
    },
  });

  return {
    apiKey, // Return this only once!
    id: newKey.id,
    prefix: newKey.prefix,
    createdAt: newKey.createdAt,
  };
};

const getApiKeys = async (userId: string) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      prefix: true,
      isActive: true,
      createdAt: true,
    },
  });
  return keys;
};

const revokeApiKey = async (userId: string, keyId: string) => {
  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) {
    throw new AppError(httpStatus.NOT_FOUND, 'API Key not found');
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false },
  });

  return null;
};

export const ApiKeyService = {
  generateApiKey,
  getApiKeys,
  revokeApiKey,
};
