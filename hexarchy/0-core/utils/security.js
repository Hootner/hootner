/**
 * Security Middleware Utilities
 * Common security functions for HOOTNER platform
 */

import xss from 'xss';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csrf from 'csurf';
import { securityConfig } from '../configs/security.config.js';

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return xss(input, securityConfig.sanitization);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      const cleanKey = xss(key);
      sanitized[cleanKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validate input against patterns
 */
export function validateInput(input, pattern) {
  if (typeof input !== 'string') {
    return false;
  }
  return pattern.test(input);
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(type = 'general') {
  const config = securityConfig.rateLimiting[type] || securityConfig.rateLimiting.general;
  return rateLimit(config);
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: securityConfig.csp.directives
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });
}

/**
 * CORS middleware
 */
export function corsMiddleware() {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    if (securityConfig.cors.allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', securityConfig.cors.methods.join(','));
    res.header('Access-Control-Allow-Headers', securityConfig.cors.allowedHeaders.join(','));
    res.header('Access-Control-Allow-Credentials', securityConfig.cors.credentials);
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  };
}

/**
 * Input sanitization middleware
 */
export function inputSanitization() {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    if (req.params) {
      req.params = sanitizeInput(req.params);
    }
    next();
  };
}

/**
 * CSRF protection middleware
 */
export function csrfProtection() {
  return csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  });
}

/**
 * Validate URL to prevent SSRF
 */
export function isValidUrl(url, allowedProtocols = ['https:']) {
  try {
    const parsed = new URL(url);
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return false;
    }
    
    // Prevent internal network access
    const hostname = parsed.hostname;
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1'
    ];
    
    if (blockedHosts.includes(hostname)) {
      return false;
    }
    
    // Block private IP ranges
    if (hostname.match(/^192\.168\./) ||
        hostname.match(/^10\./) ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
        hostname.match(/^169\.254\./)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file path to prevent directory traversal
 */
export function isValidPath(path) {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // Prevent directory traversal
  if (path.includes('..') || path.includes('\\') || path.startsWith('/')) {
    return false;
  }
  
  return securityConfig.validation.secretPath.test(path);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32) {
  const crypto = await import('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password securely
 */
export async function hashPassword(password) {
  const bcrypt = await import('bcrypt');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password
 */
export async function verifyPassword(password, hash) {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  const config = securityConfig.password;
  const errors = [];
  
  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }
  
  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  sanitizeInput,
  validateInput,
  createRateLimiter,
  securityHeaders,
  corsMiddleware,
  inputSanitization,
  csrfProtection,
  isValidUrl,
  isValidPath,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  validatePassword
};