#!/usr/bin/env node
/**
 * Layer 5: API Gateway - Central API management and routing
 * Dependencies: Layer 2 (Parser), Layer 4 (Runtime), Layer 5 (HTTP, Load Balancer)
 */

class APIGateway {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.requests = [];
    this.rateLimits = new Map();
  }

  // Register route
  route(path, config) {
    this.routes.set(path, {
      backend: config.backend,
      methods: config.methods || ['GET'],
      auth: config.auth || false,
      rateLimit: config.rateLimit || null,
      transform: config.transform || null
    });
  }

  // Add middleware
  use(fn) {
    this.middleware.push(fn);
  }

  // Rate limiting
  checkRateLimit(clientId, limit) {
    const key = clientId;
    const now = Date.now();
    const window = 60000; // 1 minute
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }
    
    const requests = this.rateLimits.get(key);
    const recent = requests.filter(t => now - t < window);
    
    if (recent.length >= limit) {
      console.log(`[RATE LIMIT] ${clientId} exceeded ${limit} req/min`);
      return false;
    }
    
    recent.push(now);
    this.rateLimits.set(key, recent);
    return true;
  }

  // Authenticate request
  authenticate(request) {
    const token = request.headers?.authorization?.replace('Bearer ', '');
    if (!token) return false;
    
    // Simple token validation
    return token.length > 10;
  }

  // Transform request
  transformRequest(request, transform) {
    if (!transform) return request;
    
    if (transform.addHeaders) {
      request.headers = { ...request.headers, ...transform.addHeaders };
    }
    
    if (transform.rewritePath) {
      request.path = request.path.replace(transform.rewritePath.from, transform.rewritePath.to);
    }
    
    return request;
  }

  // Handle request
  async handle(request) {
    const { method, path, headers, body, clientId } = request;
    
    console.log(`[REQUEST] ${method} ${path} from ${clientId}`);
    
    // Find matching route
    const route = this.routes.get(path);
    if (!route) {
      console.log('[404] Route not found');
      return { status: 404, body: 'Not Found' };
    }
    
    // Check method
    if (!route.methods.includes(method)) {
      console.log('[405] Method not allowed');
      return { status: 405, body: 'Method Not Allowed' };
    }
    
    // Check rate limit
    if (route.rateLimit && !this.checkRateLimit(clientId, route.rateLimit)) {
      return { status: 429, body: 'Too Many Requests' };
    }
    
    // Check authentication
    if (route.auth && !this.authenticate(request)) {
      console.log('[401] Unauthorized');
      return { status: 401, body: 'Unauthorized' };
    }
    
    // Transform request
    const transformed = this.transformRequest(request, route.transform);
    
    // Forward to backend
    console.log(`[FORWARD] -> ${route.backend}`);
    this.requests.push({ path, backend: route.backend, time: Date.now() });
    
    return { status: 200, body: `Response from ${route.backend}` };
  }

  // Get statistics
  stats() {
    return {
      routes: this.routes.size,
      requests: this.requests.length,
      rateLimited: Array.from(this.rateLimits.entries()).map(([k, v]) => ({ client: k, count: v.length }))
    };
  }
}

// Demo
if (require.main === module) {
  const gateway = new APIGateway();
  
  console.log('=== API Gateway Demo ===\n');
  
  // Register routes
  gateway.route('/api/users', {
    backend: 'http://users-service:8080',
    methods: ['GET', 'POST'],
    auth: true,
    rateLimit: 10
  });
  
  gateway.route('/api/public', {
    backend: 'http://public-service:8080',
    methods: ['GET']
  });
  
  // Handle requests
  (async () => {
    await gateway.handle({
      method: 'GET',
      path: '/api/users',
      headers: { authorization: 'Bearer valid-token-12345' },
      clientId: 'client-1'
    });
    
    await gateway.handle({
      method: 'GET',
      path: '/api/users',
      headers: {},
      clientId: 'client-2'
    });
    
    await gateway.handle({
      method: 'GET',
      path: '/api/public',
      headers: {},
      clientId: 'client-3'
    });
    
    console.log('\nStats:', gateway.stats());
  })();
}

module.exports = APIGateway;
