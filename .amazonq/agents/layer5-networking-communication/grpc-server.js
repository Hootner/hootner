#!/usr/bin/env node
/**
 * Layer 5: gRPC Server - High-performance RPC framework
 * Dependencies: Layer 0 (Binary), Layer 2 (Parser), Layer 5 (HTTP/2, RPC)
 */

class GRPCServer {
  constructor() {
    this.services = new Map();
    this.calls = [];
  }

  // Register service
  registerService(name, definition, implementation) {
    this.services.set(name, {
      definition,
      implementation
    });
    console.log(`[SERVICE] Registered ${name}`);
  }

  // Serialize protobuf (simplified)
  serialize(data) {
    return Buffer.from(JSON.stringify(data));
  }

  // Deserialize protobuf (simplified)
  deserialize(buffer) {
    return JSON.parse(buffer.toString());
  }

  // Unary call (single request, single response)
  async unaryCall(service, method, request) {
    const svc = this.services.get(service);
    if (!svc) throw new Error(`Service ${service} not found`);
    
    console.log(`[UNARY] ${service}.${method}`);
    console.log('Request:', request);
    
    const response = await svc.implementation[method](request);
    
    this.calls.push({
      service,
      method,
      type: 'unary',
      time: Date.now()
    });
    
    console.log('Response:', response);
    return response;
  }

  // Server streaming (single request, stream of responses)
  async *serverStream(service, method, request) {
    const svc = this.services.get(service);
    console.log(`[SERVER_STREAM] ${service}.${method}`);
    
    const stream = svc.implementation[method](request);
    for await (const item of stream) {
      yield item;
    }
    
    this.calls.push({
      service,
      method,
      type: 'server_stream',
      time: Date.now()
    });
  }

  // Client streaming (stream of requests, single response)
  async clientStream(service, method, requestStream) {
    const svc = this.services.get(service);
    console.log(`[CLIENT_STREAM] ${service}.${method}`);
    
    const response = await svc.implementation[method](requestStream);
    
    this.calls.push({
      service,
      method,
      type: 'client_stream',
      time: Date.now()
    });
    
    return response;
  }

  // Bidirectional streaming
  async *bidirectionalStream(service, method, requestStream) {
    const svc = this.services.get(service);
    console.log(`[BIDI_STREAM] ${service}.${method}`);
    
    const stream = svc.implementation[method](requestStream);
    for await (const item of stream) {
      yield item;
    }
    
    this.calls.push({
      service,
      method,
      type: 'bidi_stream',
      time: Date.now()
    });
  }

  // Get statistics
  stats() {
    const byType = {};
    for (const call of this.calls) {
      byType[call.type] = (byType[call.type] || 0) + 1;
    }
    
    return {
      services: this.services.size,
      calls: this.calls.length,
      byType
    };
  }
}

// Demo
if (require.main === module) {
  const server = new GRPCServer();
  
  console.log('=== gRPC Server Demo ===\n');
  
  // Register service
  server.registerService('UserService', {
    GetUser: { request: 'UserId', response: 'User' },
    ListUsers: { request: 'Empty', response: 'stream User' },
    CreateUsers: { request: 'stream User', response: 'Summary' }
  }, {
    GetUser: async (req) => ({
      id: req.id,
      name: 'Alice',
      email: 'alice@example.com'
    }),
    
    ListUsers: async function* (req) {
      yield { id: 1, name: 'Alice' };
      yield { id: 2, name: 'Bob' };
      yield { id: 3, name: 'Charlie' };
    },
    
    CreateUsers: async (stream) => {
      let count = 0;
      for await (const user of stream) {
        count++;
      }
      return { created: count };
    }
  });
  
  console.log();
  
  (async () => {
    // Unary call
    await server.unaryCall('UserService', 'GetUser', { id: 1 });
    
    console.log();
    
    // Server streaming
    console.log('[SERVER_STREAM] UserService.ListUsers');
    for await (const user of server.serverStream('UserService', 'ListUsers', {})) {
      console.log('Received:', user);
    }
    
    console.log('\nStats:', server.stats());
  })();
}

module.exports = GRPCServer;
