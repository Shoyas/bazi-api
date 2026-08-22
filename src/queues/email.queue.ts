import { Queue } from 'bullmq';
import { connection } from './connection';

export const emailQueue = new Queue('email-queue', { connection });

// Define the payload types for email jobs
export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}
