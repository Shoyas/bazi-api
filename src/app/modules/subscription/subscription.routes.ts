import express from 'express';
import authGuard from '../../middlewares/authGuard';
import { SubscriptionController } from './subscription.controller';

const router = express.Router();

router.post(
  '/checkout',
  authGuard(),
  SubscriptionController.getCheckoutUrl
);

router.get(
  '/portal',
  authGuard(),
  SubscriptionController.getPortalUrl
);

router.post(
  '/auto-renew-pause',
  authGuard(),
  SubscriptionController.cancelSubscription
);

router.post(
  '/resume',
  authGuard(),
  SubscriptionController.resumeSubscription
);

router.get(
  '/my-subscription',
  authGuard(),
  SubscriptionController.getMySubscription
);

router.get(
  '/',
  authGuard('SUPER_ADMIN', 'ADMIN'),
  SubscriptionController.getAllSubscriptions
);

export const SubscriptionRoutes = router;
