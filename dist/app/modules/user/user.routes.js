"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get('/', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), user_controller_1.UserController.getAllUsers);
router.get('/:id', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), user_controller_1.UserController.getUserDetails);
router.patch('/:id/status', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), (0, validateRequest_1.default)(user_validation_1.UserValidation.updateUserStatusZodSchema), user_controller_1.UserController.updateUserStatus);
router.post('/bulk-soft-delete', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), (0, validateRequest_1.default)(user_validation_1.UserValidation.bulkSoftDeleteZodSchema), user_controller_1.UserController.bulkSoftDelete);
exports.UserRoutes = router;
