import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { prisma } from '../shared/prisma';

export const cronWorker = new Worker(
  'cron-queue',
  async (job: Job) => {
    console.log(`[Cron Worker] Processing job: ${job.name} (ID: ${job.id})`);

    if (job.name === 'otp-cleanup') {
      try {
        const result = await prisma.otp.deleteMany({
          where: {
            OR: [
              { isUsed: true },
              { expiresAt: { lt: new Date() } }
            ]
          }
        });
        console.log(`[Cron Worker] OTP cleanup completed. Deleted ${result.count} records.`);
      } catch (error) {
        console.error('[Cron Worker] Error during OTP cleanup:', error);
        throw error;
      }
    } else if (job.name === 'subscription-cleanup') {
      try {
        const now = new Date();
        const expiredSubscriptions = await prisma.subscription.findMany({
          where: {
            endDate: { lt: now },
            plan: { not: 'FREE' },
            status: { notIn: ['expired'] },
          },
        });

        if (expiredSubscriptions.length === 0) {
          console.log('[Cron Worker] No expired subscriptions found.');
          return;
        }

        const updated = await prisma.subscription.updateMany({
          where: {
            id: { in: expiredSubscriptions.map((s) => s.id) },
          },
          data: {
            plan: 'FREE',
            status: 'expired',
          },
        });

        console.log(`[Cron Worker] Subscription cleanup completed. Downgraded ${updated.count} subscriptions to FREE.`);
      } catch (error) {
        console.error('[Cron Worker] Error during subscription cleanup:', error);
        throw error;
      }
    } else if (job.name === 'apikey-cleanup') {
      try {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        // Find all active API keys that are older than 10 days
        // but only for FREE users.
        const expiredKeys = await prisma.apiKey.findMany({
          where: {
            isActive: true,
            createdAt: { lt: tenDaysAgo },
            user: {
              OR: [
                { subscription: null },
                { subscription: { plan: 'FREE' } },
              ],
            },
          },
        });

        if (expiredKeys.length > 0) {
          const updated = await prisma.apiKey.updateMany({
            where: {
              id: { in: expiredKeys.map((k) => k.id) },
            },
            data: {
              isActive: false,
            },
          });
          console.log(`[Cron Worker] API Key cleanup completed. Revoked ${updated.count} expired FREE API keys.`);
        } else {
          console.log('[Cron Worker] No expired FREE API keys found.');
        }
      } catch (error) {
        console.error('[Cron Worker] Error during API key cleanup:', error);
        throw error;
      }
    } else if (job.name === 'revoked-apikey-deletion') {
      try {
        const deleted = await prisma.apiKey.deleteMany({
          where: {
            isActive: false,
          },
        });
        if (deleted.count > 0) {
          console.log(`[Cron Worker] Revoked API Key deletion completed. Deleted ${deleted.count} revoked API keys.`);
        } else {
          console.log('[Cron Worker] No revoked API keys found to delete.');
        }
      } catch (error) {
        console.error('[Cron Worker] Error during revoked API key deletion:', error);
        throw error;
      }
    } else if (job.name === 'free-user-cleanup') {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find users with FREE plan older than 30 days
        const expiredFreeUsers = await prisma.user.findMany({
          where: {
            role: 'USER',
            createdAt: { lt: thirtyDaysAgo },
            OR: [
              { subscription: null },
              { subscription: { plan: 'FREE' } },
            ],
          },
        });

        if (expiredFreeUsers.length > 0) {
          // Archive their info
          await prisma.archivedUser.createMany({
            data: expiredFreeUsers.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              country: user.country,
              createdAt: user.createdAt,
            })),
            skipDuplicates: true,
          });

          // Delete them from User table (this cascades keys/logs/subscriptions)
          const deleted = await prisma.user.deleteMany({
            where: {
              id: { in: expiredFreeUsers.map(u => u.id) },
            },
          });

          console.log(`[Cron Worker] Free user cleanup completed. Archived and deleted ${deleted.count} users.`);
        } else {
          console.log('[Cron Worker] No expired FREE users found for cleanup.');
        }
      } catch (error) {
        console.error('[Cron Worker] Error during free user cleanup:', error);
        throw error;
      }
    } else {
      console.warn(`[Cron Worker] Unknown job name: ${job.name}`);
    }
  },
  { connection }
);

cronWorker.on('completed', (job) => {
  console.log(`[Cron Worker] Job ${job.id} (${job.name}) completed.`);
});

cronWorker.on('failed', (job, err) => {
  console.error(`[Cron Worker] Job ${job?.id} (${job?.name}) failed with error:`, err);
});
