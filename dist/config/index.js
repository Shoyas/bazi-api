"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
// Must use require — import statements are hoisted above dotenv.config()
require('dotenv').config({ path: path_1.default.join(process.cwd(), '.env') });
const env_validate_1 = require("./env.validate");
const env = (0, env_validate_1.validateEnv)();
exports.default = {
    node_env: env.NODE_ENV,
    environment: env.NODE_ENV,
    port: env.PORT,
    database_url: env.DATABASE_URL,
    jwt: {
        secret: env.JWT_ACCESS_SECRET,
        expires_in: env.JWT_ACCESS_EXPIRES_IN,
        refresh_secret: env.JWT_REFRESH_SECRET,
        refresh_expires_in: env.JWT_REFRESH_EXPIRES_IN,
        refresh_expires_in_seconds: env.JWT_REFRESH_EXPIRES_IN_SECONDS,
    },
    super_admin: {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
    },
    lemonSqueezy: {
        api_key: env.LEMONSQUEEZY_API_KEY,
        store_id: env.LEMONSQUEEZY_STORE_ID,
        webhook_secret: env.LEMONSQUEEZY_WEBHOOK_SECRET,
        variant_monthly: env.LEMONSQUEEZY_VARIANT_MONTHLY,
        variant_yearly: env.LEMONSQUEEZY_VARIANT_YEARLY,
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
};
