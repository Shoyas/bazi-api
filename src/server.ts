import app from "./app";
import { seedSuperAdmin } from "./shared/seed";
import { cronQueue } from "./queues/cron.queue";

import config from "./config";

const PORT = config.port || 3031;

const startServer = async () => {
  await seedSuperAdmin();
  
  // Schedule BullMQ repeatable jobs
  await cronQueue.add('otp-cleanup', {}, {
    repeat: { pattern: '0 * * * *' } // Every hour
  });
  console.log('[BullMQ] Scheduled otp-cleanup repeatable job');

  await cronQueue.add('subscription-cleanup', {}, {
    repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
    jobId: 'daily-subscription-cleanup'
  });

  await cronQueue.add('apikey-cleanup', {}, {
    repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
    jobId: 'daily-apikey-cleanup'
  });
  console.log('[BullMQ] Scheduled apikey-cleanup repeatable job');

  await cronQueue.add('revoked-apikey-deletion', {}, {
    repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
    jobId: 'daily-revoked-apikey-deletion'
  });
  console.log('[BullMQ] Scheduled revoked-apikey-deletion repeatable job');

  await cronQueue.add('free-user-cleanup', {}, {
    repeat: { pattern: '0 0 * * *' }, // Run daily at midnight
    jobId: 'daily-free-user-cleanup'
  });
  console.log('[BullMQ] Scheduled free-user-cleanup repeatable job');
  console.log('[BullMQ] Scheduled subscription-cleanup repeatable job');
  
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });

  process.on("unhandledRejection", (err: Error) => {
    console.error(`UnhandledRejection: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();

process.on("uncaughtException", (err: Error) => {
  console.error(`UncaughtException: ${err.message}`);
  process.exit(1);
});
