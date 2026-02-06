/**
 * Rate Limiting System
 * Protects APIs from abuse and ensures fair resource usage
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('governance', 'rate-limiting');

class RateLimitingSystem {
  constructor() {
    this.limiters = new Map();
    this.violations = [];
    this.allowlists = new Set();
    this.blocklists = new Set();
    
    this._setupCleanupInterval();
  }

  /**
   * Register rate limiter
   */
  registerLimiter(name, config) {
    this.limiters.set(name, {
      name,
      windowMs: config.windowMs || 60000, // 1 minute default
      maxRequests: config.maxRequests || 100,
      keyGenerator: config.keyGenerator || ((req) => req.ip),
      message: config.message || 'Rate limit exceeded',
      requests: new Map(), // key -> { count, windowStart }
      blockDuration: config.blockDuration || 300000, // 5 minutes default
      ...config
    });

    logger.info('Rate limiter registered', { name, config });
  }

  /**
   * Check if request is allowed
   */
  isAllowed(limiterName, request) {
    const limiter = this.limiters.get(limiterName);
    if (!limiter) {
      logger.warn('Rate limiter not found', { limiterName });
      return { allowed: true, reason: 'limiter_not_found' };
    }

    const key = limiter.keyGenerator(request);
    
    // Check allowlist
    if (this.allowlists.has(key)) {
      return { allowed: true, reason: 'allowlisted' };
    }

    // Check blocklist
    if (this.blocklists.has(key)) {
      return { 
        allowed: false, 
        reason: 'blocklisted',
        retryAfter: null // Permanent block
      };
    }

    const now = Date.now();
    const requests = limiter.requests;
    const requestData = requests.get(key);

    // Initialize or reset window if expired
    if (!requestData || (now - requestData.windowStart) >= limiter.windowMs) {
      requests.set(key, {
        count: 1,
        windowStart: now,
        firstRequest: now
      });
      return { 
        allowed: true, 
        remaining: limiter.maxRequests - 1,
        resetTime: now + limiter.windowMs
      };
    }

    // Increment count
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > limiter.maxRequests) {
      this._handleViolation(limiterName, key, requestData, limiter);
      
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        retryAfter: Math.ceil((requestData.windowStart + limiter.windowMs - now) / 1000),
        limit: limiter.maxRequests,
        remaining: 0,
        resetTime: requestData.windowStart + limiter.windowMs
      };
    }

    return {
      allowed: true,
      limit: limiter.maxRequests,
      remaining: limiter.maxRequests - requestData.count,
      resetTime: requestData.windowStart + limiter.windowMs
    };
  }

  _handleViolation(limiterName, key, requestData, limiter) {
    const violation = {
      limiterName,
      key,
      timestamp: Date.now(),
      requestCount: requestData.count,
      windowStart: requestData.windowStart,
      severity: this._calculateSeverity(requestData.count, limiter.maxRequests)
    };

    this.violations.push(violation);

    logger.warn('Rate limit violation', violation);

    // Auto-block for severe violations
    if (violation.severity >= 5) {
      this._temporaryBlock(key, limiter.blockDuration);
    }

    // Publish security event for monitoring
    const securityEvent = new DomainEvent(
      EventTypes.SECURITY_INCIDENT,
      {
        type: 'rate_limit_violation',
        severity: violation.severity >= 5 ? 'high' : 'medium',
        key,
        limiterName,
        requestCount: requestData.count,
        limit: limiter.maxRequests
      },
      { source: 'rate-limiting' }
    );

    eventBus.publish(securityEvent);
  }

  _calculateSeverity(actual, limit) {
    const ratio = actual / limit;
    if (ratio >= 10) return 10; // Extreme
    if (ratio >= 5) return 5;   // High
    if (ratio >= 2) return 3;   // Medium
    return 1; // Low
  }

  /**
   * Temporarily block a key
   */
  _temporaryBlock(key, duration) {
    this.blocklists.add(key);
    
    logger.warn('Temporarily blocking key', { key, duration });

    // Auto-unblock after duration
    setTimeout(() => {
      this.blocklists.delete(key);
      logger.info('Auto-unblocked key', { key });
    }, duration);
  }

  /**
   * Add to allowlist (bypass rate limiting)
   */
  allowlist(key) {
    this.allowlists.add(key);
    logger.info('Key added to allowlist', { key });
  }

  /**
   * Add to blocklist (permanently block)
   */
  blocklist(key) {
    this.blocklists.add(key);
    logger.warn('Key added to blocklist', { key });
  }

  /**
   * Remove from blocklist
   */
  unblock(key) {
    this.blocklists.delete(key);
    logger.info('Key removed from blocklist', { key });
  }

  /**
   * Clean up expired request data
   */
  _setupCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [limiterName, limiter] of this.limiters.entries()) {
        let cleanedCount = 0;
        
        for (const [key, requestData] of limiter.requests.entries()) {
          if ((now - requestData.windowStart) >= limiter.windowMs) {
            limiter.requests.delete(key);
            cleanedCount++;
          }
        }

        if (cleanedCount > 0) {
          logger.debug('Cleaned up expired rate limit data', {
            limiterName,
            cleanedCount
          });
        }
      }

      // Clean up old violations (keep last 1000)
      if (this.violations.length > 1000) {
        this.violations = this.violations.slice(-1000);
      }
    }, 60000); // Clean up every minute
  }

  /**
   * Get rate limiting statistics
   */
  getStats(limiterName = null) {
    if (limiterName) {
      const limiter = this.limiters.get(limiterName);
      if (!limiter) return null;

      return {
        name: limiterName,
        config: {
          windowMs: limiter.windowMs,
          maxRequests: limiter.maxRequests,
          blockDuration: limiter.blockDuration
        },
        activeKeys: limiter.requests.size,
        recentViolations: this.violations.filter(v => 
          v.limiterName === limiterName && 
          Date.now() - v.timestamp < 3600000 // Last hour
        ).length
      };
    }

    // Global stats
    const now = Date.now();
    const recentViolations = this.violations.filter(v => 
      now - v.timestamp < 3600000
    );

    return {
      totalLimiters: this.limiters.size,
      allowlistedKeys: this.allowlists.size,
      blockedKeys: this.blocklists.size,
      recentViolations: recentViolations.length,
      violationsBySeverity: {
        low: recentViolations.filter(v => v.severity < 3).length,
        medium: recentViolations.filter(v => v.severity >= 3 && v.severity < 5).length,
        high: recentViolations.filter(v => v.severity >= 5).length
      },
      limiters: Array.from(this.limiters.keys()).map(name => this.getStats(name))
    };
  }

  /**
   * Reset limiter for specific key
   */
  reset(limiterName, key) {
    const limiter = this.limiters.get(limiterName);
    if (limiter) {
      limiter.requests.delete(key);
      logger.info('Rate limiter reset for key', { limiterName, key });
    }
  }
}

export const rateLimitingSystem = new RateLimitingSystem();

// Register default limiters
rateLimitingSystem.registerLimiter('api_general', {
  windowMs: 60000,     // 1 minute
  maxRequests: 100,    // 100 requests per minute
  keyGenerator: (req) => req.ip
});

rateLimitingSystem.registerLimiter('api_auth', {
  windowMs: 300000,    // 5 minutes
  maxRequests: 10,     // 10 auth attempts per 5 minutes
  keyGenerator: (req) => req.ip,
  blockDuration: 900000 // 15 minute block
});

rateLimitingSystem.registerLimiter('api_premium', {
  windowMs: 60000,     // 1 minute
  maxRequests: 1000,   // Higher limit for premium users
  keyGenerator: (req) => req.userId
});

export default rateLimitingSystem;