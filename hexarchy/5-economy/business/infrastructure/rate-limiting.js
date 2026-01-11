/**
 * Rate Limiting Service
 * API protection and usage analytics
 */

class RateLimiting {
  constructor() {
    this.limits = new Map();
    this.usage = new Map();
    this.defaultLimits = {
      'free': { requests: 1000, window: 3600000 }, // 1000/hour
      'pro': { requests: 10000, window: 3600000 }, // 10k/hour
      'enterprise': { requests: 100000, window: 3600000 } // 100k/hour
    };
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
  }

  async checkLimit({ identifier, endpoint, method = 'GET', tier = 'free' }) {
    const key = `${identifier}:${endpoint}:${method}`;
    const now = Date.now();
    
    console.log(`🚦 Checking rate limit for ${identifier} on ${method} ${endpoint}`);
    
    // Get or create usage record
    if (!this.usage.has(key)) {
      this.usage.set(key, {
        requests: [],
        tier,
        firstRequest: now,
        lastRequest: now
      });
    }
    
    const usage = this.usage.get(key);
    const limit = this.getLimitForTier(tier);
    
    // Clean old requests outside the window
    usage.requests = usage.requests.filter(timestamp => now - timestamp < limit.window);
    
    // Check if limit exceeded
    const currentCount = usage.requests.length;
    const allowed = currentCount < limit.requests;
    
    if (allowed) {
      usage.requests.push(now);
      usage.lastRequest = now;
    }
    
    const result = {
      identifier,
      endpoint,
      method,
      allowed,
      limit: limit.requests,
      remaining: Math.max(0, limit.requests - currentCount - (allowed ? 1 : 0)),
      resetTime: new Date(now + limit.window).toISOString(),
      retryAfter: allowed ? null : this.calculateRetryAfter(usage.requests, limit.window)
    };
    
    // Log rate limit violation
    if (!allowed) {
      console.log(`🚫 Rate limit exceeded for ${identifier}: ${currentCount}/${limit.requests}`);
      await this.logViolation(identifier, endpoint, method, currentCount, limit.requests);
    }
    
    return result;
  }

  getLimitForTier(tier) {
    return this.defaultLimits[tier] || this.defaultLimits['free'];
  }

  calculateRetryAfter(requests, window) {
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const retryAfter = Math.ceil((oldestRequest + window - Date.now()) / 1000);
    
    return Math.max(0, retryAfter);
  }

  async setCustomLimit({ identifier, requests, window, description = '' }) {
    const limitId = `custom_${identifier}_${Date.now()}`;
    
    const customLimit = {
      id: limitId,
      identifier,
      requests,
      window,
      description,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    this.limits.set(identifier, customLimit);
    
    console.log(`⚙️ Set custom limit for ${identifier}: ${requests} requests per ${window}ms`);
    
    return customLimit;
  }

  async getUsageStats(identifier, timeRange = '24h') {
    const now = Date.now();
    const rangeMs = this.parseTimeRange(timeRange);
    const startTime = now - rangeMs;
    
    // Collect usage data for identifier
    const usageData = [];
    
    for (const [key, usage] of this.usage.entries()) {
      if (key.startsWith(`${identifier}:`)) {
        const recentRequests = usage.requests.filter(timestamp => timestamp >= startTime);
        
        if (recentRequests.length > 0) {
          const [, endpoint, method] = key.split(':');
          usageData.push({
            endpoint,
            method,
            requests: recentRequests.length,
            tier: usage.tier,
            firstRequest: new Date(Math.min(...recentRequests)).toISOString(),
            lastRequest: new Date(Math.max(...recentRequests)).toISOString()
          });
        }
      }
    }
    
    const totalRequests = usageData.reduce((sum, data) => sum + data.requests, 0);
    const limit = this.getLimitForTier(usageData[0]?.tier || 'free');
    
    return {
      identifier,
      timeRange,
      totalRequests,
      limit: limit.requests,
      utilizationRate: `${((totalRequests / limit.requests) * 100).toFixed(2)}%`,
      endpoints: usageData,
      generatedAt: new Date().toISOString()
    };
  }

  async logViolation(identifier, endpoint, method, currentCount, limit) {
    const violation = {
      identifier,
      endpoint,
      method,
      currentCount,
      limit,
      timestamp: new Date().toISOString(),
      severity: currentCount > limit * 1.5 ? 'high' : 'medium'
    };
    
    // In production, this would:
    // - Store in database
    // - Send alerts
    // - Update security metrics
    
    return violation;
  }

  parseTimeRange(range) {
    const match = range.match(/(\d+)([smhd])/);
    if (!match) return 24 * 60 * 60 * 1000; // Default 24 hours
    
    const [, value, unit] = match;
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    
    return parseInt(value) * multipliers[unit];
  }

  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, usage] of this.usage.entries()) {
      // Remove old requests
      usage.requests = usage.requests.filter(timestamp => now - timestamp < maxAge);
      
      // Remove empty usage records
      if (usage.requests.length === 0 && now - usage.lastRequest > maxAge) {
        this.usage.delete(key);
      }
    }
    
    console.log(`🧹 Cleaned up rate limiting data: ${this.usage.size} active records`);
  }

  async generateAnalytics(timeRange = '24h') {
    const now = Date.now();
    const rangeMs = this.parseTimeRange(timeRange);
    const startTime = now - rangeMs;
    
    const analytics = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRequests: 0,
        uniqueIdentifiers: new Set(),
        violations: 0,
        topEndpoints: new Map(),
        tierUsage: { free: 0, pro: 0, enterprise: 0 }
      }
    };
    
    for (const [key, usage] of this.usage.entries()) {
      const recentRequests = usage.requests.filter(timestamp => timestamp >= startTime);
      
      if (recentRequests.length > 0) {
        const [identifier, endpoint] = key.split(':');
        
        analytics.summary.totalRequests += recentRequests.length;
        analytics.summary.uniqueIdentifiers.add(identifier);
        analytics.summary.tierUsage[usage.tier] += recentRequests.length;
        
        // Track top endpoints
        const endpointCount = analytics.summary.topEndpoints.get(endpoint) || 0;
        analytics.summary.topEndpoints.set(endpoint, endpointCount + recentRequests.length);
        
        // Check for violations
        const limit = this.getLimitForTier(usage.tier);
        if (recentRequests.length > limit.requests) {
          analytics.summary.violations++;
        }
      }
    }
    
    // Convert to arrays for easier consumption
    analytics.summary.uniqueIdentifiers = analytics.summary.uniqueIdentifiers.size;
    analytics.summary.topEndpoints = Array.from(analytics.summary.topEndpoints.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, requests: count }));
    
    return analytics;
  }

  async enforce({ identifier, limit = 1000, window = '1h', endpoint = '/api/*' }) {
    console.log(`🚦 Enforcing rate limit: ${limit} requests per ${window} for ${identifier}`);
    
    const windowMs = this.parseTimeRange(window);
    
    // Set custom limit if different from default
    if (limit !== this.defaultLimits.free.requests || windowMs !== this.defaultLimits.free.window) {
      await this.setCustomLimit({ identifier, requests: limit, window: windowMs });
    }
    
    return await this.checkLimit({ identifier, endpoint, tier: 'custom' });
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = new RateLimiting();