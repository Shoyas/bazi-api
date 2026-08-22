"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWebhookValidation = void 0;
const zod_1 = require("zod");
const customWebhook_interface_1 = require("./customWebhook.interface");
const createWebhookZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string({
            message: 'Webhook URL is required',
        }).url('Invalid URL format. Must be a valid HTTP or HTTPS URL'),
        description: zod_1.z.string().max(200, 'Description cannot exceed 200 characters').optional(),
        events: zod_1.z.array(zod_1.z.enum(customWebhook_interface_1.ALLOWED_WEBHOOK_EVENTS, {
            message: 'Invalid webhook event type',
        }), {
            message: 'Events array is required',
        }).min(1, 'At least one webhook event must be selected'),
    }),
});
const updateWebhookZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url('Invalid URL format').optional(),
        description: zod_1.z.string().max(200, 'Description cannot exceed 200 characters').optional(),
        events: zod_1.z.array(zod_1.z.enum(customWebhook_interface_1.ALLOWED_WEBHOOK_EVENTS, {
            message: 'Invalid webhook event type',
        })).min(1, 'At least one webhook event must be selected').optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.CustomWebhookValidation = {
    createWebhookZodSchema,
    updateWebhookZodSchema,
};
