"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const auth_validation_1 = require("./auth.validation");
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post('/register', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.registerZodSchema), auth_controller_1.AuthController.registerUser);
router.post('/verify-email', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.verifyEmailZodSchema), auth_controller_1.AuthController.verifyEmail);
router.post('/login', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.loginZodSchema), auth_controller_1.AuthController.loginUser);
router.post('/refresh-token', auth_controller_1.AuthController.refreshToken);
router.post('/forgot-password', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.forgotPasswordZodSchema), auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', (0, validateRequest_1.default)(auth_validation_1.AuthValidation.resetPasswordZodSchema), auth_controller_1.AuthController.resetPassword);
// Protected routes
router.post('/change-password', (0, authGuard_1.default)(), (0, validateRequest_1.default)(auth_validation_1.AuthValidation.changePasswordZodSchema), auth_controller_1.AuthController.changePassword);
router.get('/me', (0, authGuard_1.default)(), auth_controller_1.AuthController.getMe);
router.post('/logout', (0, authGuard_1.default)(), auth_controller_1.AuthController.logout);
exports.AuthRoutes = router;
