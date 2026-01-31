/**
 * AI Algorithm Authentication Middleware
 * Protects revenue optimization algorithms from unauthorized access
 */

const jwt = require('jsonwebtoken');

class AIAlgorithmAuth {
  /**
   * Authenticate API key for algorithm access
   */
  static authenticateAPIKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required',
        message: 'Add X-API-Key header or api_key parameter'
      });
    }

    // Validate API key (you should store these securely)
    const validKeys = process.env.AI_API_KEYS?.split(',') || [];
    
    if (!validKeys.includes(apiKey)) {
      return res.status(403).json({
        error: 'Invalid API key',
        message: 'Contact support for valid API key'
      });
    }

    // Log usage for billing
    req.apiKey = apiKey;
    req.authenticatedUser = true;
    next();
  }

  /**
   * Authenticate user session
   */
  static authenticateUser(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Login to access AI algorithms'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Please login again'
      });
    }
  }

  /**
   * Check if user has paid subscription
   */
  static requirePaidSubscription(req, res, next) {
    // Check if user has active subscription
    if (!req.user?.subscription?.active) {
      return res.status(402).json({
        error: 'Subscription required',
        message: 'Upgrade to access AI algorithms',
        upgradeUrl: '/pricing'
      });
    }

    next();
  }

  /**
   * Rate limiting for algorithm calls
   */
  static rateLimitAlgorithms(maxCalls = 10, windowMs = 60000) {
    const calls = new Map();

    return (req, res, next) => {
      const key = req.user?.id || req.ip;
      const now = Date.now();
      
      if (!calls.has(key)) {
        calls.set(key, []);
      }

      const userCalls = calls.get(key);
      
      // Remove old calls outside window
      const validCalls = userCalls.filter(time => now - time < windowMs);
      
      if (validCalls.length >= maxCalls) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Maximum ${maxCalls} calls per minute`,
          retryAfter: Math.ceil((validCalls[0] + windowMs - now) / 1000)
        });
      }

      validCalls.push(now);
      calls.set(key, validCalls);
      next();
    };
  }
}

module.exports = AIAlgorithmAuth;