import Redis from 'ioredis';
import config from '../config';

// BullMQ requires maxRetriesPerRequest: null
export const connection = new Redis(config.redis.url || 'redis://localhost:6380', {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('[BullMQ Redis] Connection error:', err);
});
