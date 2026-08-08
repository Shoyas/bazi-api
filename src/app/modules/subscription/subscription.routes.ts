import express from 'express';
import authGuard from '../../middlewares/authGuard';
import { SubscriptionController } from './subscription.controller';

const router = express.Router();

router.post(
  '/checkout',
  authGuard(),
  SubscriptionController.getCheckoutUrl
);

export const SubscriptionRoutes = router;
