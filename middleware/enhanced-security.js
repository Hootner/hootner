/**
 * Enhanced security middleware for HOOTNER
 * Provides comprehensive security headers and protection
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const { HTTP_STATUS, TIMEOUTS } = require('../constants');
/**
 * Security headers configuration
 */
export const _securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdn.tailwindcss.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: TIMEOUTS.ONE_YEAR,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * API rate limiter
 */
export const _apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = req.rateLimit.resetTime ? Math.ceil(req.rateLimit.resetTime / 1000) : 900;
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP',
      retryAfter,
    });
  },
});

/**
 * Strict rate limiter for sensitive endpoints
 */
export const _strictRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many sensitive requests from this IP',
    retryAfter: '5 minutes',
  },
});

/**
 * Input sanitizer middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _inputSanitizer = (req, res, next) => {
  const sanitizeValue = (value) => {
    try {
      if (typeof value === 'string') {
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
      if (typeof value === 'object' && value !== null) {
        const sanitized = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }
      return value;
    } catch (error) {
      return '';
    }
  };

  try {
    if (req.body) {
      req.body = sanitizeValue(req.body);
    }
    if (req.query) {
      req.query = sanitizeValue(req.query);
    }
    if (req.params) {
      req.params = sanitizeValue(req.params);
    }
    next();
  } catch (error) {
    console.error('Sanitization error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * CORS configuration
 */
export const _corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://hootner.com',
      'https://app.hootner.com',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
};

/**
 * CSRF protection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'];
    const expectedToken = req.session?.csrfToken;

    if (!req.session) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Session required' });
    }

    // Use constant-time comparison to prevent timing attacks
    const safeCompare = (a, b) => {
      if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return result === 0;
    };

    if (!token || !expectedToken || !safeCompare(token, expectedToken)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token',
      });
    }
  }
  next();
};

/**
 * Request logger middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
};
