"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaziRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const bazi_validation_1 = require("./bazi.validation");
const bazi_controller_1 = require("./bazi.controller");
const router = express_1.default.Router();
router.post('/calculate', (0, validateRequest_1.default)(bazi_validation_1.baziValidationSchema), bazi_controller_1.BaziController.calculateBazi);
exports.BaziRoutes = router;
