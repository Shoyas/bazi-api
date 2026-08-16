export type WebhookEvent =
  | 'solar_term.changed'
  | 'daily.bazi_shift'
  | 'usage.threshold_reached'
  | 'test.ping';

export const ALLOWED_WEBHOOK_EVENTS: WebhookEvent[] = [
  'solar_term.changed',
  'daily.bazi_shift',
  'usage.threshold_reached',
  'test.ping',
];

export interface ICreateWebhookPayload {
  url: string;
  description?: string;
  events: WebhookEvent[];
}

export interface IUpdateWebhookPayload {
  url?: string;
  description?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

export interface IWebhookDeliveryPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}
