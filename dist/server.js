"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const seed_1 = require("./shared/seed");
const cron_queue_1 = require("./queues/cron.queue");
const config_1 = __importDefault(require("./config"));
const PORT = config_1.default.port || 3031;
const startServer = async () => {
    await (0, seed_1.seedSuperAdmin)();
    // Schedule BullMQ repeatable jobs
    await cron_queue_1.cronQueue.add('otp-cleanup', {}, {
        repeat: { pattern: '0 * * * *' } // Every hour
    });
    console.log('[BullMQ] Scheduled otp-cleanup repeatable job');
    await cron_queue_1.cronQueue.add('subscription-cleanup', {}, {
        repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
        jobId: 'daily-subscription-cleanup'
    });
    await cron_queue_1.cronQueue.add('apikey-cleanup', {}, {
        repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
        jobId: 'daily-apikey-cleanup'
    });
    console.log('[BullMQ] Scheduled apikey-cleanup repeatable job');
    await cron_queue_1.cronQueue.add('revoked-apikey-deletion', {}, {
        repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
        jobId: 'daily-revoked-apikey-deletion'
    });
    console.log('[BullMQ] Scheduled revoked-apikey-deletion repeatable job');
    await cron_queue_1.cronQueue.add('free-user-cleanup', {}, {
        repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
        jobId: 'daily-free-user-cleanup'
    });
    console.log('[BullMQ] Scheduled free-user-cleanup repeatable job');
    console.log('[BullMQ] Scheduled subscription-cleanup repeatable job');
    // Schedule Webhook Event Triggers
    await cron_queue_1.cronQueue.add('daily-bazi-shift', {}, {
        repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
        jobId: 'daily-bazi-shift-broadcast'
    });
    console.log('[BullMQ] Scheduled daily-bazi-shift webhook broadcast job');
    await cron_queue_1.cronQueue.add('solar-term-check', {}, {
        repeat: { pattern: '0 1 * * *' }, // Run daily at 01:00 AM
        jobId: 'daily-solar-term-check'
    });
    console.log('[BullMQ] Scheduled solar-term-check webhook broadcast job');
    const server = app_1.default.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
    process.on("unhandledRejection", (err) => {
        console.error(`UnhandledRejection: ${err.message}`);
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer();
process.on("uncaughtException", (err) => {
    console.error(`UncaughtException: ${err.message}`);
    process.exit(1);
});
