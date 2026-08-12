"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transportSendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const email_queue_1 = require("../queues/email.queue");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL || process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const transportSendEmail = async (to, subject, html) => {
    try {
        const fromName = process.env.SMTP_NAME || 'BaZi API';
        const fromEmail = process.env.SMTP_EMAIL_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER;
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
exports.transportSendEmail = transportSendEmail;
const sendEmail = async (to, subject, html) => {
    try {
        const job = await email_queue_1.emailQueue.add('send-email', { to, subject, html }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
        console.log(`[Email Queue] Added email job ${job.id} for ${to}`);
    }
    catch (error) {
        console.error('Error queuing email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
