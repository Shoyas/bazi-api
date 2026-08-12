"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const lemonsqueezy_js_1 = require("@lemonsqueezy/lemonsqueezy.js");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../../shared/prisma");
const AppError_1 = require("../../../errors/AppError");
const initLemonSqueezy = () => {
    (0, lemonsqueezy_js_1.lemonSqueezySetup)({
        apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
    });
};
const getCheckoutUrl = async (userId, plan, billingCycle) => {
    initLemonSqueezy();
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Store ID not configured');
    }
    if (!plan || !billingCycle) {
        throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Plan and Billing Cycle are required');
    }
    const planKey = `${plan.toUpperCase()}_${billingCycle.toUpperCase()}`;
    let variantId = '';
    switch (planKey) {
        case 'BASIC_MONTHLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_BASIC_MONTHLY || '';
            break;
        case 'BASIC_YEARLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_BASIC_YEARLY || '';
            break;
        case 'PRO_MONTHLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY || '';
            break;
        case 'PRO_YEARLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY || '';
            break;
        case 'PREMIUM_MONTHLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_PREMIUM_MONTHLY || '';
            break;
        case 'PREMIUM_YEARLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_PREMIUM_YEARLY || '';
            break;
        default:
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Invalid plan or billing cycle selected');
    }
    if (!variantId) {
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Variant ID not configured');
    }
    const checkout = await (0, lemonsqueezy_js_1.createCheckout)(storeId, variantId, {
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
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to create checkout session');
    }
    return {
        checkoutUrl: checkout.data?.data.attributes.url,
    };
};
const cancelUserSubscription = async (userId) => {
    initLemonSqueezy();
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription || !subscription.lemonSubscriptionId) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'No active subscription found to cancel');
    }
    const result = await (0, lemonsqueezy_js_1.cancelSubscription)(subscription.lemonSubscriptionId);
    if (result.error) {
        console.error(result.error);
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to cancel subscription');
    }
    // Update local DB
    await prisma_1.prisma.subscription.update({
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
const resumeUserSubscription = async (userId) => {
    initLemonSqueezy();
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription || !subscription.lemonSubscriptionId) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'No active subscription found');
    }
    const result = await (0, lemonsqueezy_js_1.updateSubscription)(subscription.lemonSubscriptionId, {
        cancelled: false,
    });
    if (result.error) {
        console.error(result.error);
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to resume subscription');
    }
    // Update local DB status if it was canceled
    await prisma_1.prisma.subscription.update({
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
const getCustomerPortalUrl = async (userId) => {
    initLemonSqueezy();
    const subscription = await prisma_1.prisma.subscription.findUnique({
        where: { userId },
    });
    if (!subscription || !subscription.lemonSubscriptionId) {
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'No active subscription found');
    }
    const result = await (0, lemonsqueezy_js_1.getSubscription)(subscription.lemonSubscriptionId);
    if (result.error) {
        console.error(result.error);
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to get subscription details');
    }
    return {
        portalUrl: result.data?.data.attributes.urls.customer_portal,
    };
};
const getMySubscription = async (userId) => {
    const subscription = await prisma_1.prisma.subscription.findUnique({
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
        throw new AppError_1.AppError(http_status_1.default.NOT_FOUND, 'Subscription not found');
    }
    return subscription;
};
const getAllSubscriptions = async () => {
    const subscriptions = await prisma_1.prisma.subscription.findMany({
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
exports.SubscriptionService = {
    getCheckoutUrl,
    cancelUserSubscription,
    resumeUserSubscription,
    getCustomerPortalUrl,
    getMySubscription,
    getAllSubscriptions,
};
