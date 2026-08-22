"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const apiKey_service_1 = require("./apiKey.service");
const generateApiKey = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await apiKey_service_1.ApiKeyService.generateApiKey(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'API Key generated successfully. Save it now, it will not be shown again.',
        data: result,
    });
});
const getApiKeys = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const result = await apiKey_service_1.ApiKeyService.getApiKeys(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'API Keys retrieved successfully',
        data: result,
    });
});
const revokeApiKey = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    const keyId = req.params.keyId;
    const result = await apiKey_service_1.ApiKeyService.revokeApiKey(userId, keyId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'API Key revoked successfully',
        data: result,
    });
});
exports.ApiKeyController = {
    generateApiKey,
    getApiKeys,
    revokeApiKey,
};
