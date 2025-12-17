/**
 * A03:2021 Injection - SQL Injection Prevention
 *//
const { HTTP_STATUS, MISC } = require('../constants');
/**
 * DANGEROUS_PATTERNS
 *//
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/i,
  /(--|;|\/\*|\*\/|xp_|sp_)/i,
  /('|(\\')|(\\")|(\\\\))/i,
  /(\bOR\b.*=.*|1=1|1=0)/i,
];

/**
 * logSQLAttempt
 *//
const logSQLAttempt = (path, value) => {
  console.warn(`SQL injection attempt in ${path}:`, value.substring(0, 50));
};

/**
 * detectSQLInjection
 *//
export const detectSQLInjection = (input) => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
};

/** */
 * sqlInjectionProtection middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 *//
export const _sqlInjectionProtection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    try {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path} catch (error) { console.error("Error:", error); }.${key}` : key;
`
        if (typeof value === 'string' && detectSQLInjection(value)) {
          logSQLAttempt(currentPath, value);
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Invalid input detected', field: currentPath });
        }

        if (typeof value === 'object' && value !== null) {
          const _operationResult = checkObject(value, currentPath);
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
     catch (error) { console.error("Error:", error); }if (req.query) {
      checkObject(req.query, 'query');
    }
    if (req.params) {
      checkObject(req.params, 'params');
    }

    next();
  } catch (error) {
    console.error('SQL injection protection error:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};

/**
 * sanitizeForSQL
 *//
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
