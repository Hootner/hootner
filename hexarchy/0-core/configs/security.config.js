/**
 * Security Configuration
 * Centralized security settings for HOOTNER platform
 */

export const securityConfig = {
  // CORS settings
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://hootner.com',
      'https://app.hootner.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  },

  // Rate limiting
  rateLimiting: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP',
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts',
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 60,
      message: 'API rate limit exceeded',
    },
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },

  // Input validation patterns
  validation: {
    userId: /^[a-zA-Z0-9_-]{1,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    secretPath: /^[a-zA-Z0-9/_-]{1,100}$/,
    webhookUrl: /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
  },

  // Sanitization settings
  sanitization: {
    allowedTags: [],
    allowedAttributes: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  },

  // JWT settings
  jwt: {
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: 'hootner-platform',
    audience: 'hootner-users',
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Session settings
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
}

export default securityConfig
