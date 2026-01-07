// Minimal Load Testing - Concurrent Users, Metrics, Ramp-up
class LoadTester {
  constructor(config = {}) {
    this.concurrency = config.concurrency || 10;
    this.duration = config.duration || 5000;
    this.rampUp = config.rampUp || 1000;
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      latencies: [],
      errors: []
    };
  }

  async executeRequest(fn) {
    const start = Date.now();
    
    try {
      await fn();
      const latency = Date.now() - start;
      this.metrics.latencies.push(latency);
      this.metrics.successes++;
    } catch (error) {
      this.metrics.failures++;
      this.metrics.errors.push(error.message);
    }
    
    this.metrics.requests++;
  }

  async runUser(fn, userId) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.duration) {
      await this.executeRequest(fn);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async run(fn) {
    console.log(`Starting load test: ${this.concurrency} users, ${this.duration}ms\n`);
    
    const users = [];
    const userDelay = this.rampUp / this.concurrency;

    // Ramp up users
    for (let i = 0; i < this.concurrency; i++) {
      await new Promise(resolve => setTimeout(resolve, userDelay));
      users.push(this.runUser(fn, i));
      console.log(`User ${i + 1} started`);
    }

    // Wait for all users
    await Promise.all(users);
    
    return this.getReport();
  }

  getReport() {
    const latencies = this.metrics.latencies.sort((a, b) => a - b);
    const total = this.metrics.requests;
    
    return {
      requests: total,
      successes: this.metrics.successes,
      failures: this.metrics.failures,
      successRate: (this.metrics.successes / total * 100).toFixed(1) + '%',
      avgLatency: (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) + 'ms',
      minLatency: latencies[0] + 'ms',
      maxLatency: latencies[latencies.length - 1] + 'ms',
      p50: latencies[Math.floor(latencies.length * 0.5)] + 'ms',
      p95: latencies[Math.floor(latencies.length * 0.95)] + 'ms',
      p99: latencies[Math.floor(latencies.length * 0.99)] + 'ms',
      throughput: (total / (this.duration / 1000)).toFixed(2) + ' req/s',
      errors: [...new Set(this.metrics.errors)]
    };
  }
}

// Demo: Load test API
console.log('=== Load Testing Demo ===\n');

// Mock API
class API {
  constructor() {
    this.load = 0;
    this.maxLoad = 50;
  }

  async request() {
    this.load++;
    
    // Simulate processing time
    const baseLatency = 50;
    const loadLatency = this.load * 2;
    await new Promise(resolve => setTimeout(resolve, baseLatency + loadLatency));
    
    // Fail if overloaded
    if (this.load > this.maxLoad) {
      this.load--;
      throw new Error('Service overloaded');
    }
    
    this.load--;
    return { status: 200, data: 'OK' };
  }
}

const api = new API();

// Test 1: Low load
console.log('--- Test 1: Low Load (5 users) ---');
const test1 = new LoadTester({ concurrency: 5, duration: 3000, rampUp: 500 });

(async () => {
  const report1 = await test1.run(() => api.request());
  
  console.log('\n=== Load Test Report ===');
  console.log(`Requests: ${report1.requests}`);
  console.log(`Success rate: ${report1.successRate}`);
  console.log(`Avg latency: ${report1.avgLatency}`);
  console.log(`P95 latency: ${report1.p95}`);
  console.log(`Throughput: ${report1.throughput}`);
  
  if (report1.errors.length > 0) {
    console.log(`Errors: ${report1.errors.join(', ')}`);
  }

  // Test 2: High load
  console.log('\n--- Test 2: High Load (20 users) ---');
  const test2 = new LoadTester({ concurrency: 20, duration: 3000, rampUp: 1000 });
  const report2 = await test2.run(() => api.request());
  
  console.log('\n=== Load Test Report ===');
  console.log(`Requests: ${report2.requests}`);
  console.log(`Success rate: ${report2.successRate}`);
  console.log(`Failures: ${report2.failures}`);
  console.log(`Avg latency: ${report2.avgLatency}`);
  console.log(`P99 latency: ${report2.p99}`);
  console.log(`Throughput: ${report2.throughput}`);
})();

export default LoadTester;
