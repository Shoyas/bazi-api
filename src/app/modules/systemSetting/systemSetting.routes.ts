import express from 'express';
import { SystemSettingController } from './systemSetting.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SystemSettingValidation } from './systemSetting.validation';
import authGuard from '../../middlewares/authGuard';

const router = express.Router();

router.get(
  '/',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  SystemSettingController.getAllSettings
);

router.patch(
  '/:key',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  validateRequest(SystemSettingValidation.updateSystemSettingZodSchema),
  SystemSettingController.updateSetting
);

export const SystemSettingRoutes = router;
