const Redis = require('ioredis');
const redis = new Redis(); // default localhost:6379

redis.flushall().then(() => {
  console.log('Redis Cache Cleared Successfully');
  process.exit(0);
}).catch(err => {
  console.error('Error clearing redis', err);
  process.exit(1);
});
