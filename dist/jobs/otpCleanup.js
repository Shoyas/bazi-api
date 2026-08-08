"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../shared/prisma");
const initCronJobs = () => {
    // Run every hour at the top of the hour (0 * * * *)
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('[Cron Job] Running OTP cleanup...');
        try {
            const result = await prisma_1.prisma.otp.deleteMany({
                where: {
                    OR: [
                        { isUsed: true },
                        { expiresAt: { lt: new Date() } }
                    ]
                }
            });
            console.log(`[Cron Job] OTP cleanup completed. Deleted ${result.count} records.`);
        }
        catch (error) {
            console.error('[Cron Job] Error during OTP cleanup:', error);
        }
    });
    console.log('Cron jobs initialized.');
};
exports.initCronJobs = initCronJobs;
