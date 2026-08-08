import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { baziValidationSchema } from './bazi.validation';
import { BaziController } from './bazi.controller';

const router = express.Router();

router.post(
  '/calculate',
  validateRequest(baziValidationSchema),
  BaziController.calculateBazi
);

export const BaziRoutes = router;
