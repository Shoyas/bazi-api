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
const getCheckoutUrl = async (userId, plan) => {
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
    let variantId = '';
    switch (plan.toUpperCase()) {
        case 'YEARLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_PREMIUM || ''; // Example mapping
            break;
        case 'MONTHLY':
            variantId = process.env.LEMONSQUEEZY_VARIANT_BASIC || ''; // Example mapping
            break;
        default:
            throw new AppError_1.AppError(http_status_1.default.BAD_REQUEST, 'Invalid plan selected');
    }
    if (!variantId) {
        throw new AppError_1.AppError(http_status_1.default.INTERNAL_SERVER_ERROR, 'Variant ID not configured');
    }
    const checkout = await (0, lemonsqueezy_js_1.createCheckout)(storeId, variantId, {
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
exports.SubscriptionService = {
    getCheckoutUrl,
};
