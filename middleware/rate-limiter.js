import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { config as appConfig } from '../config/app-config.js';

export const createRateLimiter = (config = {}) => { const { windowMs = appConfig.rateLimit.default.windowMs,
    max = appConfig.rateLimit.default.max,
    message = 'Too many requests',
    standardHeaders = true,
    legacyHeaders = false,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false, } = config;

  const limiterConfig = { windowMs,
    max,
    message: { error: message },
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => { res.status(429).json({ error: message,
        retryAfter: Math.ceil(windowMs / 1000), }); }, };

  if (process.env.REDIS_URL) { limiterConfig.store = new RedisStore({ sendCommand: (...args) => global.redisClient?.sendCommand(args), }); }

  return rateLimit(limiterConfig); };

export const rateLimiters = { auth: createRateLimiter({ windowMs: appConfig.rateLimit.auth.windowMs,
    max: appConfig.rateLimit.auth.max,
    message: 'Too many auth attempts',
    skipSuccessfulRequests: true, }),
  payment: createRateLimiter({ windowMs: appConfig.rateLimit.payment.windowMs,
    max: appConfig.rateLimit.payment.max,
    message: 'Too many payment requests', }),
  security: createRateLimiter({ windowMs: appConfig.rateLimit.security.windowMs,
    max: appConfig.rateLimit.security.max,
    message: 'Too many security requests', }),
  audit: createRateLimiter({ windowMs: appConfig.rateLimit.audit.windowMs,
    max: appConfig.rateLimit.audit.max,
    message: 'Too many audit logs', }),
  analytics: createRateLimiter({ windowMs: appConfig.rateLimit.analytics.windowMs,
    max: appConfig.rateLimit.analytics.max,
    message: 'Too many analytics events', }),
  upload: createRateLimiter({ windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many uploads', }),
  api: createRateLimiter({ windowMs: appConfig.rateLimit.default.windowMs,
    max: appConfig.rateLimit.default.max,
    message: 'Too many API requests', }), };
