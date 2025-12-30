/**
 * Redis pub/sub integration
 */

const redis = require('redis');

class RedisPubSub {
  constructor(redisUrl = 'redis://localhost:6379') {
    this.publisher = redis.createClient({ url: redisUrl });
    this.subscriber = this.publisher.duplicate();
  }

  async connect() {
    try {
      await this.publisher.connect();
      await this.subscriber.connect();
      console.log('Redis connected');
    } catch (error) {
      console.error('Redis connection error:', error);
    }
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel, message => {
      callback(JSON.parse(message));
    });
  }

  async publish(channel, data) {
    await this.publisher.publish(channel, JSON.stringify(data));
  }

  async unsubscribe(channel) {
    await this.subscriber.unsubscribe(channel);
  }

  async disconnect() {
    await this.publisher.quit();
    await this.subscriber.quit();
    console.log('Redis disconnected');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RedisPubSub;
}
