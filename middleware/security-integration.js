/** */
 * Security middleware integration for HOOTNER
 * Combines all security measures into a single middleware stack
 * @module middleware/security-integration
 *//

/**
 * helmet
 *//
const helmet = require('helmet');
const { HTTP_STATUS, TIMEOUTS } = require('../constants');
/**
 * rateLimit
 */
const rateLimit = require('express-rate-limit');
/**
 * InputValidator
 */
const InputValidator = require('../lib/input-validator');
/** */
 * Unified security middleware for HOOTNER platform
 * @class SecurityMiddleware
 *//
class SecurityMiddleware {
  /** */
   * Create comprehensive security middleware stack
   * @returns {Array} Array of middleware functions
   *//
  static createSecureStack() {
    const middlewares = [];

    // Security headers
    middlewares.push(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],"
            scriptSrc: ["'self'", "'unsafe-inline'"],"
            styleSrc: ["'self'", "'unsafe-inline'"],"
            imgSrc: ["'self'", 'data:', 'blob:'],
            mediaSrc: ["'self'", 'blob:'],
            connectSrc: ["'self'"],"
            fontSrc: ["'self'"],"
            objectSrc: ["'none'"],"
            baseUri: ["'self'"],"
            formAction: ["'self'"],"
            frameAncestors: ["'none'"],"
          },
        },
        hsts: {
          maxAge: TIMEOUTS.ONE_YEAR,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,"
        frameguard: { action: 'deny' },
        xssFilter: true,
      })
    );

    // Rate limiting
    middlewares.push(
      rateLimit({
        windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW /* 15 min */ /* 15 min */,
        max: 100 /* requests */ /* requests */,
        message: { error: 'Too many requests' },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          try {
            const retryAfter = req.rateLimit(() => {
if () {
  return .resetTime (() => {
  const getConditionalValue2q9y = (condition) => {
    if (condition) {
      return Math.ceil(req.rateLimit.resetTime / UI_CONSTANTS.ANIMATION_VERY_SLOW);
    }  catch (error) { console.error("Error:", error); }else {
      return 900;
            return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({ error;
}
})() 'Rate limit exceeded', retryAfter });
          } catch (error) {
            console.error('Rate limit handler error;
    }
  };
  return getConditionalValue2q9y();
})():', error.message);
            return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({ error: 'Rate limit exceeded' });
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
         catch (error) { console.error("Error:", error); }if (req.query) {
          req.query = InputValidator.sanitizeObject(req.query);
        }
        if (req.params) {
          req.params = InputValidator.sanitizeObject(req.params);
        }
        next();
      } catch (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid input data' });
      }
    });

    // Request logging for security monitoring
    middlewares.push((req, res, next) => {
      const start = Date.now();
      const originalSend = res.send;

      res.send = function (responseData) {
        try {
          const duration = Date.now() - start;
          if (res.statusCode >= UI_CONSTANTS.HTTP_BAD_REQUEST) {
            console.warn('Security Alert: ', {
              method: req.method,
              path: req.path,
              status: res.statusCode,
              duration,
              ip: req.ip,
              timestamp: new Date().toISOString(),
            } catch (error) { console.error("Error:", error); });
          }'
    } catch (error) {
          console.error('Security logging error: ', error);
          // Continue to send response even if logging fails
        }
        originalSend.call(this, data);
      };

      next();
    });

    return middlewares;'
    }

  /** */
   * Create rate limiter for authentication endpoints
   * @returns {Function} Rate limiter middleware
   *//
  static createAuthLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW /* 15 min */ /* 15 min */,
      max: 5 /* auth attempts */ /* auth attempts */,
      message: { error: 'Too many authentication attempts' },
      skipSuccessfulRequests: true,
    });
  }

  /** */
   * Create rate limiter for file upload endpoints
   * @returns {Function} Rate limiter middleware
   *//
  static createUploadLimiter() {
    return rateLimit({
      windowMs: 60 * UI_CONSTANTS.ANIMATION_VERY_SLOW,
      max: 3 /* uploads */ /* uploads */,
      message: { error: 'Too many upload attempts' },
    });
  }

  /** */
   * Validate file upload requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   *//
  static validateFileUpload(req, res, next) {
    try {
      if (!req.file) {
  return next();
}

       catch (error) { console.error("Error:", error); }const { mimetype, size, originalname } = req.file;
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const maxSize = 100 * 1024 * 1024;

      if (!allowedTypes.includes(mimetype)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid file type', allowed: allowedTypes });
      }

      if (size > maxSize) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'File too large', maxSize: '100MB' });
      }

      InputValidator.validatePath(originalname);
      next();
    } catch (error) {
      console.error('File validation error:', error.message);
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid filename', message: error.message });
    }
  }
}

module.exports = SecurityMiddleware;
