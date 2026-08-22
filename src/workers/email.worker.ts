import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import { sendEmail } from '../helpers/mailer';
import { SendEmailPayload } from '../queues/email.queue';

export const emailWorker = new Worker<SendEmailPayload>(
  'email-queue',
  async (job: Job<SendEmailPayload>) => {
    const { to, subject, html } = job.data;
    console.log(`[Email Worker] Processing job ${job.id}: Sending email to ${to}`);
    
    // We import sendEmail from mailer.ts directly and invoke the actual transport logic there.
    // Ensure that mailer.ts is refactored to handle the actual sending if it currently queues.
    // Since we will refactor mailer.ts, let's just use the nodemailer transporter here, 
    // or refactor mailer.ts to expose a `transportSendEmail` method.
    // For simplicity, we will assume `transportSendEmail` will be the actual sender.
    
    try {
      // we will rename the original sendEmail to transportSendEmail in mailer.ts
      const { transportSendEmail } = await import('../helpers/mailer');
      await transportSendEmail(to, subject, html);
      console.log(`[Email Worker] Successfully sent email to ${to}`);
    } catch (error) {
      console.error(`[Email Worker] Failed to send email to ${to}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  { connection }
);

emailWorker.on('completed', (job) => {
  console.log(`[Email Worker] Job ${job.id} completed.`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Email Worker] Job ${job?.id} failed with error:`, err);
});
