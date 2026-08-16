"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../shared/prisma");
const AppError_1 = require("../../errors/AppError");
const getSystemSetting_1 = require("../../shared/getSystemSetting");
const apiKeyGuard = () => {
    return async (req, res, next) => {
        try {
            const apiKeyHeader = req.headers['x-api-key'];
            if (!apiKeyHeader) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'API Key is missing');
            }
            if (!apiKeyHeader.startsWith('bazi_')) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid API Key format');
            }
            const prefix = apiKeyHeader.substring(0, 10);
            const keys = await prisma_1.prisma.apiKey.findMany({
                where: { prefix, isActive: true },
                include: { user: { include: { subscription: true } } },
            });
            if (keys.length === 0) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid or revoked API Key');
            }
            let validKey = null;
            for (const key of keys) {
                const isMatched = await bcryptjs_1.default.compare(apiKeyHeader, key.keyHash);
                if (isMatched) {
                    validKey = key;
                    break;
                }
            }
            if (!validKey) {
                throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, 'Invalid API Key');
            }
            if (validKey.user.status === 'blocked' || validKey.user.isDeleted) {
                throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, 'User account is disabled or blocked. Please contact support.');
            }
            const plan = validKey.user.subscription?.plan || 'FREE';
            // Auto-revoke FREE user API keys after dynamic expiry days
            if (plan === 'FREE') {
                const expiryDaysStr = await (0, getSystemSetting_1.getSystemSetting)('free_api_key_expiry_days', '30');
                const expiryDays = parseInt(expiryDaysStr, 10) || 30;
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - expiryDays);
                if (validKey.createdAt < cutoffDate) {
                    // Deactivate it in DB
                    await prisma_1.prisma.apiKey.update({
                        where: { id: validKey.id },
                        data: { isActive: false }
                    });
                    throw new AppError_1.AppError(http_status_1.default.UNAUTHORIZED, `Your API Key has expired (${expiryDays} days limit for FREE users). Please generate a new one.`);
                }
            }
            req.apiKeyUser = {
                userId: validKey.userId,
                plan,
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.default = apiKeyGuard;
