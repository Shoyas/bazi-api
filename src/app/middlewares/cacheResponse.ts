import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6380');

const cacheResponse = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET or POST (if payload is part of cache key)
    if (req.method !== 'GET' && req.method !== 'POST') {
      return next();
    }

    // Construct a unique cache key based on URL, method, and body (for POST)
    const key = `cache:${req.originalUrl}:${JSON.stringify(req.body)}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Cache only successful responses
        if (body && body.success) {
          redisClient.setex(key, durationInSeconds, JSON.stringify(body)).catch(err => {
            console.error('Redis Cache Error:', err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      next(); // fallback to normal processing if redis fails
    }
  };
};

export default cacheResponse;
