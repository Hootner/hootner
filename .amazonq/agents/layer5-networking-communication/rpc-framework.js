#!/usr/bin/env node
/**
 * Layer 5: RPC Framework - Remote Procedure Call system
 * Dependencies: Layer 2 (Parser), Layer 4 (Runtime), Layer 5 (TCP)
 */

class RPCFramework {
  constructor() {
    this.services = new Map();
    this.calls = [];
    this.nextId = 1;
  }

  // Register service
  registerService(name, methods) {
    this.services.set(name, methods);
    console.log(`[REGISTER] Service ${name} with ${Object.keys(methods).length} methods`);
  }

  // Serialize request
  serialize(method, params) {
    return JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: this.nextId++
    });
  }

  // Deserialize response
  deserialize(data) {
    return JSON.parse(data);
  }

  // Call remote method
  async call(service, method, params = []) {
    const svc = this.services.get(service);
    if (!svc) throw new Error(`Service ${service} not found`);
    if (!svc[method]) throw new Error(`Method ${method} not found`);
    
    const request = this.serialize(`${service}.${method}`, params);
    console.log(`[CALL] ${service}.${method}(${params.join(', ')})`);
    
    try {
      const result = await svc[method](...params);
      const response = {
        jsonrpc: '2.0',
        result,
        id: this.nextId - 1
      };
      
      this.calls.push({
        service,
        method,
        params,
        result,
        success: true,
        time: Date.now()
      });
      
      console.log(`[RESULT] ${JSON.stringify(result)}`);
      return response;
    } catch (error) {
      const response = {
        jsonrpc: '2.0',
        error: { code: -32603, message: error.message },
        id: this.nextId - 1
      };
      
      this.calls.push({
        service,
        method,
        params,
        error: error.message,
        success: false,
        time: Date.now()
      });
      
      console.log(`[ERROR] ${error.message}`);
      return response;
    }
  }

  // Batch call
  async batchCall(calls) {
    const results = [];
    for (const { service, method, params } of calls) {
      const result = await this.call(service, method, params);
      results.push(result);
    }
    return results;
  }

  // Get statistics
  stats() {
    const successful = this.calls.filter(c => c.success).length;
    return {
      services: this.services.size,
      calls: this.calls.length,
      successful,
      failed: this.calls.length - successful,
      successRate: (successful / this.calls.length * 100).toFixed(1) + '%'
    };
  }
}

// Demo
if (require.main === module) {
  const rpc = new RPCFramework();
  
  console.log('=== RPC Framework Demo ===\n');
  
  // Register services
  rpc.registerService('math', {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
    divide: (a, b) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    }
  });
  
  rpc.registerService('string', {
    concat: (a, b) => a + b,
    uppercase: (s) => s.toUpperCase(),
    length: (s) => s.length
  });
  
  console.log();
  
  // Make RPC calls
  (async () => {
    await rpc.call('math', 'add', [5, 3]);
    await rpc.call('math', 'multiply', [4, 7]);
    await rpc.call('string', 'uppercase', ['hello']);
    await rpc.call('math', 'divide', [10, 0]); // Error
    
    console.log();
    
    // Batch call
    const batch = await rpc.batchCall([
      { service: 'math', method: 'add', params: [1, 2] },
      { service: 'string', method: 'concat', params: ['foo', 'bar'] }
    ]);
    
    console.log('\nStats:', rpc.stats());
  })();
}

module.exports = RPCFramework;
