"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWebhookService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../shared/prisma");
const AppError_1 = require("../../../errors/AppError");
const webhook_queue_1 = require("../../../queues/webhook.queue");
const PLAN_WEBHOOK_LIMITS = {
    FREE: 0,
    BASIC: 0,
    PRO: 3,
    PREMIUM: 10,
};
/**
 * Create a new custom outbound webhook endpoint
 */
const createWebhook = async (userId, payload) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const plan = user.subscription?.plan || 'FREE';
    const isPrivileged = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    if (!isPrivileged && plan !== 'PRO' && plan !== 'PREMIUM') {
        throw new AppError_1.AppError(http_status_1.default.FORBIDDEN, 'Custom Webhook feature is available exclusively for PRO and PREMIUM plans. Please upgrade your subscription.');
    }
    const maxLimit = isPrivileged ? 20 : PLAN_WEBHOOK_LIMITS[plan] ?? 0;
    const currentCount = await prisma_1.prisma.webhookSubscription.count({
        where: { userId },
    });
    if (currentCount >= maxLimit) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, `Your ${plan} plan allows a maximum of ${maxLimit} active webhook endpoint(s). Please remove an existing webhook or upgrade your plan.`);
    }
    // Generate a random 32-byte secret for HMAC verification
    const secret = `whsec_${crypto_1.default.randomBytes(24).toString('hex')}`;
    const newWebhook = await prisma_1.prisma.webhookSubscription.create({
        data: {
            userId,
            url: payload.url,
            description: payload.description || null,
            events: payload.events,
            secret,
            isActive: true,
        },
    });
    return newWebhook;
};
/**
 * Get all webhook endpoints for the authenticated user
 */
const getUserWebhooks = async (userId) => {
    const webhooks = await prisma_1.prisma.webhookSubscription.findMany({
        where: { userId },
        include: {
            _count: {
                select: { logs: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return webhooks;
};
/**
 * Get details and recent delivery logs for a specific webhook
 */
const getWebhookDetails = async (userId, webhookId) => {
    const webhook = await prisma_1.prisma.webhookSubscription.findFirst({
        where: { id: webhookId, userId },
        include: {
            logs: {
                take: 20,
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    if (!webhook) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Webhook endpoint not found');
    }
    return webhook;
};
/**
 * Update an existing webhook endpoint
 */
const updateWebhook = async (userId, webhookId, payload) => {
    const existing = await prisma_1.prisma.webhookSubscription.findFirst({
        where: { id: webhookId, userId },
    });
    if (!existing) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Webhook endpoint not found');
    }
    const updated = await prisma_1.prisma.webhookSubscription.update({
        where: { id: webhookId },
        data: {
            url: payload.url ?? existing.url,
            description: payload.description !== undefined ? payload.description : existing.description,
            events: payload.events ?? existing.events,
            isActive: payload.isActive !== undefined ? payload.isActive : existing.isActive,
        },
    });
    return updated;
};
/**
 * Delete a webhook endpoint
 */
const deleteWebhook = async (userId, webhookId) => {
    const existing = await prisma_1.prisma.webhookSubscription.findFirst({
        where: { id: webhookId, userId },
    });
    if (!existing) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Webhook endpoint not found');
    }
    await prisma_1.prisma.webhookSubscription.delete({
        where: { id: webhookId },
    });
    return { message: 'Webhook endpoint deleted successfully' };
};
/**
 * Trigger an immediate test ping event to the specified webhook
 */
const triggerTestWebhook = async (userId, webhookId) => {
    const webhook = await prisma_1.prisma.webhookSubscription.findFirst({
        where: { id: webhookId, userId },
    });
    if (!webhook) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Webhook endpoint not found');
    }
    const testPayload = {
        event: 'test.ping',
        timestamp: new Date().toISOString(),
        data: {
            message: 'This is a live test ping from BaZi API Webhook System.',
            webhookId: webhook.id,
            endpointUrl: webhook.url,
            sampleChart: {
                yearPillar: 'Jia Chen (Wood Dragon)',
                monthPillar: 'Bing Yin (Fire Tiger)',
                dayPillar: 'Gui Mao (Water Rabbit)',
                hourPillar: 'Ding Si (Fire Snake)',
            },
        },
    };
    await webhook_queue_1.webhookQueue.add('dispatch-webhook', {
        subscriptionId: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        payload: testPayload,
    }, {
        jobId: `test-ping-${webhook.id}-${Date.now()}`,
    });
    return {
        message: 'Test ping event enqueued for delivery. Check your endpoint and delivery logs shortly.',
    };
};
/**
 * Get delivery logs for a specific webhook
 */
const getWebhookDeliveryLogs = async (userId, webhookId) => {
    const webhook = await prisma_1.prisma.webhookSubscription.findFirst({
        where: { id: webhookId, userId },
    });
    if (!webhook) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Webhook endpoint not found');
    }
    const logs = await prisma_1.prisma.webhookDeliveryLog.findMany({
        where: { subscriptionId: webhookId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });
    return logs;
};
exports.CustomWebhookService = {
    createWebhook,
    getUserWebhooks,
    getWebhookDetails,
    updateWebhook,
    deleteWebhook,
    triggerTestWebhook,
    getWebhookDeliveryLogs,
};
