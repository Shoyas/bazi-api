"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWebhookController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const customWebhook_service_1 = require("./customWebhook.service");
const createWebhook = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await customWebhook_service_1.CustomWebhookService.createWebhook(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Custom webhook endpoint registered successfully.',
        data: result,
    });
});
const getUserWebhooks = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await customWebhook_service_1.CustomWebhookService.getUserWebhooks(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Webhook endpoints retrieved successfully.',
        data: result,
    });
});
const getWebhookDetails = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const id = req.params.id;
    const result = await customWebhook_service_1.CustomWebhookService.getWebhookDetails(userId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Webhook details retrieved successfully.',
        data: result,
    });
});
const updateWebhook = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const id = req.params.id;
    const result = await customWebhook_service_1.CustomWebhookService.updateWebhook(userId, id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Webhook endpoint updated successfully.',
        data: result,
    });
});
const deleteWebhook = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const id = req.params.id;
    const result = await customWebhook_service_1.CustomWebhookService.deleteWebhook(userId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Webhook endpoint deleted successfully.',
        data: result,
    });
});
const triggerTestWebhook = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const id = req.params.id;
    const result = await customWebhook_service_1.CustomWebhookService.triggerTestWebhook(userId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Test ping event dispatched.',
        data: result,
    });
});
const getWebhookDeliveryLogs = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const id = req.params.id;
    const result = await customWebhook_service_1.CustomWebhookService.getWebhookDeliveryLogs(userId, id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Webhook delivery logs retrieved successfully.',
        data: result,
    });
});
exports.CustomWebhookController = {
    createWebhook,
    getUserWebhooks,
    getWebhookDetails,
    updateWebhook,
    deleteWebhook,
    triggerTestWebhook,
    getWebhookDeliveryLogs,
};
