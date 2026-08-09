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
    repeat: { pattern: '0 0 * * *' } // Every midnight
  });
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
