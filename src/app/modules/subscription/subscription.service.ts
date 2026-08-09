import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import httpStatus from 'http-status';
import { prisma } from '../../../shared/prisma';
import { AppError } from '../../../errors/AppError';

const initLemonSqueezy = () => {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
  });
};

const getCheckoutUrl = async (userId: string, plan: string) => {
  initLemonSqueezy();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Store ID not configured');
  }

  let variantId = '';
  switch (plan.toUpperCase()) {
    case 'YEARLY':
      variantId = process.env.LEMONSQUEEZY_VARIANT_YEARLY || '';
      break;
    case 'MONTHLY':
      variantId = process.env.LEMONSQUEEZY_VARIANT_MONTHLY || '';
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid plan selected');
  }

  if (!variantId) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Variant ID not configured');
  }

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      name: user.name,
      custom: {
        user_id: user.id, // Very important for webhook processing
      },
    },
  });

  if (checkout.error) {
    console.error(checkout.error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create checkout session');
  }

  return {
    checkoutUrl: checkout.data?.data.attributes.url,
  };
};

export const SubscriptionService = {
  getCheckoutUrl,
};
