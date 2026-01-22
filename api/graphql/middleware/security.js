/**
 * Security Middleware - Rate Limiting & Attack Prevention
 * Protects against DDoS, brute force, and injection attacks
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');

// Rate limiter configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded: ${req.ip} - ${req.path}`);
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

// Strict limiter for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5, // 5 attempts per 15 minutes
  'Too many authentication attempts, please try again later'
);

// GraphQL specific limiter
const graphqlLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  60, // 60 queries per minute
  'GraphQL rate limit exceeded'
);

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'https://cdn.jsdelivr.net'],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\'', 'ws:', 'wss:'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      objectSrc: ['\'none\''],
      mediaSrc: ['\'self\'', 'https:'],
      frameSrc: ['\'none\''],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    const sanitizedBody = {};
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        sanitizedBody[key] = xss(req.body[key]);
      } else {
        sanitizedBody[key] = req.body[key];
      }
    });
    req.body = sanitizedBody;
  }
  next();
};

// SQL/NoSQL injection prevention
const preventInjection = (req, res, next) => {
  const dangerousPatterns = [
    /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte)/i, // NoSQL
    /(union|select|insert|update|delete|drop|create|alter|exec|script)/i, // SQL
    /(<script|javascript:|onerror=|onload=)/i, // XSS
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return dangerousPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const hasInjection = checkValue(req.body) || checkValue(req.query) || checkValue(req.params);
  if (hasInjection) {
    console.warn(`Injection attempt detected: ${req.ip} - ${req.path}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  graphqlLimiter,
  securityHeaders,
  sanitizeInput,
  preventInjection,
  requestSizeLimiter,
};
