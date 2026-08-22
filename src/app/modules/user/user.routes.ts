import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import authGuard from '../../middlewares/authGuard';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get(
  '/',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  UserController.getAllUsers
);

router.get(
  '/:id',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  UserController.getUserDetails
);

router.patch(
  '/:id/status',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  validateRequest(UserValidation.updateUserStatusZodSchema),
  UserController.updateUserStatus
);

router.post(
  '/bulk-soft-delete',
  authGuard('ADMIN', 'SUPER_ADMIN'),
  validateRequest(UserValidation.bulkSoftDeleteZodSchema),
  UserController.bulkSoftDelete
);

export const UserRoutes = router;
