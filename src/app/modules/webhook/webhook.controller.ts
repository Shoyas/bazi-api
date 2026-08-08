import { Request, Response } from 'express';
import crypto from 'crypto';
import httpStatus from 'http-status';
import { WebhookService } from './webhook.service';

const handleLemonSqueezyWebhook = async (req: Request, res: Response) => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  
  if (!secret) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Webhook secret not configured');
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(req.body).digest('hex'), 'utf8');
  
  const signature = req.get('X-Signature') || '';
  const checksum = Buffer.from(signature, 'utf8');

  if (digest.length !== checksum.length || !crypto.timingSafeEqual(digest, checksum)) {
    return res.status(httpStatus.UNAUTHORIZED).send('Invalid signature');
  }

  try {
    const payload = JSON.parse(req.body.toString('utf8'));
    const eventName = payload.meta.event_name;
    const eventData = payload.data;

    await WebhookService.processLemonSqueezyEvent(eventName, eventData);

    res.status(httpStatus.OK).send('Webhook processed');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Webhook processing failed');
  }
};

export const WebhookController = {
  handleLemonSqueezyWebhook,
};
