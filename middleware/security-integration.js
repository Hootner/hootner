/**
 * Security middleware integration for HOOTNER
 * Combines all security measures into a single middleware stack
 * @module middleware/security-integration
 */

const helmet = require('helmet');
const { HTTP_STATUS, TIMEOUTS } = require('../constants');
const rateLimit = require('express-rate-limit');
const InputValidator = require('../lib/input-validator');

/**
 * Unified security middleware for HOOTNER platform
 * @class SecurityMiddleware
 */
class SecurityMiddleware {
  /**
   * Create comprehensive security middleware stack
   * @returns {Array} Array of middleware functions
   */
  static createSecureStack() {
    const middlewares = [];

    // Security headers
    middlewares.push(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'blob:'],
            mediaSrc: ["'self'", 'blob:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
          },
        },
        hsts: {
          maxAge: TIMEOUTS.ONE_YEAR,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        frameguard: { action: 'deny' },
        xssFilter: true,
      })
    );

    // Rate limiting
    middlewares.push(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: { error: 'Too many requests' },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          try {
            const retryAfter = req.rateLimit?.resetTime ? Math.ceil(req.rateLimit.resetTime / 1000) : 900;
            return res.status(429).json({ error: 'Rate limit exceeded', retryAfter });
          } catch (error) {
            console.error('Rate limit handler error:', error.message);
            return res.status(429).json({ error: 'Rate limit exceeded' });
          }
        },
      })
    );

    // Input sanitization
    middlewares.push((req, res, next) => {
      try {
        if (req.body) {
          req.body = InputValidator.sanitizeObject(req.body);
        }
        if (req.query) {
          req.query = InputValidator.sanitizeObject(req.query);
        }
        if (req.params) {
          req.params = InputValidator.sanitizeObject(req.params);
        }
        next();
      } catch (error) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
    });

    // Request logging for security monitoring
    middlewares.push((req, res, next) => {
      const start = Date.now();
      const originalSend = res.send;

      res.send = function (data) {
        try {
          const duration = Date.now() - start;
          if (res.statusCode >= 400) {
            console.warn('Security Alert:', {
              method: req.method,
              path: req.path,
              status: res.statusCode,
              duration,
              ip: req.ip,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Security logging error:', error);
        }
        originalSend.call(this, data);
      };

      next();
    });

    return middlewares;
  }

  /**
   * Create rate limiter for authentication endpoints
   * @returns {Function} Rate limiter middleware
   */
  static createAuthLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: { error: 'Too many authentication attempts' },
      skipSuccessfulRequests: true,
    });
  }

  /**
   * Create rate limiter for file upload endpoints
   * @returns {Function} Rate limiter middleware
   */
  static createUploadLimiter() {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 3,
      message: { error: 'Too many upload attempts' },
    });
  }

  /**
   * Validate file upload requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static validateFileUpload(req, res, next) {
    try {
      if (!req.file) {
        return next();
      }

      const { mimetype, size, originalname } = req.file;
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxSize = 100 * 1024 * 1024;

      if (!allowedTypes.includes(mimetype)) {
        return res.status(400).json({ error: 'Invalid file type', allowed: allowedTypes });
      }

      if (size > maxSize) {
        return res.status(400).json({ error: 'File too large', maxSize: '100MB' });
      }

      InputValidator.validatePath(originalname);
      next();
    } catch (error) {
      console.error('File validation error:', error.message);
      return res.status(400).json({ error: 'Invalid filename', message: error.message });
    }
  }
}

module.exports = SecurityMiddleware;
