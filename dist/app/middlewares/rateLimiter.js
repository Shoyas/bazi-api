"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6380');
const getLimitByPlan = (plan) => {
    switch (plan) {
        case 'YEARLY':
            return 1000; // 1000 req per min
        case 'MONTHLY':
            return 500; // 500 req per min
        case 'FREE':
        default:
            return 10; // 10 req per min
    }
};
const createRateLimiter = () => {
    return (0, express_rate_limit_1.rateLimit)({
        store: new rate_limit_redis_1.RedisStore({
            // @ts-expect-error - Known issue with rate-limit-redis typing
            sendCommand: (...args) => redisClient.call(...args),
        }),
        windowMs: 60 * 1000, // 1 minute
        max: (req) => {
            const plan = req.apiKeyUser?.plan || 'FREE';
            return getLimitByPlan(plan);
        },
        keyGenerator: (req, res) => {
            // Avoid IPv6 warning by using express-rate-limit's built-in ip fallback or string replacement
            return req.apiKeyUser?.userId || req.ip?.replace(/:/g, '_') || 'unknown';
        },
        handler: (req, res, next, options) => {
            res.status(options.statusCode).json({
                success: false,
                message: 'Too many requests, please try again later or upgrade your plan.',
            });
        },
    });
};
exports.apiRateLimiter = createRateLimiter();
