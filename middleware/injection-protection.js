/**
 * @fileoverview Injection Protection Middleware
 * Express middleware for preventing injection attacks
 * @module middleware/injection-protection
 */

import { XSSProtection, NoSQLProtection } from '../lib/injection-protection.js';
import logger from '../lib/logger.js';
const { HTTP_STATUS, LIMITS } = require('../constants');

/**
 * Sanitize request data middleware
 * @returns {Function} Express middleware
 */
export function sanitizeRequest() {
  return (req, res, next) => {
    try {
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
      }

      // Sanitize params
      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      logger.error('Sanitization error:', { message: error.message, url: req.url });
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

/**
 * Recursively sanitize object
 * @param {*} obj - Object to sanitize
 * @param {number} depth - Current recursion depth
 * @returns {*} Sanitized object
 */
function sanitizeObject(obj, depth = 0) {
  // Prevent deep recursion
  if (depth > 10) {
    return {};
  }

  // Handle primitives
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  if (typeof obj === 'string') {
    return XSSProtection.stripHTML(obj).substring(0, LIMITS.MAX_RETRY_COUNT);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.slice(0, 100).map((item) => sanitizeObject(item, depth + 1));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const sanitized = {};
    const entries = Object.entries(obj).slice(0, 50);

    for (const [key, value] of entries) {
      // Remove dangerous keys
      if (key.startsWith('$') || key.startsWith('_')) {
        continue;
      }
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      // Sanitize key
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 50);
      if (cleanKey.length > 0) {
        sanitized[cleanKey] = sanitizeObject(value, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Prevent NoSQL injection middleware
 * @returns {Function} Express middleware
 */
export function preventNoSQLInjection() {
  return (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        req.body = NoSQLProtection.sanitizeQuery(req.body);
      }
      if (req.query && typeof req.query === 'object') {
        req.query = NoSQLProtection.sanitizeQuery(req.query);
      }
      if (req.params && typeof req.params === 'object') {
        req.params = NoSQLProtection.sanitizeQuery(req.params);
      }
      next();
    } catch (error) {
      logger.error('NoSQL protection error:', { message: error.message, url: req.url });
      return res.status(400).json({ error: 'Invalid query format' });
    }
  };
}

/**
 * Validate ObjectId parameters
 * @param {...string} params - Parameter names to validate
 * @returns {Function} Express middleware
 */
export function validateObjectId(...params) {
  return (req, res, next) => {
    try {
      for (const param of params) {
        const value = req.params[param] || req.query[param] || req.body[param];
        if (value && !NoSQLProtection.isValidObjectId(value)) {
          return res.status(400).json({ error: `Invalid ${param}` });
        }
      }
      next();
    } catch (error) {
      logger.error('ObjectId validation error:', { message: error.message });
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export default {
  sanitizeRequest,
  preventNoSQLInjection,
  validateObjectId,
};
