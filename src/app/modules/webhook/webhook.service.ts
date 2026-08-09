import { prisma } from '../../../shared/prisma';
import { SubscriptionPlan } from '@prisma/client';

const processLemonSqueezyEvent = async (eventName: string, eventData: any) => {
  const attributes = eventData.attributes;
  const customData = metaDataExtraction(eventData);

  // In LemonSqueezy, we pass userId in custom_data during checkout creation
  const userId = customData?.user_id;

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      if (userId) {
        let plan: SubscriptionPlan = 'FREE';
        // Map LS variant ID to our plan, this requires mapping logic. Assuming variant_id or product_name gives the plan.
        const productName = attributes.product_name?.toLowerCase() || '';
        if (productName.includes('yearly')) {
          plan = 'YEARLY';
        } else if (productName.includes('monthly')) {
          plan = 'MONTHLY';
        }

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            lemonSqueezyId: attributes.customer_id.toString(),
            lemonSubscriptionId: eventData.id.toString(),
            status: attributes.status,
            endDate: attributes.renews_at ? new Date(attributes.renews_at) : null,
          },
          create: {
            userId,
            plan,
            lemonSqueezyId: attributes.customer_id.toString(),
            lemonSubscriptionId: eventData.id.toString(),
            status: attributes.status,
            endDate: attributes.renews_at ? new Date(attributes.renews_at) : null,
          },
        });
      }
      break;

    case 'subscription_cancelled':
      if (userId) {
        const endsAt = attributes.ends_at ? new Date(attributes.ends_at) : null;
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'canceled',
            ...(endsAt && { endDate: endsAt }),
          },
        });
      }
      break;

    case 'subscription_expired':
      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            plan: 'FREE',
            status: 'expired',
          },
        });
      }
      break;
    default:
      console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
  }
};

const metaDataExtraction = (data: any) => {
  // Extract custom_data from meta if available
  // In Lemon Squeezy, webhook payloads include a meta object with custom_data
  // but it's not nested inside 'data' usually, it's at the root.
  // We'll adjust it if it's passed differently.
  return data.meta?.custom_data;
};

export const WebhookService = {
  processLemonSqueezyEvent,
};
