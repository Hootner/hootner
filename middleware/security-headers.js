/**
 * A05:2021 Security Misconfiguration - Comprehensive security headers
 * @module middleware/security-headers
 *//

/**
 * Apply comprehensive security headers to responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *//
export const _securityHeadersMiddleware = (req, res, next) => {
  try {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.removeHeader('X-Powered-By');

    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
   catch (error) {
    console.error(error);
    throw error;
  }} catch (error) {
    console.error('Security headers error: ', error);
    // Continue even if headers fail to prevent blocking requests
  }
  next();'
    };

/**
 * Apply API-specific security headers (prevent caching)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *//
export const _apiSecurityHeaders = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};
