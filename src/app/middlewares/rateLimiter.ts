import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

const getLimitByPlan = (plan: string) => {
  switch (plan) {
    case 'YEARLY':
      return 1000; // 1000 req per min
    case 'MONTHLY':
      return 500;  // 500 req per min
    case 'FREE':
    default:
      return 10;   // 10 req per min
  }
};

const createRateLimiter = () => {
  return rateLimit({
    store: new RedisStore({
      // @ts-expect-error - Known issue with rate-limit-redis typing
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
    windowMs: 60 * 1000, // 1 minute
    max: (req: Request) => {
      const plan = req.apiKeyUser?.plan || 'FREE';
      return getLimitByPlan(plan);
    },
    keyGenerator: (req: Request, res: Response) => {
      // Avoid IPv6 warning by using express-rate-limit's built-in ip fallback or string replacement
      return req.apiKeyUser?.userId || req.ip?.replace(/:/g, '_') || 'unknown';
    },
    handler: (req: Request, res: Response, next: NextFunction, options) => {
      res.status(options.statusCode).json({
        success: false,
        message: 'Too many requests, please try again later or upgrade your plan.',
      });
    },
  });
};

export const apiRateLimiter = createRateLimiter();
