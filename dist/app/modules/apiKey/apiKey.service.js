"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../shared/prisma");
const AppError_1 = require("../../../errors/AppError");
const generateApiKey = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const activeKeysCount = await prisma_1.prisma.apiKey.count({
        where: { userId, isActive: true },
    });
    const plan = user.subscription?.plan || 'FREE';
    if (plan === 'FREE' && activeKeysCount >= 1) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Free users can only have 1 active API Key at a time.');
    }
    if ((plan === 'MONTHLY' || plan === 'YEARLY') && activeKeysCount >= 20) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Subscribed users can have a maximum of 20 active API Keys at a time.');
    }
    // Generate a raw API Key
    const rawKey = crypto_1.default.randomBytes(32).toString('hex');
    const apiKey = `bazi_${rawKey}`;
    const prefix = apiKey.substring(0, 10);
    const keyHash = await bcryptjs_1.default.hash(apiKey, 10);
    const newKey = await prisma_1.prisma.apiKey.create({
        data: {
            userId,
            prefix,
            keyHash,
            isActive: true,
        },
    });
    return {
        apiKey, // Return this only once!
        id: newKey.id,
        prefix: newKey.prefix,
        createdAt: newKey.createdAt,
    };
};
const getApiKeys = async (userId) => {
    const keys = await prisma_1.prisma.apiKey.findMany({
        where: { userId },
        select: {
            id: true,
            prefix: true,
            isActive: true,
            createdAt: true,
        },
    });
    return keys;
};
const revokeApiKey = async (userId, keyId) => {
    const key = await prisma_1.prisma.apiKey.findFirst({
        where: { id: keyId, userId },
    });
    if (!key) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'API Key not found');
    }
    await prisma_1.prisma.apiKey.update({
        where: { id: keyId },
        data: { isActive: false },
    });
    return null;
};
exports.ApiKeyService = {
    generateApiKey,
    getApiKeys,
    revokeApiKey,
};
