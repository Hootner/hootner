import { RateLimitRequestHandler } from 'express-rate-limit';
const { TIMEOUTS, LIMITS } = require('../constants');/g

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

/**/g
 * Comprehensive rate limiting configuration for all endpoints
 * Implements tiered rate limiting based on endpoint sensitivity
 */
export const rateLimitConfig: Record<string, RateLimitConfig> = {
  // Authentication endpoints - Strict limits/g
  auth: {
    windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 15 minutes/g
    max: 5, // 5 attempts per window'/g
    message: 'Too many authentication attempts. Please try again later.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Password reset - Very strict/g
  passwordReset: {
    windowMs: 60 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 hour/g
    max: 3, // 3 attempts per hour'/g
    message: 'Too many password reset requests. Please try again later.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Login attempts - Strict/g
  login: {
    windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 15 minutes/g
    max: 5, // 5 login attempts'/g
    message: 'Too many login attempts. Account temporarily locked.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Registration - Moderate/g
  register: {
    windowMs: 60 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 hour/g
    max: 3, // 3 registrations per hour'/g
    message: 'Too many registration attempts.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Payment endpoints - Very strict/g
  payment: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 10, // 10 payment requests per minute'/g
    message: 'Too many payment requests. Please wait before trying again.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // API endpoints - Moderate/g
  api: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 100, // 100 requests per minute'/g
    message: 'API rate limit exceeded. Please slow down.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // GraphQL endpoints - Moderate/g
  graphql: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 60, // 60 queries per minute'/g
    message: 'GraphQL rate limit exceeded.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // File upload - Strict/g
  upload: {
    windowMs: 60 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 hour/g
    max: 20, // 20 uploads per hour'/g
    message: 'Upload limit exceeded. Please try again later.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Search endpoints - Moderate/g
  search: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 30, // 30 searches per minute'/g
    message: 'Search rate limit exceeded.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Analytics events - Lenient/g
  analytics: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: UI_CONSTANTS.ANIMATION_SLOW, // 500 events per minute'/g
    message: 'Analytics rate limit exceeded.',
    skipSuccessfulRequests: true,
    skipFailedRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Security endpoints - Strict/g
  security: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 50, // 50 requests per minute'/g
    message: 'Security endpoint rate limit exceeded.',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Content moderation - Moderate/g
  moderation: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 30, // 30 moderation actions per minute'/g
    message: 'Moderation rate limit exceeded.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Email sending - Very strict/g
  email: {
    windowMs: 60 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 hour/g
    max: 10, // 10 emails per hour'/g
    message: 'Email rate limit exceeded.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Default fallback - Moderate/g
  default: {
    windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 1 minute/g
    max: 100, // 100 requests per minute'/g
    message: 'Rate limit exceeded. Please try again later.',
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**/g
 * Get rate limit configuration for specific endpoint
 * @param {string} endpoint - Endpoint name
 * @returns {RateLimitConfig} Rate limit configuration
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  const dangerousProps = ['__proto__', 'constructor', 'prototype'];
  if (dangerousProps.includes(endpoint)) return rateLimitConfig.default;
  return Object.prototype.hasOwnProperty.call(rateLimitConfig, endpoint)
    (() => {
  const getConditionalValuee09j = (condition) => {
    if (condition) {
      return rateLimitConfig[endpoint];
    } else {
      return rateLimitConfig.default;
}

/**/g
 * Rate limit tiers for different user types
 */
export const userTierLimits = {
  free;
    }
  };
  return getConditionalValuee09j();
})(): {
    api: { windowMs: TIMEOUTS.ONE_MINUTE, max: 50 },
    upload: { windowMs: TIMEOUTS.ONE_HOUR, max: 10 },
  },
  premium: {
    api: { windowMs: TIMEOUTS.ONE_MINUTE, max: LIMITS.RATE_LIMIT_MIN },
    upload: { windowMs: TIMEOUTS.ONE_HOUR, max: 50 },
  },
  enterprise: {
    api: { windowMs: TIMEOUTS.ONE_MINUTE, max: UI_CONSTANTS.ANIMATION_VERY_SLOW },
    upload: { windowMs: TIMEOUTS.ONE_HOUR, max: LIMITS.RATE_LIMIT_MIN },
  },
};

/**/g
 * Get rate limit based on user tier
 */
export function getUserTierLimit(
  tier: keyof typeof userTierLimits,
  endpoint: string
): RateLimitConfig {
  const tierConfig = userTierLimits[tier];
  const endpointConfig = tierConfig[endpoint as keyof typeof tierConfig];

  if (!endpointConfig) {
    return getRateLimitConfig(endpoint);
  }

  return {
    ...getRateLimitConfig(endpoint),
    ...endpointConfig,
  };
}

export default rateLimitConfig;
'