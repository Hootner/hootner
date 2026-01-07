#!/usr/bin/env node
/**
 * Layer 5: Proxy Server - Forward and reverse proxy with caching
 * Dependencies: Layer 3 (Memory), Layer 5 (HTTP, TCP)
 */

class ProxyServer {
  constructor(type = 'forward') {
    this.type = type; // 'forward' or 'reverse'
    this.cache = new Map();
    this.requests = [];
    this.backends = [];
  }

  // Add backend (for reverse proxy)
  addBackend(backend) {
    this.backends.push(backend);
  }

  // Forward proxy
  async forward(request) {
    const { method, url, headers } = request;
    
    console.log(`[FORWARD] ${method} ${url}`);
    
    // Check cache
    const cacheKey = `${method}:${url}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.time < 60000) {
        console.log('[CACHE HIT]');
        return cached.response;
      }
      this.cache.delete(cacheKey);
    }
    
    // Forward request
    const response = await this.sendRequest(url, { method, headers });
    
    // Cache response
    if (method === 'GET') {
      this.cache.set(cacheKey, {
        response,
        time: Date.now()
      });
    }
    
    this.requests.push({
      type: 'forward',
      method,
      url,
      cached: false,
      time: Date.now()
    });
    
    return response;
  }

  // Reverse proxy
  async reverse(request) {
    const { method, path, headers } = request;
    
    console.log(`[REVERSE] ${method} ${path}`);
    
    // Select backend (round-robin)
    const backend = this.backends[this.requests.length % this.backends.length];
    const url = `${backend}${path}`;
    
    console.log(`[BACKEND] -> ${url}`);
    
    // Modify headers
    const modifiedHeaders = {
      ...headers,
      'X-Forwarded-For': request.clientIP,
      'X-Forwarded-Proto': 'https'
    };
    
    const response = await this.sendRequest(url, { method, headers: modifiedHeaders });
    
    this.requests.push({
      type: 'reverse',
      method,
      path,
      backend,
      time: Date.now()
    });
    
    return response;
  }

  // Send HTTP request (simulated)
  async sendRequest(url, options) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url, method: options.method })
    };
  }

  // Clear cache
  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[CACHE] Cleared ${size} entries`);
  }

  // Get statistics
  stats() {
    return {
      type: this.type,
      requests: this.requests.length,
      cached: this.cache.size,
      backends: this.backends.length,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  calculateCacheHitRate() {
    const hits = this.requests.filter(r => r.cached).length;
    return this.requests.length > 0 
      ? (hits / this.requests.length * 100).toFixed(1) + '%'
      : '0%';
  }
}

// Demo
if (require.main === module) {
  console.log('=== Proxy Server Demo ===\n');
  
  // Forward proxy
  const forward = new ProxyServer('forward');
  
  (async () => {
    console.log('--- Forward Proxy ---\n');
    await forward.forward({ method: 'GET', url: 'http://example.com/api/users', headers: {} });
    await forward.forward({ method: 'GET', url: 'http://example.com/api/users', headers: {} }); // Cache hit
    
    console.log('\n--- Reverse Proxy ---\n');
    
    // Reverse proxy
    const reverse = new ProxyServer('reverse');
    reverse.addBackend('http://backend1:8080');
    reverse.addBackend('http://backend2:8080');
    
    await reverse.reverse({ method: 'GET', path: '/api/users', headers: {}, clientIP: '192.168.1.10' });
    await reverse.reverse({ method: 'POST', path: '/api/users', headers: {}, clientIP: '192.168.1.11' });
    
    console.log('\nForward Stats:', forward.stats());
    console.log('Reverse Stats:', reverse.stats());
  })();
}

module.exports = ProxyServer;
