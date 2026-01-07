#!/usr/bin/env node
/**
 * Layer 7: Middleware System - Common web middleware
 * Dependencies: Layer 6 (Cache), Layer 7 (Web Framework)
 */

class MiddlewareSystem {
  constructor() {
    this.middleware = [];
  }

  // Logger middleware
  static logger() {
    return async (req, res) => {
      const start = Date.now();
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      
      // Store for later
      req._startTime = start;
    };
  }

  // CORS middleware
  static cors(options = {}) {
    const origin = options.origin || '*';
    const methods = options.methods || 'GET,POST,PUT,DELETE';
    const headers = options.headers || 'Content-Type,Authorization';
    
    return async (req, res) => {
      res.headers['Access-Control-Allow-Origin'] = origin;
      res.headers['Access-Control-Allow-Methods'] = methods;
      res.headers['Access-Control-Allow-Headers'] = headers;
      
      if (req.method === 'OPTIONS') {
        res.status = 204;
        res.finished = true;
      }
    };
  }

  // Rate limiter middleware
  static rateLimit(options = {}) {
    const limit = options.limit || 100;
    const window = options.window || 60000; // 1 minute
    const requests = new Map();
    
    return async (req, res) => {
      const key = req.headers['x-forwarded-for'] || req.ip || 'unknown';
      const now = Date.now();
      
      if (!requests.has(key)) {
        requests.set(key, []);
      }
      
      const userRequests = requests.get(key);
      const recent = userRequests.filter(time => now - time < window);
      
      if (recent.length >= limit) {
        console.log(`[RATE LIMIT] ${key} exceeded ${limit} req/min`);
        res.status = 429;
        res.headers['Retry-After'] = Math.ceil(window / 1000);
        res.json({ error: 'Too Many Requests' });
        res.finished = true;
        return;
      }
      
      recent.push(now);
      requests.set(key, recent);
    };
  }

  // Body parser middleware
  static bodyParser() {
    return async (req, res) => {
      const contentType = req.headers['content-type'];
      
      if (contentType === 'application/json' && req.body) {
        try {
          req.body = JSON.parse(req.body);
        } catch (error) {
          res.status = 400;
          res.json({ error: 'Invalid JSON' });
          res.finished = true;
        }
      }
    };
  }

  // Compression middleware (simplified)
  static compress() {
    return async (req, res) => {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('gzip')) {
        res.headers['Content-Encoding'] = 'gzip';
        console.log('[COMPRESS] Using gzip');
      }
    };
  }

  // Security headers middleware
  static security() {
    return async (req, res) => {
      res.headers['X-Content-Type-Options'] = 'nosniff';
      res.headers['X-Frame-Options'] = 'DENY';
      res.headers['X-XSS-Protection'] = '1; mode=block';
      res.headers['Strict-Transport-Security'] = 'max-age=31536000';
    };
  }

  // Static file middleware
  static static(root) {
    return async (req, res) => {
      if (req.method !== 'GET') return;
      
      const filePath = root + req.path;
      console.log(`[STATIC] Serving ${filePath}`);
      
      // In production, would read from filesystem
      res.headers['Content-Type'] = 'text/html';
      res.body = `<html><body>Static file: ${filePath}</body></html>`;
    };
  }

  // Error handler middleware
  static errorHandler() {
    return async (error, req, res) => {
      console.error(`[ERROR] ${error.message}`);
      
      res.status = res.status || 500;
      res.json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal Server Error' 
          : error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    };
  }

  // Request ID middleware
  static requestId() {
    return async (req, res) => {
      const id = Math.random().toString(36).substring(2);
      req.id = id;
      res.headers['X-Request-ID'] = id;
    };
  }

  // Timing middleware
  static timing() {
    return async (req, res) => {
      const start = Date.now();
      
      // Hook into response finish
      const originalFinish = res.finished;
      Object.defineProperty(res, 'finished', {
        get: () => originalFinish,
        set: (value) => {
          if (value) {
            const duration = Date.now() - start;
            res.headers['X-Response-Time'] = `${duration}ms`;
            console.log(`[TIMING] ${req.method} ${req.path} - ${duration}ms`);
          }
          originalFinish = value;
        }
      });
    };
  }

  // Cache middleware
  static cache(ttl = 60) {
    const cache = new Map();
    
    return async (req, res) => {
      if (req.method !== 'GET') return;
      
      const key = req.path;
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.time < ttl * 1000) {
        console.log(`[CACHE HIT] ${key}`);
        res.status = cached.status;
        res.headers = { ...res.headers, ...cached.headers };
        res.body = cached.body;
        res.finished = true;
        return;
      }
      
      // Store response in cache
      const originalFinish = res.finished;
      Object.defineProperty(res, 'finished', {
        get: () => originalFinish,
        set: (value) => {
          if (value && req.method === 'GET') {
            cache.set(key, {
              status: res.status,
              headers: res.headers,
              body: res.body,
              time: Date.now()
            });
          }
          originalFinish = value;
        }
      });
    };
  }
}

// Demo
if (require.main === module) {
  console.log('=== Middleware System Demo ===\n');
  
  const req = {
    method: 'GET',
    path: '/api/users',
    headers: {
      'content-type': 'application/json',
      'accept-encoding': 'gzip'
    },
    body: ''
  };
  
  const res = {
    status: 200,
    headers: {},
    body: '',
    finished: false,
    json: function(data) {
      this.body = JSON.stringify(data);
      this.headers['Content-Type'] = 'application/json';
    }
  };
  
  (async () => {
    // Apply middleware
    await MiddlewareSystem.logger()(req, res);
    await MiddlewareSystem.requestId()(req, res);
    await MiddlewareSystem.cors()(req, res);
    await MiddlewareSystem.security()(req, res);
    await MiddlewareSystem.compress()(req, res);
    
    console.log('\nResponse headers:', res.headers);
  })();
}

module.exports = MiddlewareSystem;
