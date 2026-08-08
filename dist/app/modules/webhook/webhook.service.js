"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const prisma_1 = require("../../../shared/prisma");
const processLemonSqueezyEvent = async (eventName, eventData) => {
    const attributes = eventData.attributes;
    const customData = metaDataExtraction(eventData);
    // In LemonSqueezy, we pass userId in custom_data during checkout creation
    const userId = customData?.user_id;
    switch (eventName) {
        case 'subscription_created':
        case 'subscription_updated':
            if (userId) {
                let plan = 'FREE';
                // Map LS variant ID to our plan, this requires mapping logic. Assuming variant_id or product_name gives the plan.
                const productName = attributes.product_name?.toLowerCase() || '';
                if (productName.includes('yearly')) {
                    plan = 'YEARLY';
                }
                else if (productName.includes('monthly')) {
                    plan = 'MONTHLY';
                }
                await prisma_1.prisma.subscription.upsert({
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
        case 'subscription_expired':
            if (userId) {
                await prisma_1.prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan: 'FREE',
                        status: 'canceled',
                    },
                });
            }
            break;
        default:
            console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }
};
const metaDataExtraction = (data) => {
    // Extract custom_data from meta if available
    // In Lemon Squeezy, webhook payloads include a meta object with custom_data
    // but it's not nested inside 'data' usually, it's at the root.
    // We'll adjust it if it's passed differently.
    return data.meta?.custom_data;
};
exports.WebhookService = {
    processLemonSqueezyEvent,
};
