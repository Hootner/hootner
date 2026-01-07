// Minimal API Gateway - Routing, Rate Limiting, Auth, Circuit Breaker
class APIGateway {
  constructor() {
    this.routes = new Map();
    this.rateLimits = new Map();
    this.circuitBreakers = new Map();
    this.apiKeys = new Map();
  }

  // Register route
  addRoute(path, service) {
    this.routes.set(path, service);
    this.circuitBreakers.set(path, { failures: 0, state: 'closed', lastFail: 0 });
  }

  // Add API key
  addApiKey(key, limits = { rpm: 60 }) {
    this.apiKeys.set(key, limits);
    this.rateLimits.set(key, { requests: [], window: 60000 });
  }

  // Authenticate
  authenticate(apiKey) {
    if (!this.apiKeys.has(apiKey)) {
      throw new Error('Invalid API key');
    }
    return true;
  }

  // Rate limiting (sliding window)
  checkRateLimit(apiKey) {
    const limits = this.apiKeys.get(apiKey);
    const tracker = this.rateLimits.get(apiKey);
    const now = Date.now();

    // Remove old requests outside window
    tracker.requests = tracker.requests.filter(t => now - t < tracker.window);

    if (tracker.requests.length >= limits.rpm) {
      throw new Error('Rate limit exceeded');
    }

    tracker.requests.push(now);
    return true;
  }

  // Circuit breaker
  checkCircuitBreaker(path) {
    const cb = this.circuitBreakers.get(path);
    const now = Date.now();

    if (cb.state === 'open') {
      // Try to close after 30s
      if (now - cb.lastFail > 30000) {
        cb.state = 'half-open';
        console.log(`  Circuit breaker ${path}: half-open`);
      } else {
        throw new Error('Circuit breaker open');
      }
    }
  }

  recordSuccess(path) {
    const cb = this.circuitBreakers.get(path);
    cb.failures = 0;
    if (cb.state === 'half-open') {
      cb.state = 'closed';
      console.log(`  Circuit breaker ${path}: closed`);
    }
  }

  recordFailure(path) {
    const cb = this.circuitBreakers.get(path);
    cb.failures++;
    cb.lastFail = Date.now();

    if (cb.failures >= 3) {
      cb.state = 'open';
      console.log(`  Circuit breaker ${path}: OPEN (too many failures)`);
    }
  }

  // Handle request
  async request(path, apiKey, data) {
    console.log(`\nRequest: ${path}`);

    try {
      // Auth
      this.authenticate(apiKey);
      console.log('  ✓ Authenticated');

      // Rate limit
      this.checkRateLimit(apiKey);
      console.log('  ✓ Rate limit OK');

      // Circuit breaker
      this.checkCircuitBreaker(path);

      // Route to service
      const service = this.routes.get(path);
      if (!service) {
        throw new Error('Route not found');
      }

      const response = await service.handle(data);
      this.recordSuccess(path);
      console.log('  ✓ Success');
      return response;

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      if (this.routes.has(path)) {
        this.recordFailure(path);
      }
      throw error;
    }
  }
}

// Mock service
class Service {
  constructor(name, failRate = 0) {
    this.name = name;
    this.failRate = failRate;
  }

  async handle(data) {
    if (Math.random() < this.failRate) {
      throw new Error('Service unavailable');
    }
    return { service: this.name, result: `Processed: ${data}` };
  }
}

// Demo
console.log('=== API Gateway Demo ===');

const gateway = new APIGateway();

// Setup
gateway.addRoute('/users', new Service('UserService'));
gateway.addRoute('/orders', new Service('OrderService', 0.8)); // 80% fail rate
gateway.addApiKey('key-123', { rpm: 5 });

// Test requests
(async () => {
  try {
    await gateway.request('/users', 'key-123', 'get user 1');
    await gateway.request('/users', 'key-123', 'get user 2');
    
    // Trigger circuit breaker
    for (let i = 0; i < 5; i++) {
      try {
        await gateway.request('/orders', 'key-123', `order ${i}`);
      } catch (e) {}
    }

    // Rate limit test
    for (let i = 0; i < 7; i++) {
      try {
        await gateway.request('/users', 'key-123', `request ${i}`);
      } catch (e) {}
    }

  } catch (error) {
    console.error(error.message);
  }
})();

export default APIGateway;
