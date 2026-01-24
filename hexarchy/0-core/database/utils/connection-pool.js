// Database Connection Pool Manager
import { docClient } from '../dynamodb/config.js';
import { redisClient } from '../redis/config.js';

class ConnectionPool {
  constructor() {
    this.connections = {
      dynamodb: { active: 0, total: 0 },
      redis: { active: 0, total: 0 }
    };
    this.maxConnections = {
      dynamodb: 50,
      redis: 10
    };
  }

  async connectAll() {
    await Promise.all([
      this.connectDynamoDB(),
      this.connectRedis()
    ]);
  }

  async connectDynamoDB() {
    try {
      // DynamoDB uses HTTP connections, no explicit connect needed
      this.connections.dynamodb.active = 1;
      this.connections.dynamodb.total = 1;
      console.log('✅ DynamoDB pool ready');
    } catch (error) {
      console.error('❌ DynamoDB pool failed:', error);
      throw error;
    }
  }

  async connectRedis() {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      this.connections.redis.active = 1;
      this.connections.redis.total = 1;
      console.log('✅ Redis pool ready');
    } catch (error) {
      console.error('❌ Redis pool failed:', error);
      throw error;
    }
  }

  async disconnectAll() {
    await Promise.all([
      this.disconnectRedis()
    ]);
  }

  async disconnectRedis() {
    try {
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
      this.connections.redis.active = 0;
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('❌ Redis disconnect failed:', error);
    }
  }

  getStats() {
    return this.connections;
  }

  isHealthy() {
    return this.connections.redis.active > 0;
  }
}

export default new ConnectionPool();
