import { lemonSqueezySetup, createCheckout, cancelSubscription, updateSubscription, getSubscription } from '@lemonsqueezy/lemonsqueezy.js';
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
    productOptions: {
      redirectUrl: process.env.LEMONSQUEEZY_SUCCESS_URL || '',
    },
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

const cancelUserSubscription = async (userId: string) => {
  initLemonSqueezy();

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.lemonSubscriptionId) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active subscription found to cancel');
  }

  const result = await cancelSubscription(subscription.lemonSubscriptionId);

  if (result.error) {
    console.error(result.error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to cancel subscription');
  }

  // Update local DB
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'canceled', // Will be technically canceled at period end
    },
  });

  return {
    message: 'Subscription canceled successfully. You will not be charged again. You will continue to have access until the end of your current billing cycle. Please note that no refunds are provided for partial months.',
    subscription: result.data?.data.attributes,
  };
};

const resumeUserSubscription = async (userId: string) => {
  initLemonSqueezy();

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.lemonSubscriptionId) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active subscription found');
  }

  const result = await updateSubscription(subscription.lemonSubscriptionId, {
    cancelled: false,
  });

  if (result.error) {
    console.error(result.error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to resume subscription');
  }

  // Update local DB status if it was canceled
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'active',
    },
  });

  return {
    message: 'Subscription auto-renewal has been successfully resumed.',
    subscription: result.data?.data.attributes,
  };
};

const getCustomerPortalUrl = async (userId: string) => {
  initLemonSqueezy();

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.lemonSubscriptionId) {
    throw new AppError(httpStatus.NOT_FOUND, 'No active subscription found');
  }

  const result = await getSubscription(subscription.lemonSubscriptionId);

  if (result.error) {
    console.error(result.error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get subscription details');
  }

  return {
    portalUrl: result.data?.data.attributes.urls.customer_portal,
  };
};

const getMySubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!subscription) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  return subscription;
};

const getAllSubscriptions = async () => {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return subscriptions;
};

export const SubscriptionService = {
  getCheckoutUrl,
  cancelUserSubscription,
  resumeUserSubscription,
  getCustomerPortalUrl,
  getMySubscription,
  getAllSubscriptions,
};
