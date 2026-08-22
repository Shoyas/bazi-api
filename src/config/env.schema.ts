import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('180d'),
  JWT_REFRESH_EXPIRES_IN_SECONDS: z.string().default('15552000'),

  // Redis
  REDIS_URL: z.string().optional(),

  // Lemon Squeezy (Adapting to the existing project)
  LEMONSQUEEZY_API_KEY: z.string().optional(),
  LEMONSQUEEZY_STORE_ID: z.string().optional(),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().optional(),
  LEMONSQUEEZY_VARIANT_BASIC_MONTHLY: z.string().optional(),
  LEMONSQUEEZY_VARIANT_BASIC_YEARLY: z.string().optional(),
  LEMONSQUEEZY_VARIANT_PRO_MONTHLY: z.string().optional(),
  LEMONSQUEEZY_VARIANT_PRO_YEARLY: z.string().optional(),
  LEMONSQUEEZY_VARIANT_PREMIUM_MONTHLY: z.string().optional(),
  LEMONSQUEEZY_VARIANT_PREMIUM_YEARLY: z.string().optional(),
  LEMONSQUEEZY_SUCCESS_URL: z.string().optional(),
  LEMONSQUEEZY_CANCEL_URL: z.string().optional(),

  // SMTP (from existing or provided)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_EMAIL: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_EMAIL_FROM: z.string().optional(),
  SMTP_NAME: z.string().optional(),

  // CORS
  CORS_ORIGINS: z.string().optional(),

  // Admin
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
});

export type Env = z.infer<typeof envSchema>;
