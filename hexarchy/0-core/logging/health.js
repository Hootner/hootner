// Health Check Endpoints
import { docClient } from '../database/dynamodb/config.js';
import { redisClient } from '../database/redis/config.js';

export const healthCheck = async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {}
  };

  // Check DynamoDB
  try {
    await docClient.send({ input: {} }); // Minimal operation
    health.checks.dynamodb = 'healthy';
  } catch (error) {
    health.checks.dynamodb = 'unhealthy';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redisClient.ping();
    health.checks.redis = 'healthy';
  } catch (error) {
    health.checks.redis = 'unhealthy';
    health.status = 'degraded';
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
};

export const readinessCheck = async (req, res) => {
  // Quick check - is the service ready to accept traffic?
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
};

export const livenessCheck = async (req, res) => {
  // Quick check - is the service alive?
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
};

export default { healthCheck, readinessCheck, livenessCheck };
