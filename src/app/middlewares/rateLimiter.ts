import { Request, Response, NextFunction } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../../shared/redis';
import { getSystemSetting } from '../../shared/getSystemSetting';

const getLimitByPlan = (plan: string) => {
  switch (plan) {
    case 'PREMIUM':
      return 1000;
    case 'PRO':
      return 500;
    case 'BASIC':
      return 300;
    case 'FREE':
    default:
      return 30;
  }
};

const getUserIdOrIp = (req: Request) => {
  if (req.apiKeyUser?.userId) {
    return req.apiKeyUser.userId;
  }
  return req.ip ? ipKeyGenerator(req.ip) : 'unknown';
};

export const checkRateLimitBlock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = getUserIdOrIp(req);
    const isBlocked = await redisClient.get(`rate_blocked_${key}`);
    
    if (isBlocked) {
      const ttl = await redisClient.ttl(`rate_blocked_${key}`);
      const minutesLeft = Math.max(1, Math.ceil(ttl / 60));
      res.status(429).json({
        success: false,
        message: `Too many requests. You are blocked for another ${minutesLeft} minute(s).`,
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

const createRateLimiter = () => {
  return rateLimit({
    store: new RedisStore({
      // @ts-expect-error - Known issue with rate-limit-redis typing
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    windowMs: 60 * 1000, // 1 minute window for rate limiting calculation
    max: (req: Request) => {
      const plan = req.apiKeyUser?.plan || 'FREE';
      return getLimitByPlan(plan);
    },
    keyGenerator: (req: Request, res: Response) => {
      return getUserIdOrIp(req);
    },
    handler: async (req: Request, res: Response, next: NextFunction, options) => {
      try {
        const key = getUserIdOrIp(req);
        
        // Fetch dynamic block minutes from System Settings (default 15)
        const blockMinutesStr = await getSystemSetting('rate_limit_block_minutes', '15');
        const blockMinutes = parseInt(blockMinutesStr, 10) || 15;
        
        // Set block flag in Redis for X minutes
        await redisClient.setex(`rate_blocked_${key}`, blockMinutes * 60, '1');

        res.status(429).json({
          success: false,
          message: `Rate limit exceeded. You have been blocked for ${blockMinutes} minutes.`,
        });
      } catch (error) {
        next(error);
      }
    },
  });
};

export const apiRateLimiter = createRateLimiter();
