/**
 * Advanced Rate Limiting Middleware
 * Multiple strategies: IP-based, user-based, endpoint-based
 *
 * Author: HOOTNER Code Guardian
 */

const Redis = require('ioredis');
const { ApolloError } = require('apollo-server-express');

// Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

const RATE_LIMIT_PREFIX = 'ratelimit:';

/**
 * Rate Limiter Class
 */
class RateLimiter {
  /**
   * Apply rate limit
   * @param {string} key - Rate limit key (IP, user ID, etc.)
   * @param {number} maxRequests - Max requests allowed
   * @param {number} windowSeconds - Time window in seconds
   * @returns {Promise<Object>} Rate limit status
   */
  static async checkRateLimit(key, maxRequests = 100, windowSeconds = 60) {
    const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      // Use Redis sorted set for sliding window
      const pipeline = redis.pipeline();

      // Remove old entries
      pipeline.zremrangebyscore(redisKey, 0, windowStart);

      // Add current request
      pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);

      // Count requests in window
      pipeline.zcard(redisKey);

      // Set expiry
      pipeline.expire(redisKey, windowSeconds);

      const results = await pipeline.exec();
      const requestCount = results[2][1];

      const allowed = requestCount <= maxRequests;
      const remaining = Math.max(0, maxRequests - requestCount);
      const resetTime = now + windowSeconds * 1000;

      return {
        allowed,
        requestCount,
        remaining,
        resetTime,
        limit: maxRequests,
        window: windowSeconds,
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        requestCount: 0,
        remaining: maxRequests,
        resetTime: now + windowSeconds * 1000,
        limit: maxRequests,
        window: windowSeconds,
      };
    }
  }

  /**
   * Apply IP-based rate limit
   */
  static async checkIPRateLimit(ip, maxRequests = 100, windowSeconds = 60) {
    return this.checkRateLimit(`ip:${ip}`, maxRequests, windowSeconds);
  }

  /**
   * Apply user-based rate limit
   */
  static async checkUserRateLimit(userId, maxRequests = 1000, windowSeconds = 60) {
    return this.checkRateLimit(`user:${userId}`, maxRequests, windowSeconds);
  }

  /**
   * Apply endpoint-specific rate limit
   */
  static async checkEndpointRateLimit(
    endpoint,
    identifier,
    maxRequests = 10,
    windowSeconds = 60
  ) {
    return this.checkRateLimit(
      `endpoint:${endpoint}:${identifier}`,
      maxRequests,
      windowSeconds
    );
  }

  /**
   * Reset rate limit for a key
   */
  static async resetRateLimit(key) {
    await redis.del(`${RATE_LIMIT_PREFIX}${key}`);
  }
}

/**
 * Express middleware factory
 */
function createRateLimitMiddleware(options = {}) {
  const {
    maxRequests = 100,
    windowSeconds = 60,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip,
  } = options;

  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const result = await RateLimiter.checkRateLimit(key, maxRequests, windowSeconds);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);

        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter,
          limit: result.limit,
          window: result.window,
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open
    }
  };
}

/**
 * GraphQL resolver rate limit wrapper
 */
function rateLimitResolver(maxRequests = 10, windowSeconds = 60) {
  return function (resolver) {
    return async function (parent, args, context, info) {
      const key = context.user?.id || context.req.ip;
      const endpoint = info.fieldName;

      const result = await RateLimiter.checkEndpointRateLimit(
        endpoint,
        key,
        maxRequests,
        windowSeconds
      );

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        throw new ApolloError(
          `Rate limit exceeded for ${endpoint}. Try again in ${retryAfter} seconds`,
          'RATE_LIMIT_EXCEEDED',
          {
            retryAfter,
            limit: result.limit,
            remaining: 0,
            resetTime: result.resetTime,
          }
        );
      }

      // Add rate limit info to context
      context.rateLimit = result;

      return resolver(parent, args, context, info);
    };
  };
}

module.exports = {
  RateLimiter,
  createRateLimitMiddleware,
  rateLimitResolver,
};
