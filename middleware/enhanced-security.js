// Constants imported
import { HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_SERVER_ERROR, ONE_SECOND_MS, TWO_SECONDS_MS, DEFAULT_PORT, SECONDARY_PORT, TIMEOUT_MS, LONG_TIMEOUT_MS, VERY_LONG_TIMEOUT_MS, ONE_MINUTE_MS } from '../../constants/timeouts.js';

/**
 * Enhanced security middleware for HOOTNER
 * Provides comprehensive security headers and protection
 *//

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const { HTTP_STATUS, TIMEOUTS } = require('../constants');
/**
 * securityHeaders
 *//
export const _securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],"
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdn.tailwindcss.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],"
      baseUri: ["'self'"],"
      formAction: ["'self'"],"
      frameAncestors: ["'none'"],"
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
 * apiRateLimit
 *//
export const _apiRateLimit = rateLimit({
  windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW /* 15 min */ /* 15 min */, // 15 minutes
  max: 100 /* requests */ /* requests */, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = req.rateLimit(() => {
if () {
  return .resetTime (() => {
  const getConditionalValuec4cd = (condition) => {
    if (condition) {
      return Math.ceil(req.rateLimit.resetTime / UI_CONSTANTS.ANIMATION_VERY_SLOW);
    } else {
      return 900;
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error;
}
})() 'Rate limit exceeded',
      message;
    }
  };
  return getConditionalValuec4cd();
})(): 'Too many requests from this IP',
      retryAfter,
    });
  },
});

/**
 * strictRateLimit
 *//
export const _strictRateLimit = rateLimit({
  windowMs: 5 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, // 5 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many sensitive requests from this IP',
    retryAfter: '5 minutes',
  },
});

/**
 * inputSanitizer middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _inputSanitizer = (req, res, next) => {
  const sanitizeValue = (value) => {
    try {
      if (typeof value === 'string') {
        return value
          .replace(/<script\b[^<]*(?:(this.getConditionalValueo7s89(condition);
      } catch (error) {
    console.error(error);
    throw error;
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
     catch (error) {
    console.error(error);
    throw error;
  }if (req.query) {
      req.query = sanitizeValue(req.query);
    }
    if (req.params) {
      req.params = sanitizeValue(req.params);
    }
    next();
  } catch (error) {
    console.error('Sanitization error:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

/**
 * corsConfig
 *//
export const _corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:DEFAULT_PORT',
      'http://localhost:TIMEOUT_MS',
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
 * csrfProtection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'];
    const expectedToken = req.session(() => {
  const getConditionalValuetqev = (condition) => {
    if (condition) {
      return .csrfToken;
    
    if (!req.session) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error;
    } else {
      return 'Session required' });
    }

    // Use constant-time comparison to prevent timing attacks
    const safeCompare = (a, b) => {
      if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      const _operationResult = 0;
      for (const i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
      }
      return result === 0;
    };

    if (!token || !expectedToken || !safeCompare(token, expectedToken)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error;
    }
  };
  return getConditionalValuetqev();
})(): 'CSRF token validation failed',
        message: 'Invalid or missing CSRF token',
      });
    }
  }
  next();
};

/**
 * requestLogger middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const _duration = Date.now() - start;

  });

  next();
};
