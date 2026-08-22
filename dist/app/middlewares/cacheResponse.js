"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6380');
const cacheResponse = (durationInSeconds) => {
    return async (req, res, next) => {
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
            res.json = (body) => {
                // Cache only successful responses
                if (body && body.success) {
                    redisClient.setex(key, durationInSeconds, JSON.stringify(body)).catch(err => {
                        console.error('Redis Cache Error:', err);
                    });
                }
                return originalJson(body);
            };
            next();
        }
        catch (error) {
            next(); // fallback to normal processing if redis fails
        }
    };
};
exports.default = cacheResponse;
