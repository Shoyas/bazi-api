import path from 'path';

// Load config first
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

console.log('[Worker Process] Booting up BullMQ workers...');

// Importing the workers index initializes the workers and their queue connections
import './workers';

process.on("unhandledRejection", (err: Error) => {
  console.error(`[Worker Process] UnhandledRejection: ${err.message}`);
});

process.on("uncaughtException", (err: Error) => {
  console.error(`[Worker Process] UncaughtException: ${err.message}`);
  process.exit(1);
});
