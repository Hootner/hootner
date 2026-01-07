// Minimal Rate Limiter - Token Bucket, Leaky Bucket, Sliding Window
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens per second
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  consume(tokens = 1) {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}

class LeakyBucket {
  constructor(capacity, leakRate) {
    this.capacity = capacity;
    this.queue = [];
    this.leakRate = leakRate; // requests per second
    this.lastLeak = Date.now();
  }

  leak() {
    const now = Date.now();
    const elapsed = (now - this.lastLeak) / 1000;
    const leakCount = Math.floor(elapsed * this.leakRate);
    
    for (let i = 0; i < leakCount && this.queue.length > 0; i++) {
      this.queue.shift();
    }
    
    this.lastLeak = now;
  }

  add() {
    this.leak();
    
    if (this.queue.length < this.capacity) {
      this.queue.push(Date.now());
      return true;
    }
    return false;
  }
}

class SlidingWindow {
  constructor(windowSize, maxRequests) {
    this.windowSize = windowSize; // milliseconds
    this.maxRequests = maxRequests;
    this.requests = [];
  }

  allow() {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    // Remove old requests
    this.requests = this.requests.filter(t => t > windowStart);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}

class RateLimiter {
  constructor(algorithm, ...args) {
    switch (algorithm) {
      case 'token-bucket':
        this.limiter = new TokenBucket(...args);
        break;
      case 'leaky-bucket':
        this.limiter = new LeakyBucket(...args);
        break;
      case 'sliding-window':
        this.limiter = new SlidingWindow(...args);
        break;
      default:
        throw new Error('Unknown algorithm');
    }
    this.algorithm = algorithm;
  }

  allow(tokens = 1) {
    switch (this.algorithm) {
      case 'token-bucket':
        return this.limiter.consume(tokens);
      case 'leaky-bucket':
        return this.limiter.add();
      case 'sliding-window':
        return this.limiter.allow();
    }
  }
}

// Demo
console.log('=== Rate Limiter Demo ===\n');

// Token Bucket: 10 tokens, refill 2/sec
console.log('--- Token Bucket (10 capacity, 2/sec refill) ---');
const tokenBucket = new RateLimiter('token-bucket', 10, 2);

for (let i = 1; i <= 15; i++) {
  const allowed = tokenBucket.allow();
  console.log(`Request ${i}: ${allowed ? '✓ allowed' : '✗ denied'}`);
}

// Wait and retry
setTimeout(() => {
  console.log('\nAfter 2 seconds (4 tokens refilled):');
  for (let i = 1; i <= 5; i++) {
    const allowed = tokenBucket.allow();
    console.log(`Request ${i}: ${allowed ? '✓ allowed' : '✗ denied'}`);
  }
}, 2000);

// Sliding Window: 5 requests per 3 seconds
setTimeout(() => {
  console.log('\n--- Sliding Window (5 requests per 3 seconds) ---');
  const slidingWindow = new RateLimiter('sliding-window', 3000, 5);

  for (let i = 1; i <= 8; i++) {
    const allowed = slidingWindow.allow();
    console.log(`Request ${i}: ${allowed ? '✓ allowed' : '✗ denied'}`);
  }
}, 3000);

export default RateLimiter;
