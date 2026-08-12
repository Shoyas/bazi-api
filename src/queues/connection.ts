import Redis from 'ioredis';
import config from '../config';
import { ConnectionOptions } from 'bullmq';

// BullMQ requires maxRetriesPerRequest: null
const redisConnection = new Redis(config.redis.url || 'redis://localhost:6380', {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('[BullMQ Redis] Connection error:', err);
});

export const connection = redisConnection as unknown as ConnectionOptions;
