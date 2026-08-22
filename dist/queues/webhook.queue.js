"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookQueue = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("./connection");
exports.webhookQueue = new bullmq_1.Queue('webhook-queue', {
    connection: connection_1.connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000, // 5s, 10s, 20s
        },
        removeOnComplete: 1000,
        removeOnFail: 5000,
    },
});
