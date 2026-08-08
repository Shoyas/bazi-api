"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const subscription_service_1 = require("./subscription.service");
const getCheckoutUrl = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const { plan } = req.body;
    const result = await subscription_service_1.SubscriptionService.getCheckoutUrl(userId, plan);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Checkout URL generated successfully',
        data: result,
    });
});
exports.SubscriptionController = {
    getCheckoutUrl,
};
