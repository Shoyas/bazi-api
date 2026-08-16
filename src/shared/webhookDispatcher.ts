import { prisma } from './prisma';
import { webhookQueue } from '../queues/webhook.queue';
import { WebhookEvent } from '../app/modules/customWebhook/customWebhook.interface';

/**
 * Dispatch an outbound webhook event to all subscribed active endpoints
 * 
 * @param event The webhook event identifier
 * @param data The payload data associated with this event
 * @param targetUserId Optional user ID to target a specific user (e.g. for user-specific alerts or test pings)
 */
export const dispatchWebhookEvent = async (
  event: WebhookEvent,
  data: Record<string, any>,
  targetUserId?: string
): Promise<{ dispatchedCount: number }> => {
  try {
    const whereCondition: any = {
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

    const subscriptions = await prisma.webhookSubscription.findMany({
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

    await webhookQueue.addBulk(jobs);

    console.log(
      `[Webhook Dispatcher] Enqueued ${jobs.length} delivery job(s) for event: ${event}`
    );

    return { dispatchedCount: jobs.length };
  } catch (error) {
    console.error(`[Webhook Dispatcher] Failed to dispatch event ${event}:`, error);
    return { dispatchedCount: 0 };
  }
};
