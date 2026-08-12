import path from 'path';

// Must use require — import statements are hoisted above dotenv.config()
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

import { validateEnv } from './env.validate';

const env = validateEnv();

export default {
  node_env: env.NODE_ENV,
  environment: env.NODE_ENV,
  port: env.PORT,
  database_url: env.DATABASE_URL,

  jwt: {
    secret: env.JWT_ACCESS_SECRET,
    expires_in: env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: env.JWT_REFRESH_SECRET,
    refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
    refresh_expires_in_seconds: parseInt(env.JWT_REFRESH_EXPIRES_IN_SECONDS, 10),
  },

  super_admin: {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  },

  lemonSqueezy: {
    api_key: env.LEMONSQUEEZY_API_KEY,
    store_id: env.LEMONSQUEEZY_STORE_ID,
    webhook_secret: env.LEMONSQUEEZY_WEBHOOK_SECRET,
    variant_basic_monthly: env.LEMONSQUEEZY_VARIANT_BASIC_MONTHLY,
    variant_basic_yearly: env.LEMONSQUEEZY_VARIANT_BASIC_YEARLY,
    variant_pro_monthly: env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY,
    variant_pro_yearly: env.LEMONSQUEEZY_VARIANT_PRO_YEARLY,
    variant_premium_monthly: env.LEMONSQUEEZY_VARIANT_PREMIUM_MONTHLY,
    variant_premium_yearly: env.LEMONSQUEEZY_VARIANT_PREMIUM_YEARLY,
    success_url: env.LEMONSQUEEZY_SUCCESS_URL,
    cancel_url: env.LEMONSQUEEZY_CANCEL_URL,
  },

  smtp: {
    email: env.SMTP_EMAIL,
    pass: env.SMTP_PASS,
    email_from: env.SMTP_EMAIL_FROM,
    host: env.SMTP_HOST,
    name: env.SMTP_NAME,
    port: env.SMTP_PORT,
  },

  redis: {
    url: env.REDIS_URL,
  },

  cors: {
    origins: env.CORS_ORIGINS,
  },
};
