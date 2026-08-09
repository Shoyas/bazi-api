import nodemailer from 'nodemailer';
import { emailQueue } from '../queues/email.queue';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL || process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const transportSendEmail = async (to: string, subject: string, html: string) => {
  try {
    const fromName = process.env.SMTP_NAME || 'BaZi API';
    const fromEmail = process.env.SMTP_EMAIL_FROM || process.env.SMTP_EMAIL || process.env.SMTP_USER;
    
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const job = await emailQueue.add('send-email', { to, subject, html }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    console.log(`[Email Queue] Added email job ${job.id} for ${to}`);
  } catch (error) {
    console.error('Error queuing email:', error);
    throw error;
  }
};
