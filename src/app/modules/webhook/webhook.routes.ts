import express from 'express';
import { WebhookController } from './webhook.controller';

const router = express.Router();

// Lemon Squeezy Webhooks need the raw body to verify the signature
router.post(
  '/lemonsqueezy',
  express.raw({ type: 'application/json' }),
  WebhookController.handleLemonSqueezyWebhook
);

export const WebhookRoutes = router;
