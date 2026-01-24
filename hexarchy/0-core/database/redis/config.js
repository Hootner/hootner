// Redis Configuration
import { createClient } from 'redis';

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis connection failed after 10 retries');
        return new Error('Max retries reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
};

const redisClient = createClient(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('ready', () => console.log('✅ Redis ready'));

export { redisClient };
export default redisClient;
