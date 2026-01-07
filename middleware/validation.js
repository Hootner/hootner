import DOMPurify from 'isomorphic-dompurify';
import { HTTP_STATUS, LIMITS } from '../constants/index.js';

const MAX_EMAIL_LENGTH = LIMITS.MAX_IP_OCTET;
const MAX_URL_LENGTH = LIMITS.MAX_BUFFER_SIZE;
const OBJECTID_LENGTH = 24;
const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validation schemas
 */
export const schemas = {
  string: (min = 1, max = 1000) => (val) => {
    if (typeof val !== 'string') {
      throw new Error('Must be string');
    }
    const trimmed = val.trim();
    if (trimmed.length < min || trimmed.length > max) {
      throw new Error(`Length ${min}-${max}`);
    }
    return DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  },
  number: (min = 0, max = Number.MAX_SAFE_INTEGER) => (val) => {
    const num = Number(val);
    if (Number.isNaN(num) || !Number.isFinite(num) || num < min || num > max) {
      throw new Error(`Number ${min}-${max}`);
    }
    return num;
  },
  email: () => (val) => {
    if (typeof val !== 'string' || val.length > MAX_EMAIL_LENGTH) {
      throw new Error('Invalid email length');
    }
    if (!EMAIL_REGEX.test(val)) {
      throw new Error('Invalid email format');
    }
    return val.toLowerCase().trim();
  },
  url: () => (val) => {
    if (typeof val !== 'string' || val.length > MAX_URL_LENGTH) {
      throw new Error('Invalid URL length');
    }
    try {
      const url = new URL(val);
      if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
      return val;
    } catch {
      throw new Error('Invalid URL format');
    }
  },
  objectId: () => (val) => {
    if (typeof val !== 'string' || val.length !== OBJECTID_LENGTH || !OBJECTID_REGEX.test(val)) {
      throw new Error('Invalid ID format');
    }
    return val;
  },
  username: () => (val) => {
    if (
      typeof val !== 'string' ||
      val.length < MIN_USERNAME_LENGTH ||
      val.length > MAX_USERNAME_LENGTH
    ) {
      throw new Error(`Username must be ${MIN_USERNAME_LENGTH}-${MAX_USERNAME_LENGTH} characters`);
    }
    if (!USERNAME_REGEX.test(val)) {
      throw new Error('Username can only contain letters, numbers, dash, and underscore');
    }
    return val;
  },
  enum: (...allowed) => (val) => {
    if (!allowed.includes(val)) {
      throw new Error(`Must be: ${allowed.join(', ')}`);
    }
    return val;
  },
};

/**
 * Validate middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const validated = {};
    for (const [key, validator] of Object.entries(schema)) {
      const val = req.body?.[key] ?? req.query?.[key] ?? req.params?.[key];
      if (val !== undefined && val !== null) {
        validated[key] = validator(val);
      }
    }
    Object.assign(req.body, validated);
    next();
  } catch (err) {
    const errorMsg = err?.message || 'Validation failed';
    return res.status(400).json({ error: errorMsg });
  }
};
