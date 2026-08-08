"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_1 = __importDefault(require("http-status"));
const webhook_service_1 = require("./webhook.service");
const handleLemonSqueezyWebhook = async (req, res) => {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).send('Webhook secret not configured');
    }
    const hmac = crypto_1.default.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(req.body).digest('hex'), 'utf8');
    const signature = req.get('X-Signature') || '';
    const checksum = Buffer.from(signature, 'utf8');
    if (digest.length !== checksum.length || !crypto_1.default.timingSafeEqual(digest, checksum)) {
        return res.status(http_status_1.default.UNAUTHORIZED).send('Invalid signature');
    }
    try {
        const payload = JSON.parse(req.body.toString('utf8'));
        const eventName = payload.meta.event_name;
        const eventData = payload.data;
        await webhook_service_1.WebhookService.processLemonSqueezyEvent(eventName, eventData);
        res.status(http_status_1.default.OK).send('Webhook processed');
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(http_status_1.default.INTERNAL_SERVER_ERROR).send('Webhook processing failed');
    }
};
exports.WebhookController = {
    handleLemonSqueezyWebhook,
};
