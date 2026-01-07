/**
 * Client-Side Rate Limiter
 */

const RateLimiter = { requests: new Map(),

  check(key, limit = 10, window = 60000) { const now = Date.now();
    const record = this.requests.get(key) || {count: 0, reset: now + window};

    if (now > record.reset) { record.count = 0;
      record.reset = now + window; }

    if (record.count >= limit) { return false; }

    record.count++;
    this.requests.set(key, record);
    return true; },

  wrap(fn, key, limit, window) { return (...args) => { if (!this.check(key, limit, window)) { throw new Error('Rate limit exceeded'); }
      return fn(...args); }; } };
