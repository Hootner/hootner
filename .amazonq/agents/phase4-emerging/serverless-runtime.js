// Minimal Serverless Runtime - Functions, Cold Start, Warm Pool
class ServerlessFunction {
  constructor(id, handler, config = {}) {
    this.id = id;
    this.handler = handler;
    this.memory = config.memory || 128;
    this.timeout = config.timeout || 3000;
    this.state = 'cold';
    this.lastInvoke = 0;
    this.invocations = 0;
  }

  async invoke(event) {
    const startTime = Date.now();
    
    if (this.state === 'cold') {
      await this.coldStart();
    }

    this.state = 'running';
    this.invocations++;
    this.lastInvoke = Date.now();

    try {
      const result = await this.handler(event);
      const duration = Date.now() - startTime;
      
      this.state = 'warm';
      return { success: true, result, duration, coldStart: duration > 100 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async coldStart() {
    console.log(`  Cold start: ${this.id}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate init
  }

  shouldRecycle(now) {
    return now - this.lastInvoke > 60000; // 1 minute idle
  }
}

class ServerlessRuntime {
  constructor() {
    this.functions = new Map();
    this.warmPool = new Map();
    this.stats = { invocations: 0, coldStarts: 0 };
  }

  register(id, handler, config) {
    this.functions.set(id, { handler, config });
  }

  async invoke(functionId, event) {
    const fnDef = this.functions.get(functionId);
    if (!fnDef) throw new Error(`Function ${functionId} not found`);

    this.stats.invocations++;

    // Check warm pool
    let fn = this.warmPool.get(functionId);
    
    if (!fn || fn.state === 'cold') {
      fn = new ServerlessFunction(functionId, fnDef.handler, fnDef.config);
      this.warmPool.set(functionId, fn);
      this.stats.coldStarts++;
    }

    const result = await fn.invoke(event);
    
    // Recycle old instances
    this.recycleInstances();
    
    return result;
  }

  recycleInstances() {
    const now = Date.now();
    for (const [id, fn] of this.warmPool) {
      if (fn.shouldRecycle(now)) {
        fn.state = 'cold';
        console.log(`  Recycled: ${id}`);
      }
    }
  }

  getStats() {
    return {
      ...this.stats,
      coldStartRate: (this.stats.coldStarts / this.stats.invocations * 100).toFixed(1) + '%'
    };
  }
}

// Demo
console.log('=== Serverless Runtime Demo ===\n');

const runtime = new ServerlessRuntime();

// Register functions
runtime.register('hello', async (event) => {
  return `Hello, ${event.name}!`;
}, { memory: 128, timeout: 3000 });

runtime.register('process', async (event) => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return { processed: event.data, timestamp: Date.now() };
}, { memory: 256, timeout: 5000 });

// Invoke functions
(async () => {
  console.log('--- First invocation (cold start) ---');
  const r1 = await runtime.invoke('hello', { name: 'Alice' });
  console.log('Result:', r1.result);
  console.log('Duration:', r1.duration + 'ms');
  console.log('Cold start:', r1.coldStart);

  console.log('\n--- Second invocation (warm) ---');
  const r2 = await runtime.invoke('hello', { name: 'Bob' });
  console.log('Result:', r2.result);
  console.log('Duration:', r2.duration + 'ms');
  console.log('Cold start:', r2.coldStart);

  console.log('\n--- Different function ---');
  const r3 = await runtime.invoke('process', { data: [1, 2, 3] });
  console.log('Result:', r3.result);

  console.log('\n--- Stats ---');
  console.log(runtime.getStats());
})();

export default ServerlessRuntime;
