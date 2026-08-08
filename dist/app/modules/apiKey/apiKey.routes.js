"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const apiKey_controller_1 = require("./apiKey.controller");
const router = express_1.default.Router();
router.post('/generate', (0, authGuard_1.default)(), apiKey_controller_1.ApiKeyController.generateApiKey);
router.get('/', (0, authGuard_1.default)(), apiKey_controller_1.ApiKeyController.getApiKeys);
router.patch('/:keyId/revoke', (0, authGuard_1.default)(), apiKey_controller_1.ApiKeyController.revokeApiKey);
exports.ApiKeyRoutes = router;
