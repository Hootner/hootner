#!/usr/bin/env node
/**
 * Layer 7: HTTP Server - Web server from scratch
 * Dependencies: Layer 5 (TCP, HTTP), Layer 6 (Cache)
 */

class HTTPServer {
  constructor(port = 8080) {
    this.port = port;
    this.routes = new Map();
    this.middleware = [];
    this.requests = [];
  }

  // Register route
  route(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
    console.log(`[ROUTE] ${method} ${path}`);
  }

  // Convenience methods
  get(path, handler) { this.route('GET', path, handler); }
  post(path, handler) { this.route('POST', path, handler); }
  put(path, handler) { this.route('PUT', path, handler); }
  delete(path, handler) { this.route('DELETE', path, handler); }

  // Add middleware
  use(fn) {
    this.middleware.push(fn);
  }

  // Parse HTTP request
  parseRequest(raw) {
    const lines = raw.split('\r\n');
    const [method, path, protocol] = lines[0].split(' ');
    
    const headers = {};
    let i = 1;
    for (; i < lines.length && lines[i]; i++) {
      const [key, ...value] = lines[i].split(': ');
      headers[key.toLowerCase()] = value.join(': ');
    }
    
    const body = lines.slice(i + 1).join('\r\n');
    
    return { method, path, protocol, headers, body };
  }

  // Build HTTP response
  buildResponse(status, headers = {}, body = '') {
    const statusText = {
      200: 'OK', 201: 'Created', 204: 'No Content',
      400: 'Bad Request', 404: 'Not Found', 500: 'Internal Server Error'
    }[status] || 'Unknown';
    
    const lines = [
      `HTTP/1.1 ${status} ${statusText}`,
      `Content-Length: ${body.length}`,
      ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
      '',
      body
    ];
    
    return lines.join('\r\n');
  }

  // Handle request
  async handle(raw) {
    const req = this.parseRequest(raw);
    const res = { status: 200, headers: {}, body: '' };
    
    console.log(`[${req.method}] ${req.path}`);
    
    this.requests.push({ method: req.method, path: req.path, time: Date.now() });
    
    // Run middleware
    for (const mw of this.middleware) {
      await mw(req, res);
    }
    
    // Find route
    const key = `${req.method}:${req.path}`;
    const handler = this.routes.get(key);
    
    if (handler) {
      try {
        await handler(req, res);
      } catch (error) {
        res.status = 500;
        res.body = JSON.stringify({ error: error.message });
      }
    } else {
      res.status = 404;
      res.body = JSON.stringify({ error: 'Not Found' });
    }
    
    return this.buildResponse(res.status, res.headers, res.body);
  }

  // Start server (simulated)
  listen(callback) {
    console.log(`[SERVER] Listening on port ${this.port}`);
    if (callback) callback();
  }

  // Stats
  stats() {
    const byMethod = {};
    for (const req of this.requests) {
      byMethod[req.method] = (byMethod[req.method] || 0) + 1;
    }
    
    return {
      port: this.port,
      routes: this.routes.size,
      middleware: this.middleware.length,
      requests: this.requests.length,
      byMethod
    };
  }
}

// Demo
if (require.main === module) {
  const server = new HTTPServer(3000);
  
  console.log('=== HTTP Server Demo ===\n');
  
  // Middleware
  server.use(async (req, res) => {
    res.headers['X-Powered-By'] = 'CustomServer/1.0';
  });
  
  // Routes
  server.get('/', (req, res) => {
    res.body = JSON.stringify({ message: 'Hello World' });
    res.headers['Content-Type'] = 'application/json';
  });
  
  server.get('/users', (req, res) => {
    res.body = JSON.stringify([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]);
    res.headers['Content-Type'] = 'application/json';
  });
  
  server.post('/users', (req, res) => {
    const user = JSON.parse(req.body);
    res.status = 201;
    res.body = JSON.stringify({ id: 3, ...user });
    res.headers['Content-Type'] = 'application/json';
  });
  
  console.log();
  
  // Handle requests
  (async () => {
    await server.handle('GET / HTTP/1.1\r\nHost: localhost\r\n\r\n');
    console.log();
    
    await server.handle('GET /users HTTP/1.1\r\nHost: localhost\r\n\r\n');
    console.log();
    
    await server.handle('POST /users HTTP/1.1\r\nHost: localhost\r\nContent-Type: application/json\r\n\r\n{"name":"Charlie"}');
    
    console.log('\nStats:', server.stats());
  })();
  
  server.listen();
}

module.exports = HTTPServer;
