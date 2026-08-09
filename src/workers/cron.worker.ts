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
