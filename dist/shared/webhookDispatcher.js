"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchWebhookEvent = void 0;
const prisma_1 = require("./prisma");
const webhook_queue_1 = require("../queues/webhook.queue");
/**
 * Dispatch an outbound webhook event to all subscribed active endpoints
 *
 * @param event The webhook event identifier
 * @param data The payload data associated with this event
 * @param targetUserId Optional user ID to target a specific user (e.g. for user-specific alerts or test pings)
 */
const dispatchWebhookEvent = async (event, data, targetUserId) => {
    try {
        const whereCondition = {
            isActive: true,
            events: {
                has: event,
            },
            user: {
                status: { not: 'blocked' },
                isDeleted: false,
            },
        };
        if (targetUserId) {
            whereCondition.userId = targetUserId;
        }
        const subscriptions = await prisma_1.prisma.webhookSubscription.findMany({
            where: whereCondition,
        });
        if (subscriptions.length === 0) {
            return { dispatchedCount: 0 };
        }
        const timestamp = new Date().toISOString();
        const payload = {
            event,
            timestamp,
            data,
        };
        const jobs = subscriptions.map((sub) => ({
            name: 'dispatch-webhook',
            data: {
                subscriptionId: sub.id,
                url: sub.url,
                secret: sub.secret,
                payload,
            },
            opts: {
                jobId: `webhook-${sub.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            },
        }));
        await webhook_queue_1.webhookQueue.addBulk(jobs);
        console.log(`[Webhook Dispatcher] Enqueued ${jobs.length} delivery job(s) for event: ${event}`);
        return { dispatchedCount: jobs.length };
    }
    catch (error) {
        console.error(`[Webhook Dispatcher] Failed to dispatch event ${event}:`, error);
        return { dispatchedCount: 0 };
    }
};
exports.dispatchWebhookEvent = dispatchWebhookEvent;
