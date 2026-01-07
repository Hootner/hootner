#!/usr/bin/env node
/**
 * Layer 7: Web Framework - Express-like web framework
 * Dependencies: Layer 5 (HTTP), Layer 6 (ORM), Layer 7 (HTTP Server)
 */

class WebFramework {
  constructor() {
    this.routes = [];
    this.middleware = [];
    this.errorHandlers = [];
  }

  // Add middleware
  use(path, ...handlers) {
    if (typeof path === 'function') {
      this.middleware.push({ path: '*', handlers: [path, ...handlers] });
    } else {
      this.middleware.push({ path, handlers });
    }
  }

  // Register route
  addRoute(method, path, ...handlers) {
    this.routes.push({ method, path, handlers });
  }

  get(path, ...handlers) { this.addRoute('GET', path, ...handlers); }
  post(path, ...handlers) { this.addRoute('POST', path, ...handlers); }
  put(path, ...handlers) { this.addRoute('PUT', path, ...handlers); }
  delete(path, ...handlers) { this.addRoute('DELETE', path, ...handlers); }

  // Match route
  matchRoute(method, path) {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      
      const params = this.matchPath(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  // Match path with params
  matchPath(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) return null;
    
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    
    return params;
  }

  // Handle request
  async handle(req, res) {
    console.log(`[${req.method}] ${req.path}`);
    
    req.params = {};
    req.query = this.parseQuery(req.path);
    
    try {
      // Run middleware
      for (const mw of this.middleware) {
        if (mw.path === '*' || req.path.startsWith(mw.path)) {
          for (const handler of mw.handlers) {
            await handler(req, res);
            if (res.finished) return;
          }
        }
      }
      
      // Match route
      const match = this.matchRoute(req.method, req.path.split('?')[0]);
      
      if (match) {
        req.params = match.params;
        
        // Run route handlers
        for (const handler of match.route.handlers) {
          await handler(req, res);
          if (res.finished) return;
        }
      } else {
        res.status = 404;
        res.json({ error: 'Not Found' });
      }
    } catch (error) {
      // Error handling
      if (this.errorHandlers.length > 0) {
        for (const handler of this.errorHandlers) {
          await handler(error, req, res);
        }
      } else {
        res.status = 500;
        res.json({ error: error.message });
      }
    }
  }

  // Parse query string
  parseQuery(path) {
    const [, queryString] = path.split('?');
    if (!queryString) return {};
    
    const query = {};
    for (const pair of queryString.split('&')) {
      const [key, value] = pair.split('=');
      query[key] = decodeURIComponent(value || '');
    }
    return query;
  }

  // Response helpers
  enhanceResponse(res) {
    res.json = (data) => {
      res.headers['Content-Type'] = 'application/json';
      res.body = JSON.stringify(data);
      res.finished = true;
    };
    
    res.send = (data) => {
      res.body = String(data);
      res.finished = true;
    };
    
    res.redirect = (url) => {
      res.status = 302;
      res.headers['Location'] = url;
      res.finished = true;
    };
  }

  // Error handler
  onError(handler) {
    this.errorHandlers.push(handler);
  }
}

// Demo
if (require.main === module) {
  const app = new WebFramework();
  
  console.log('=== Web Framework Demo ===\n');
  
  // Middleware
  app.use((req, res) => {
    console.log(`  Middleware: ${req.method} ${req.path}`);
    req.startTime = Date.now();
  });
  
  app.use('/api', (req, res) => {
    console.log('  API middleware');
  });
  
  // Routes
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome' });
  });
  
  app.get('/users/:id', (req, res) => {
    res.json({ id: req.params.id, name: 'User ' + req.params.id });
  });
  
  app.post('/users', (req, res) => {
    const user = JSON.parse(req.body);
    res.status = 201;
    res.json({ id: 1, ...user });
  });
  
  app.get('/search', (req, res) => {
    res.json({ query: req.query.q, results: [] });
  });
  
  // Error handler
  app.onError((error, req, res) => {
    console.log(`  Error: ${error.message}`);
    res.status = 500;
    res.json({ error: 'Internal Server Error' });
  });
  
  console.log();
  
  // Handle requests
  (async () => {
    const req1 = { method: 'GET', path: '/', headers: {}, body: '' };
    const res1 = { status: 200, headers: {}, body: '', finished: false };
    app.enhanceResponse(res1);
    await app.handle(req1, res1);
    console.log('Response:', res1.body, '\n');
    
    const req2 = { method: 'GET', path: '/users/123', headers: {}, body: '' };
    const res2 = { status: 200, headers: {}, body: '', finished: false };
    app.enhanceResponse(res2);
    await app.handle(req2, res2);
    console.log('Response:', res2.body, '\n');
    
    const req3 = { method: 'GET', path: '/search?q=test', headers: {}, body: '' };
    const res3 = { status: 200, headers: {}, body: '', finished: false };
    app.enhanceResponse(res3);
    await app.handle(req3, res3);
    console.log('Response:', res3.body);
  })();
}

module.exports = WebFramework;
