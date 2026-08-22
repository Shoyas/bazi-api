import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../errors/AppError';
import { getSystemSetting } from '../../shared/getSystemSetting';

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

      if (validKey.user.status === 'blocked' || validKey.user.isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'User account is disabled or blocked. Please contact support.');
      }

      const plan = validKey.user.subscription?.plan || 'FREE';

      // Auto-revoke FREE user API keys after dynamic expiry days
      if (plan === 'FREE') {
        const expiryDaysStr = await getSystemSetting('free_api_key_expiry_days', '30');
        const expiryDays = parseInt(expiryDaysStr, 10) || 30;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - expiryDays);
        
        if (validKey.createdAt < cutoffDate) {
          // Deactivate it in DB
          await prisma.apiKey.update({
            where: { id: validKey.id },
            data: { isActive: false }
          });
          throw new AppError(httpStatus.UNAUTHORIZED, `Your API Key has expired (${expiryDays} days limit for FREE users). Please generate a new one.`);
        }
      }

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
