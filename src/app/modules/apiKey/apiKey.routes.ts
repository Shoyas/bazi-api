import express from 'express';
import authGuard from '../../middlewares/authGuard';
import { ApiKeyController } from './apiKey.controller';

const router = express.Router();

router.post(
  '/generate',
  authGuard(),
  ApiKeyController.generateApiKey
);

router.get(
  '/',
  authGuard(),
  ApiKeyController.getApiKeys
);

router.patch(
  '/:keyId/revoke',
  authGuard(),
  ApiKeyController.revokeApiKey
);

export const ApiKeyRoutes = router;
