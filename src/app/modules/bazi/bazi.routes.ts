import express from 'express';
import cors from 'cors';
import validateRequest from '../../middlewares/validateRequest';
import { baziValidationSchema } from './bazi.validation';
import { BaziController } from './bazi.controller';

import apiKeyGuard from '../../middlewares/apiKeyGuard';
import { apiRateLimiter, checkRateLimitBlock } from '../../middlewares/rateLimiter';
import cacheResponse from '../../middlewares/cacheResponse';
import { openCorsOptions } from '../../../config/cors';

const router = express.Router();

router.post(
  '/calculate',
  cors(openCorsOptions),   // Open CORS — security is enforced by API Key below
  apiKeyGuard(),
  checkRateLimitBlock,
  apiRateLimiter,
  validateRequest(baziValidationSchema),
  cacheResponse(3600), // Cache for 1 hour
  BaziController.calculateBazi
);

export const BaziRoutes = router;
