/**
 * Client-side rate limiter
 */

class RateLimiter { constructor(maxRequests = 10, perSeconds = 60) { this.maxRequests = maxRequests;
    this.perSeconds = perSeconds;
    this.requests = [];
    this.init(); }

  init() { window.addEventListener('beforeunload', () => this.clear()); }

  canRequest() { const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.perSeconds * 1000);
    if (this.requests.length >= this.maxRequests) { console.warn('Rate limit exceeded');
      return false; }
    this.requests.push(now);
    return true; }

  wrapFetch(originalFetch) { return (...args) => { if (this.canRequest()) { return originalFetch(...args); } else { return Promise.reject(new Error('Rate limit exceeded')); } }; }

  clear() { this.requests = []; } }

const limiter = new RateLimiter();
window.fetch = limiter.wrapFetch(window.fetch);

if (typeof module !== 'undefined' && module.exports) { module.exports = RateLimiter; }
