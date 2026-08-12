"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const systemSetting_controller_1 = require("./systemSetting.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const systemSetting_validation_1 = require("./systemSetting.validation");
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const router = express_1.default.Router();
router.get('/', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), systemSetting_controller_1.SystemSettingController.getAllSettings);
router.patch('/:key', (0, authGuard_1.default)('ADMIN', 'SUPER_ADMIN'), (0, validateRequest_1.default)(systemSetting_validation_1.SystemSettingValidation.updateSystemSettingZodSchema), systemSetting_controller_1.SystemSettingController.updateSetting);
exports.SystemSettingRoutes = router;
