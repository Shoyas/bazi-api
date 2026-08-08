"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authGuard_1 = __importDefault(require("../../middlewares/authGuard"));
const subscription_controller_1 = require("./subscription.controller");
const router = express_1.default.Router();
router.post('/checkout', (0, authGuard_1.default)(), subscription_controller_1.SubscriptionController.getCheckoutUrl);
exports.SubscriptionRoutes = router;
