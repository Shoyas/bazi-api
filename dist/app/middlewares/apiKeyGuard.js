"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../shared/prisma");
const AppError_1 = require("../../errors/AppError");
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
            const plan = validKey.user.subscription?.plan || 'FREE';
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
