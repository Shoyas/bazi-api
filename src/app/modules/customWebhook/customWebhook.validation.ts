import { z } from 'zod';
import { ALLOWED_WEBHOOK_EVENTS } from './customWebhook.interface';

const createWebhookZodSchema = z.object({
  body: z.object({
    url: z.string({
      message: 'Webhook URL is required',
    }).url('Invalid URL format. Must be a valid HTTP or HTTPS URL'),
    description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
    events: z.array(
      z.enum(ALLOWED_WEBHOOK_EVENTS as [string, ...string[]], {
        message: 'Invalid webhook event type',
      }),
      {
        message: 'Events array is required',
      }
    ).min(1, 'At least one webhook event must be selected'),
  }),
});

const updateWebhookZodSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format').optional(),
    description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
    events: z.array(
      z.enum(ALLOWED_WEBHOOK_EVENTS as [string, ...string[]], {
        message: 'Invalid webhook event type',
      })
    ).min(1, 'At least one webhook event must be selected').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const CustomWebhookValidation = {
  createWebhookZodSchema,
  updateWebhookZodSchema,
};
