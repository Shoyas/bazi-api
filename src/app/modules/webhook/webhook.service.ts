import { prisma } from '../../../shared/prisma';
import { SubscriptionPlan } from '@prisma/client';

const processLemonSqueezyEvent = async (eventName: string, payload: any) => {
  const attributes = payload.data.attributes;
  const customData = payload.meta?.custom_data;
  const subscriptionId = payload.data.id.toString();

  // In LemonSqueezy, we pass userId in custom_data during checkout creation
  const userId = customData?.user_id;

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      if (userId) {
        let plan: SubscriptionPlan = 'FREE';
        
        const variantId = attributes.variant_id?.toString();
        
        // Exact match with env variables is the safest way
        if (variantId === process.env.LEMONSQUEEZY_VARIANT_YEARLY) {
          plan = 'YEARLY';
        } else if (variantId === process.env.LEMONSQUEEZY_VARIANT_MONTHLY) {
          plan = 'MONTHLY';
        } else {
          // Fallback to product name check if for some reason variant_id fails
          const productName = attributes.product_name?.toLowerCase() || '';
          if (productName.includes('yearly')) {
            plan = 'YEARLY';
          } else if (productName.includes('monthly')) {
            plan = 'MONTHLY';
          }
        }

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            plan,
            lemonSqueezyId: attributes.customer_id.toString(),
            lemonSubscriptionId: subscriptionId,
            status: attributes.status,
            endDate: attributes.renews_at ? new Date(attributes.renews_at) : null,
          },
          create: {
            userId,
            plan,
            lemonSqueezyId: attributes.customer_id.toString(),
            lemonSubscriptionId: subscriptionId,
            status: attributes.status,
            endDate: attributes.renews_at ? new Date(attributes.renews_at) : null,
          },
        });
      } else {
        console.warn('Webhook received but user_id is missing in custom_data');
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

export const WebhookService = {
  processLemonSqueezyEvent,
};
