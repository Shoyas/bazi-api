"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = exports.checkRateLimitBlock = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("../../shared/redis");
const getSystemSetting_1 = require("../../shared/getSystemSetting");
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
const getUserIdOrIp = (req) => {
    if (req.apiKeyUser?.userId) {
        return req.apiKeyUser.userId;
    }
    return req.ip ? (0, express_rate_limit_1.ipKeyGenerator)(req.ip) : 'unknown';
};
const checkRateLimitBlock = async (req, res, next) => {
    try {
        const key = getUserIdOrIp(req);
        const isBlocked = await redis_1.redisClient.get(`rate_blocked_${key}`);
        if (isBlocked) {
            const ttl = await redis_1.redisClient.ttl(`rate_blocked_${key}`);
            const minutesLeft = Math.max(1, Math.ceil(ttl / 60));
            res.status(429).json({
                success: false,
                message: `Too many requests. You are blocked for another ${minutesLeft} minute(s).`,
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkRateLimitBlock = checkRateLimitBlock;
const createRateLimiter = () => {
    return (0, express_rate_limit_1.rateLimit)({
        store: new rate_limit_redis_1.RedisStore({
            // @ts-expect-error - Known issue with rate-limit-redis typing
            sendCommand: (...args) => redis_1.redisClient.call(...args),
        }),
        windowMs: 60 * 1000, // 1 minute window for rate limiting calculation
        max: (req) => {
            const plan = req.apiKeyUser?.plan || 'FREE';
            return getLimitByPlan(plan);
        },
        keyGenerator: (req, res) => {
            return getUserIdOrIp(req);
        },
        handler: async (req, res, next, options) => {
            try {
                const key = getUserIdOrIp(req);
                // Fetch dynamic block minutes from System Settings (default 15)
                const blockMinutesStr = await (0, getSystemSetting_1.getSystemSetting)('rate_limit_block_minutes', '15');
                const blockMinutes = parseInt(blockMinutesStr, 10) || 15;
                // Set block flag in Redis for X minutes
                await redis_1.redisClient.setex(`rate_blocked_${key}`, blockMinutes * 60, '1');
                res.status(429).json({
                    success: false,
                    message: `Rate limit exceeded. You have been blocked for ${blockMinutes} minutes.`,
                });
            }
            catch (error) {
                next(error);
            }
        },
    });
};
exports.apiRateLimiter = createRateLimiter();
