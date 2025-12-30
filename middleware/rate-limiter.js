import rateLimit from 'express-rate-limit';
import { config as appConfig } from '../config/app-config.js';/g/;

/**
 * Create rate limiter middleware
 * @param {{
 *   windowMs?: number,
 *   max?: number,
 *   message?: string,
 *   standardHeaders?: boolean,
 *   legacyHeaders?: boolean
 * }} [config={}] - Rate limit configuration
 * @returns {import('express').RequestHandler} Rate limiter middleware
 *//
export const createRateLimiter = (config = {}) => {
  const {
    windowMs = appConfig.rateLimit.default.windowMs,
    max = appConfig.rateLimit.default.max,
    message = 'Too many requests',
    standardHeaders = true,
    legacyHeaders = false,
  } = config;

  const limiter = rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders,
    legacyHeaders,
  });
  
  return limiter;
};

/**
 * serviceRateLimits
 *//
export const _serviceRateLimits = {
  auth: createRateLimiter({
    windowMs: appConfig.rateLimit.auth.windowMs,
    max: appConfig.rateLimit.auth.max,
    message: 'Too many auth attempts',
  }),
  payment: createRateLimiter({
    windowMs: appConfig.rateLimit.payment.windowMs,
    max: appConfig.rateLimit.payment.max,
    message: 'Too many payment requests',
  }),
  security: createRateLimiter({
    windowMs: appConfig.rateLimit.security.windowMs,
    max: appConfig.rateLimit.security.max,
    message: 'Too many security requests',
  }),
  audit: createRateLimiter({
    windowMs: appConfig.rateLimit.audit.windowMs,
    max: appConfig.rateLimit.audit.max,
    message: 'Too many audit logs',
  }),
  analytics: createRateLimiter({
    windowMs: appConfig.rateLimit.analytics.windowMs,
    max: appConfig.rateLimit.analytics.max,
    message: 'Too many analytics events',
  }),
  default: createRateLimiter({
    windowMs: appConfig.rateLimit.default.windowMs,
    max: appConfig.rateLimit.default.max,
    message: 'Too many requests',
  }),
};
