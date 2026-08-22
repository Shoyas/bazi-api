import { Queue } from 'bullmq';
import { connection } from './connection';

export const cronQueue = new Queue('cron-queue', { connection });
