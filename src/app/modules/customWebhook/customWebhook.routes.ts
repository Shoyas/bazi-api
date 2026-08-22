import express from 'express';
import authGuard from '../../middlewares/authGuard';
import validateRequest from '../../middlewares/validateRequest';
import { CustomWebhookValidation } from './customWebhook.validation';
import { CustomWebhookController } from './customWebhook.controller';

const router = express.Router();

router.post(
  '/',
  authGuard(),
  validateRequest(CustomWebhookValidation.createWebhookZodSchema),
  CustomWebhookController.createWebhook
);

router.get(
  '/',
  authGuard(),
  CustomWebhookController.getUserWebhooks
);

router.get(
  '/:id',
  authGuard(),
  CustomWebhookController.getWebhookDetails
);

router.patch(
  '/:id',
  authGuard(),
  validateRequest(CustomWebhookValidation.updateWebhookZodSchema),
  CustomWebhookController.updateWebhook
);

router.delete(
  '/:id',
  authGuard(),
  CustomWebhookController.deleteWebhook
);

router.post(
  '/:id/test',
  authGuard(),
  CustomWebhookController.triggerTestWebhook
);

router.get(
  '/:id/logs',
  authGuard(),
  CustomWebhookController.getWebhookDeliveryLogs
);

export const CustomWebhookRoutes = router;
