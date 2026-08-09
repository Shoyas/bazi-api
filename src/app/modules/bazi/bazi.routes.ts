import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { baziValidationSchema } from './bazi.validation';
import { BaziController } from './bazi.controller';

import apiKeyGuard from '../../middlewares/apiKeyGuard';
import { apiRateLimiter, checkRateLimitBlock } from '../../middlewares/rateLimiter';
import cacheResponse from '../../middlewares/cacheResponse';

const router = express.Router();

router.post(
  '/calculate',
  apiKeyGuard(),
  checkRateLimitBlock,
  apiRateLimiter,
  validateRequest(baziValidationSchema),
  cacheResponse(3600), // Cache for 1 hour
  BaziController.calculateBazi
);

export const BaziRoutes = router;
