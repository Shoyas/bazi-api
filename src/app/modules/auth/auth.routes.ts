import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import authGuard from '../../middlewares/authGuard';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerZodSchema),
  AuthController.registerUser
);

router.post(
  '/verify-email',
  validateRequest(AuthValidation.verifyEmailZodSchema),
  AuthController.verifyEmail
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginZodSchema),
  AuthController.loginUser
);

router.post(
  '/refresh-token',
  AuthController.refreshToken
);

router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordZodSchema),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordZodSchema),
  AuthController.resetPassword
);

// Protected routes
router.post(
  '/change-password',
  authGuard(),
  validateRequest(AuthValidation.changePasswordZodSchema),
  AuthController.changePassword
);

router.get(
  '/me',
  authGuard(),
  AuthController.getMe
);

router.post(
  '/logout',
  authGuard(),
  AuthController.logout
);

export const AuthRoutes = router;
