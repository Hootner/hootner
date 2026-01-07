export interface RateLimitConfig { windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean; }

export const rateLimitConfig: Record<string, RateLimitConfig> = { auth: { windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false, },
  passwordReset: { windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false, },
  login: { windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Account temporarily locked.',
    standardHeaders: true,
    legacyHeaders: false, },
  payment: { windowMs: 60 * 1000,
    max: 10,
    message: 'Too many payment requests. Please wait before trying again.',
    standardHeaders: true,
    legacyHeaders: false, },
  api: { windowMs: 60 * 1000,
    max: 100,
    message: 'API rate limit exceeded. Please slow down.',
    standardHeaders: true,
    legacyHeaders: false, },
  default: { windowMs: 60 * 1000,
    max: 100,
    message: 'Rate limit exceeded. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false, }, };

export function getRateLimitConfig(endpoint: string): RateLimitConfig { const dangerousProps = ['__proto__', 'constructor', 'prototype'];
  if (dangerousProps.includes(endpoint)) return rateLimitConfig.default;
  return Object.prototype.hasOwnProperty.call(rateLimitConfig, endpoint)
    ? rateLimitConfig[endpoint]
    : rateLimitConfig.default; }

export default rateLimitConfig;
