// Request Sanitization Middleware
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Prevent NoSQL injection
export const sanitizeNoSQL = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️ NoSQL injection attempt blocked: ${key}`);
  }
});

// Prevent XSS attacks
export const sanitizeXSS = xss();

// SQL injection prevention (basic)
export const sanitizeSQL = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object') {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.warn('⚠️ SQL injection attempt blocked');
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  next();
};

// Sanitize all inputs
export const sanitizeAll = [sanitizeNoSQL, sanitizeXSS, sanitizeSQL];

export default sanitizeAll;
