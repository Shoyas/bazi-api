import cron from 'node-cron';
import { prisma } from '../shared/prisma';

export const initCronJobs = () => {
  // Run every hour at the top of the hour (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron Job] Running OTP cleanup...');

    try {
      const result = await prisma.otp.deleteMany({
        where: {
          OR: [
            { isUsed: true },
            { expiresAt: { lt: new Date() } }
          ]
        }
      });

      console.log(`[Cron Job] OTP cleanup completed. Deleted ${result.count} records.`);
    } catch (error) {
      console.error('[Cron Job] Error during OTP cleanup:', error);
    }
  });

  console.log('Cron jobs initialized.');
};
