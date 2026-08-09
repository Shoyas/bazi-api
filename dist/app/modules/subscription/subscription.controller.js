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
const cancelSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await subscription_service_1.SubscriptionService.cancelUserSubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});
const resumeSubscription = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await subscription_service_1.SubscriptionService.resumeUserSubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result.subscription,
    });
});
const getPortalUrl = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await subscription_service_1.SubscriptionService.getCustomerPortalUrl(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Customer portal URL retrieved successfully',
        data: result,
    });
});
const getMySubscription = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await subscription_service_1.SubscriptionService.getMySubscription(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription retrieved successfully',
        data: result,
    });
});
const getAllSubscriptions = (0, catchAsync_1.default)(async (req, res) => {
    const result = await subscription_service_1.SubscriptionService.getAllSubscriptions();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All subscriptions retrieved successfully',
        data: result,
    });
});
exports.SubscriptionController = {
    getCheckoutUrl,
    cancelSubscription,
    resumeSubscription,
    getPortalUrl,
    getMySubscription,
    getAllSubscriptions,
};
