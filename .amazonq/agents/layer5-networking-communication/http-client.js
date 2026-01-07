#!/usr/bin/env node
/**
 * Layer 5: HTTP Client - HTTP/1.1 client implementation
 * Dependencies: Layer 2 (Parser), Layer 4 (Runtime), Layer 5 (TCP)
 */

class HTTPClient {
  constructor() {
    this.requests = [];
    this.responses = [];
  }

  // Build HTTP request
  buildRequest(method, url, headers = {}, body = '') {
    const urlObj = this.parseURL(url);
    const lines = [
      `${method} ${urlObj.path} HTTP/1.1`,
      `Host: ${urlObj.host}`,
      ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`)
    ];
    if (body) {
      lines.push(`Content-Length: ${body.length}`);
      lines.push('');
      lines.push(body);
    }
    return lines.join('\r\n') + '\r\n\r\n';
  }

  // Parse URL
  parseURL(url) {
    const match = url.match(/^(https?):\/\/([^\/]+)(\/.*)?$/);
    return {
      protocol: match[1],
      host: match[2],
      path: match[3] || '/',
      port: match[1] === 'https' ? 443 : 80
    };
  }

  // Parse HTTP response
  parseResponse(raw) {
    const [head, ...bodyParts] = raw.split('\r\n\r\n');
    const lines = head.split('\r\n');
    const [protocol, status, ...reasonParts] = lines[0].split(' ');
    
    const headers = {};
    for (let i = 1; i < lines.length; i++) {
      const [key, ...valueParts] = lines[i].split(': ');
      headers[key.toLowerCase()] = valueParts.join(': ');
    }
    
    return {
      protocol,
      status: parseInt(status),
      reason: reasonParts.join(' '),
      headers,
      body: bodyParts.join('\r\n\r\n')
    };
  }

  // Send request (simulated)
  async request(method, url, options = {}) {
    const req = this.buildRequest(method, url, options.headers, options.body);
    this.requests.push({ method, url, time: Date.now() });
    
    console.log(`[REQUEST] ${method} ${url}`);
    console.log(req.split('\r\n').slice(0, 5).join('\n'));
    
    // Simulate response
    const mockResponse = 
      'HTTP/1.1 200 OK\r\n' +
      'Content-Type: application/json\r\n' +
      'Content-Length: 27\r\n' +
      '\r\n' +
      '{"message":"Hello World"}';
    
    const res = this.parseResponse(mockResponse);
    this.responses.push(res);
    return res;
  }

  // Convenience methods
  get(url, options) { return this.request('GET', url, options); }
  post(url, body, options = {}) { 
    return this.request('POST', url, { ...options, body }); 
  }
  put(url, body, options = {}) { 
    return this.request('PUT', url, { ...options, body }); 
  }
  delete(url, options) { return this.request('DELETE', url, options); }
}

// Demo
if (require.main === module) {
  const client = new HTTPClient();
  
  console.log('=== HTTP Client Demo ===\n');
  
  (async () => {
    // GET request
    const res1 = await client.get('http://api.example.com/users');
    console.log('\n[RESPONSE]', res1.status, res1.reason);
    console.log('Body:', res1.body);
    
    // POST request
    const res2 = await client.post(
      'http://api.example.com/users',
      JSON.stringify({ name: 'Alice' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('\n[RESPONSE]', res2.status);
  })();
}

module.exports = HTTPClient;
