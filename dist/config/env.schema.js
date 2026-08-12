"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string(),
    // Auth
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('180d'),
    JWT_REFRESH_EXPIRES_IN_SECONDS: zod_1.z.string().default('15552000'),
    // Redis
    REDIS_URL: zod_1.z.string().optional(),
    // Lemon Squeezy (Adapting to the existing project)
    LEMONSQUEEZY_API_KEY: zod_1.z.string().optional(),
    LEMONSQUEEZY_STORE_ID: zod_1.z.string().optional(),
    LEMONSQUEEZY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_BASIC_MONTHLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_BASIC_YEARLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_PRO_MONTHLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_PRO_YEARLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_PREMIUM_MONTHLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_VARIANT_PREMIUM_YEARLY: zod_1.z.string().optional(),
    LEMONSQUEEZY_SUCCESS_URL: zod_1.z.string().optional(),
    LEMONSQUEEZY_CANCEL_URL: zod_1.z.string().optional(),
    // SMTP (from existing or provided)
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_EMAIL: zod_1.z.string().email().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    SMTP_EMAIL_FROM: zod_1.z.string().optional(),
    SMTP_NAME: zod_1.z.string().optional(),
    // CORS
    CORS_ORIGINS: zod_1.z.string().optional(),
    // Admin
    ADMIN_EMAIL: zod_1.z.string().email(),
    ADMIN_PASSWORD: zod_1.z.string().min(6),
});
