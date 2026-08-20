"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookWorker = void 0;
const bullmq_1 = require("bullmq");
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../queues/connection");
const prisma_1 = require("../shared/prisma");
exports.webhookWorker = new bullmq_1.Worker('webhook-queue', async (job) => {
    const { subscriptionId, url, secret, payload } = job.data;
    const currentAttempt = job.attemptsMade + 1;
    console.log(`[Webhook Worker] Processing job ${job.id} (Attempt ${currentAttempt}): Dispatching ${payload.event} to ${url}`);
    const rawBody = JSON.stringify(payload);
    const signature = crypto_1.default
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');
    let statusCode = 0;
    let responseBody = '';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bazi-event': payload.event,
                'x-bazi-signature': signature,
                'x-bazi-timestamp': payload.timestamp,
                'User-Agent': 'BaZi-Webhook-Dispatcher/1.0',
            },
            body: rawBody,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        statusCode = response.status;
        const text = await response.text();
        responseBody = text.substring(0, 1000);
        if (response.ok) {
            // Log success in WebhookDeliveryLog
            await prisma_1.prisma.webhookDeliveryLog.create({
                data: {
                    subscriptionId,
                    event: payload.event,
                    payload: payload,
                    statusCode,
                    responseBody,
                    attempt: currentAttempt,
                    status: 'success',
                },
            });
            console.log(`[Webhook Worker] Successfully delivered ${payload.event} to ${url} (Status: ${statusCode})`);
        }
        else {
            throw new Error(`HTTP Error ${statusCode}: ${responseBody}`);
        }
    }
    catch (error) {
        if (statusCode === 0) {
            statusCode = 500;
        }
        if (!responseBody) {
            responseBody = error.message || 'Network/Timeout error';
        }
        const isFinalAttempt = currentAttempt >= (job.opts.attempts || 3);
        const deliveryStatus = isFinalAttempt ? 'failed' : 'retrying';
        // Record delivery attempt failure in DB
        try {
            await prisma_1.prisma.webhookDeliveryLog.create({
                data: {
                    subscriptionId,
                    event: payload.event,
                    payload: payload,
                    statusCode,
                    responseBody: responseBody.substring(0, 1000),
                    attempt: currentAttempt,
                    status: deliveryStatus,
                },
            });
        }
        catch (logErr) {
            console.error('[Webhook Worker] Error logging delivery failure:', logErr);
        }
        console.error(`[Webhook Worker] Delivery attempt ${currentAttempt} failed for ${url} (Status: ${statusCode}): ${error.message}`);
        throw error; // Propagate error so BullMQ triggers retry
    }
}, { connection: connection_1.connection });
exports.webhookWorker.on('completed', (job) => {
    console.log(`[Webhook Worker] Job ${job.id} completed successfully.`);
});
exports.webhookWorker.on('failed', (job, err) => {
    console.error(`[Webhook Worker] Job ${job?.id} failed after all retries:`, err.message);
});
