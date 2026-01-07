/**
 * A03:2021 Injection - SQL Injection Prevention
 */
const { HTTP_STATUS, LIMITS } = require('../constants');

/**
 * Dangerous SQL patterns
 */
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /('|(\\')|(\\")|(\\\\))/i,
  /(\bOR\b.*=.*|1=1|1=0)/i,
];

/**
 * Log SQL injection attempt
 */
const logSQLAttempt = (path, value) => {
  console.warn(`SQL injection attempt in ${path}:`, value.substring(0, 50));
};

/**
 * Detect SQL injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if SQL injection detected
 */
export const detectSQLInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
};

/**
 * SQL injection protection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _sqlInjectionProtection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    try {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string' && detectSQLInjection(value)) {
          logSQLAttempt(currentPath, value);
          return res.status(400).json({
            error: 'Invalid input detected',
            field: currentPath,
          });
        }

        if (typeof value === 'object' && value !== null) {
          const result = checkObject(value, currentPath);
          if (result) {
            return result;
          }
        }
      }
    } catch (error) {
      return null;
    }
  };

  try {
    // Check all input sources
    if (req.body) {
      checkObject(req.body, 'body');
    }
    if (req.query) {
      checkObject(req.query, 'query');
    }
    if (req.params) {
      checkObject(req.params, 'params');
    }

    next();
  } catch (error) {
    console.error('SQL injection protection error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Sanitize input for SQL (use parameterized queries instead)
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const _sanitizeForSQL = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Use parameterized queries instead, but this provides basic sanitization
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
};
