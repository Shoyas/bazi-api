"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const systemSetting_service_1 = require("./systemSetting.service");
const getAllSettings = (0, catchAsync_1.default)(async (req, res) => {
    const result = await systemSetting_service_1.SystemSettingService.getAllSettings();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'System settings retrieved successfully',
        data: result,
    });
});
const updateSetting = (0, catchAsync_1.default)(async (req, res) => {
    const { key } = req.params;
    const result = await systemSetting_service_1.SystemSettingService.updateSetting(key, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'System setting updated successfully',
        data: result,
    });
});
exports.SystemSettingController = {
    getAllSettings,
    updateSetting,
};
