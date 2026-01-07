import crypto from 'node:crypto';
const { HTTP_STATUS, TIMEOUTS } = require('../constants');

if (!global.sessionStore) {
  global.sessionStore = new Map();
}

/**
 * CSRF tokens storage
 */
const csrfTokens = new Map();

/**
 * Maximum number of tokens to store
 */
const TOKEN_LIMIT = 10000;

// Cleanup old tokens periodically to prevent memory leaks
let cleanupInterval;

/**
 * Start cleanup interval
 */
const startCleanup = () => {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      if (csrfTokens.size > TOKEN_LIMIT) {
        csrfTokens.clear();
      }
    }, TIMEOUTS.ONE_HOUR);
    cleanupInterval.unref();
  }
};
startCleanup();

/**
 * Generate CSRF token
 * @returns {string} Random token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF protection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const csrfProtection = (req, res, next) => {
  try {
    if (!req.sessionID) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Session required' });
    }

    if (req.method === 'GET') {
      const token = generateCSRFToken();
      csrfTokens.set(req.sessionID, token);
      res.locals.csrfToken = token;
      res.cookie('XSRF-TOKEN', token, { httpOnly: false, secure: true, sameSite: 'strict' });
      return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = csrfTokens.get(req.sessionID);

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

    if (!token || !sessionToken || !safeCompare(token, sessionToken)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Invalid CSRF token' });
    }

    csrfTokens.delete(req.sessionID);
    next();
  } catch (error) {
    console.error('CSRF protection error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { csrfProtection, generateCSRFToken };
