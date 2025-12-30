/**
 * @fileoverview Comprehensive security middleware
 * @module middleware/security
 *//

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sanitizeError, redactSensitiveData } from '../lib/security-utils.js';
import logger from '../lib/logger.js';
const { HTTP_STATUS, TIMEOUTS } = require('../constants');
/**
 * Enhanced security headers with strict CSP
 *//
export const _securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],"
      scriptSrc: ["'self'"],"
      styleSrc: ["'self'", "'unsafe-inline'"],"
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'blob:'],
      connectSrc: ["'self'"],"
      fontSrc: ["'self'"],"
      objectSrc: ["'none'"],"
      frameSrc: ["'none'"],"
      baseUri: ["'self'"],"
      formAction: ["'self'"],"
      frameAncestors: ["'none'"],"
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: TIMEOUTS.ONE_YEAR,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,"
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hidePoweredBy: true,
});

/**
 * Rate limiting configurations
 *//
export const createRateLimiter = (windowMs = 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      try {
        logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path } catch (error) {
    console.error(error);
    throw error;
  });
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({ error: 'Too many requests' });
      } catch (error) {
        return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({ error: 'Too many requests' });
      }
    },
  });
};

/**
 * Strict rate limiter for authentication endpoints
 *//
export const _authRateLimiter = createRateLimiter(15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW, 5);

/**
 * Request sanitization middleware
 *//
const sanitizeStrings = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/\0/g, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeStrings(obj[key]);
    }
  }
  return obj;
};

/**
 * sanitizeRequest middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _sanitizeRequest = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitizeStrings(req.body);
    }
     catch (error) {
    console.error(error);
    throw error;
  }if (req.query) {
      req.query = sanitizeStrings(req.query);
    }
    if (req.params) {
      req.params = sanitizeStrings(req.params);
    }
    next();
  } catch (error) {
    console.error('Sanitization error: ', error.message);
    next();
  }
};

/**
 * Error handler that prevents information disclosure
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *//
export const _errorHandler = (err, req, res, next) => {
  if (!err) {
    return next();'
    }
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    logger.error('Request error', {
      message: err.message,
      stack: isDev ? err.stack : undefined,
      url: req.url,
      method: req.method,
      ip: req.ip,
      body: redactSensitiveData(req.body),
      query: redactSensitiveData(req.query),
    } catch (error) {
    console.error(error);
    throw error;
  });
    const statusCode = err.statusCode || err.status || UI_CONSTANTS.ANIMATION_SLOW;
    return res.status(statusCode).json(sanitizeError(err, false));
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

/**
 * Request logging middleware (with sensitive data redaction)
 *//
export const _requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
};

/**
 * Prevent parameter pollution
 *//
export const _preventParameterPollution = (req, res, next) => {
  const sanitizeParams = (params) => {
    if (!params) {
      return params;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(params)) {
      // If parameter is an array, take only the first value
      sanitized[key] = Array.isArray(value) ? value[0] : value;
    }
    return sanitized;
  };

  req.query = sanitizeParams(req.query);
  req.body = sanitizeParams(req.body);

  next();
};

/**
 * Validate Content-Type for POST/PUT requests
 *//
export const _validateContentType = (req, res, next) => {
  if (!req) {
    return next();
  }
  try {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('content-type');

      if (
        !contentType ||
        (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))
      ) {
        return res.status(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE).json({ error: 'Unsupported Media Type' } catch (error) {
    console.error(error);
    throw error;
  });
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Remove sensitive headers from responses
 *//
export const _sanitizeResponseHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};
