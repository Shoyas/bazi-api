import config from './index';

/**
 * CORS Strategy for a SaaS API Product
 *
 * There are two types of callers:
 *
 * 1. SERVER-TO-SERVER (n8n, Zapier, Next.js backend, mobile apps)
 *    → CORS does NOT apply (CORS is a browser-only mechanism)
 *    → These routes are protected by API Keys
 *    → We set origin: '*' to avoid blocking legitimate browser clients
 *      who might call directly (e.g., a browser-based playground)
 *
 * 2. BROWSER (Dashboard frontend)
 *    → CORS DOES apply
 *    → These routes are protected by JWT cookies
 *    → We restrict to known dashboard domains only
 */

// Known dashboard/frontend origins (browser-based)
const DASHBOARD_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3333',
  'https://www.skillquix.tech',
  'https://dev.skillquix.tech',
  'https://csuja-nandor.vercel.app',
  'https://csuja-nandor.netlify.app',
];

/**
 * Additional origins injected at runtime via env variable.
 * When you buy a domain, just add it here:
 *   CORS_ORIGINS="https://app.bazisaas.com,https://admin.bazisaas.com"
 */
const getRuntimeOrigins = (): string[] => {
  if (!config.cors.origins) return [];
  return config.cors.origins.split(',').map((o) => o.trim()).filter(Boolean);
};

/**
 * Open CORS — for API Key-protected routes.
 * Used by: POST /api/v1/bazi/calculate
 *
 * Security comes from the API Key, not from the origin.
 * This is the same approach used by Stripe, OpenAI, and Twilio.
 */
export const openCorsOptions = {
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: false, // cannot use credentials: true with origin: '*'
};

/**
 * Restricted CORS — for JWT cookie-protected routes.
 * Used by: /api/v1/auth/*, /api/v1/api-keys/*, /api/v1/subscriptions/*, etc.
 *
 * Only known dashboard frontend domains are allowed.
 */
export const dashboardCorsOptions = {
  origin: [...new Set([...DASHBOARD_ORIGINS, ...getRuntimeOrigins()])],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

/**
 * Default export for backward compatibility.
 * App-level CORS uses the dashboard config.
 * The BaZi route applies openCorsOptions individually.
 */
export default dashboardCorsOptions;
