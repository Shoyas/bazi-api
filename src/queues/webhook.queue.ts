import { Queue } from 'bullmq';
import { connection } from './connection';
import { IWebhookDeliveryPayload } from '../app/modules/customWebhook/customWebhook.interface';

export const webhookQueue = new Queue('webhook-queue', {
  connection,
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

export interface DispatchWebhookJobPayload {
  subscriptionId: string;
  url: string;
  secret: string;
  payload: IWebhookDeliveryPayload;
}
