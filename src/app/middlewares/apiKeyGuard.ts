import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../errors/AppError';

const apiKeyGuard = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKeyHeader = req.headers['x-api-key'] as string;

      if (!apiKeyHeader) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'API Key is missing');
      }

      if (!apiKeyHeader.startsWith('bazi_')) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid API Key format');
      }

      const prefix = apiKeyHeader.substring(0, 10);
      
      const keys = await prisma.apiKey.findMany({
        where: { prefix, isActive: true },
        include: { user: { include: { subscription: true } } },
      });

      if (keys.length === 0) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or revoked API Key');
      }

      let validKey = null;

      for (const key of keys) {
        const isMatched = await bcrypt.compare(apiKeyHeader, key.keyHash);
        if (isMatched) {
          validKey = key;
          break;
        }
      }

      if (!validKey) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid API Key');
      }

      const plan = validKey.user.subscription?.plan || 'FREE';

      req.apiKeyUser = {
        userId: validKey.userId,
        plan,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default apiKeyGuard;
