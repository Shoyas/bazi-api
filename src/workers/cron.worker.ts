import { Worker, Job } from 'bullmq';
import { Solar } from 'lunar-typescript';
import { connection } from '../queues/connection';
import { prisma } from '../shared/prisma';
import { getSystemSetting } from '../shared/getSystemSetting';
import { redisClient } from '../shared/redis';
import { dispatchWebhookEvent } from '../shared/webhookDispatcher';

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
        // Fetch dynamic free API key expiration days from System Settings (default: 30 days)
        const expiryDaysStr = await getSystemSetting('free_api_key_expiry_days', '30');
        const expiryDays = parseInt(expiryDaysStr, 10) || 30;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - expiryDays);

        // Find all active API keys that are older than expiryDays
        // but only for FREE users.
        const expiredKeys = await prisma.apiKey.findMany({
          where: {
            isActive: true,
            createdAt: { lt: cutoffDate },
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
          console.log(`[Cron Worker] API Key cleanup completed (${expiryDays} days threshold). Revoked ${updated.count} expired FREE API keys.`);
        } else {
          console.log(`[Cron Worker] No expired FREE API keys found (threshold: ${expiryDays} days).`);
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
        // Fetch dynamic retention days from System Settings (default: 180 days / 6 months)
        const retentionDaysStr = await getSystemSetting('free_user_retention_days', '180');
        const retentionDays = parseInt(retentionDaysStr, 10) || 180;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        // Find active FREE users whose account was created more than retentionDays ago
        const expiredFreeUsers = await prisma.user.findMany({
          where: {
            role: 'USER',
            status: { not: 'blocked' },
            isDeleted: false,
            createdAt: { lt: cutoffDate },
            OR: [
              { subscription: null },
              { subscription: { plan: 'FREE' } },
            ],
          },
        });

        if (expiredFreeUsers.length > 0) {
          const userIds = expiredFreeUsers.map((u) => u.id);

          // Disable/Block their account status
          const updatedUsers = await prisma.user.updateMany({
            where: {
              id: { in: userIds },
            },
            data: {
              status: 'blocked',
            },
          });

          // Deactivate all active API keys of these disabled users
          const updatedKeys = await prisma.apiKey.updateMany({
            where: {
              userId: { in: userIds },
              isActive: true,
            },
            data: {
              isActive: false,
            },
          });

          console.log(
            `[Cron Worker] Free user cleanup completed (${retentionDays} days threshold). Disabled ${updatedUsers.count} user accounts and deactivated ${updatedKeys.count} API keys.`
          );
        } else {
          console.log(`[Cron Worker] No expired FREE users found to disable (threshold: ${retentionDays} days).`);
        }
      } catch (error) {
        console.error('[Cron Worker] Error during free user cleanup:', error);
        throw error;
      }
    } else if (job.name === 'daily-bazi-shift') {
      try {
        const now = new Date();
        const solar = Solar.fromDate(now);
        const lunar = solar.getLunar();
        const eightChar = lunar.getEightChar();

        const dailyPayload = {
          date: solar.toYmd(),
          lunarDate: `${lunar.getYearInGanZhi()} ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
          dayPillar: {
            gan: eightChar.getDayGan(),
            zhi: eightChar.getDayZhi(),
            wuXing: eightChar.getDayWuXing(),
            naYin: eightChar.getDayNaYin(),
          },
          zodiac: lunar.getYearShengXiao(),
          solarTerm: lunar.getJieQi() || null,
        };

        const result = await dispatchWebhookEvent('daily.bazi_shift', dailyPayload);
        console.log(`[Cron Worker] Daily BaZi shift event broadcasted to ${result.dispatchedCount} active endpoints.`);
      } catch (error) {
        console.error('[Cron Worker] Error during daily BaZi shift broadcast:', error);
        throw error;
      }
    } else if (job.name === 'solar-term-check') {
      try {
        const now = new Date();
        const solar = Solar.fromDate(now);
        const lunar = solar.getLunar();
        const currentJieQi = lunar.getJieQi();

        if (currentJieQi) {
          const dateKey = solar.toYmd();
          const redisKey = `dispatched_solar_term_${currentJieQi}_${dateKey}`;
          const alreadyDispatched = await redisClient.get(redisKey);

          if (!alreadyDispatched) {
            const solarTermPayload = {
              solarTerm: currentJieQi,
              date: dateKey,
              solarDateTime: solar.toYmdHms(),
              chineseYear: lunar.getYearInGanZhi(),
              lunarMonth: lunar.getMonthInChinese(),
              lunarDay: lunar.getDayInChinese(),
            };

            const result = await dispatchWebhookEvent('solar_term.changed', solarTermPayload);
            await redisClient.setex(redisKey, 86400 * 2, '1'); // Cache for 2 days

            console.log(
              `[Cron Worker] Solar term change (${currentJieQi}) broadcasted to ${result.dispatchedCount} active endpoints.`
            );
          } else {
            console.log(`[Cron Worker] Solar term (${currentJieQi}) already dispatched today.`);
          }
        }
      } catch (error) {
        console.error('[Cron Worker] Error during solar term check broadcast:', error);
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
