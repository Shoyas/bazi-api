"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = void 0;
const bullmq_1 = require("bullmq");
const connection_1 = require("../queues/connection");
exports.emailWorker = new bullmq_1.Worker('email-queue', async (job) => {
    const { to, subject, html } = job.data;
    console.log(`[Email Worker] Processing job ${job.id}: Sending email to ${to}`);
    // We import sendEmail from mailer.ts directly and invoke the actual transport logic there.
    // Ensure that mailer.ts is refactored to handle the actual sending if it currently queues.
    // Since we will refactor mailer.ts, let's just use the nodemailer transporter here, 
    // or refactor mailer.ts to expose a `transportSendEmail` method.
    // For simplicity, we will assume `transportSendEmail` will be the actual sender.
    try {
        // we will rename the original sendEmail to transportSendEmail in mailer.ts
        const { transportSendEmail } = await Promise.resolve().then(() => __importStar(require('../helpers/mailer')));
        await transportSendEmail(to, subject, html);
        console.log(`[Email Worker] Successfully sent email to ${to}`);
    }
    catch (error) {
        console.error(`[Email Worker] Failed to send email to ${to}:`, error);
        throw error; // Let BullMQ handle retries
    }
}, { connection: connection_1.connection });
exports.emailWorker.on('completed', (job) => {
    console.log(`[Email Worker] Job ${job.id} completed.`);
});
exports.emailWorker.on('failed', (job, err) => {
    console.error(`[Email Worker] Job ${job?.id} failed with error:`, err);
});
