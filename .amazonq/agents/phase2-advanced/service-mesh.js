// Minimal Service Mesh - Traffic Management, Service Discovery, Observability
class ServiceMesh {
  constructor() {
    this.services = new Map();
    this.proxies = new Map();
    this.metrics = new Map();
  }

  // Register service
  registerService(name, instances) {
    this.services.set(name, instances);
    this.metrics.set(name, { requests: 0, errors: 0, latencies: [] });
    console.log(`Registered service: ${name} (${instances.length} instances)`);
  }

  // Service discovery
  discover(serviceName) {
    return this.services.get(serviceName) || [];
  }

  // Traffic splitting (canary/blue-green)
  selectInstance(serviceName, weights = null) {
    const instances = this.discover(serviceName);
    if (instances.length === 0) return null;

    if (weights) {
      // Weighted selection
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const [idx, weight] of weights.entries()) {
        cumulative += weight;
        if (rand < cumulative) return instances[idx];
      }
    }

    // Round robin
    return instances[Math.floor(Math.random() * instances.length)];
  }

  // Proxy request with retry and timeout
  async proxyRequest(serviceName, request, options = {}) {
    const { retries = 3, timeout = 5000, weights = null } = options;
    const startTime = Date.now();

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const instance = this.selectInstance(serviceName, weights);
        if (!instance) throw new Error('No instances available');

        console.log(`  → ${serviceName} (${instance.id}) [attempt ${attempt + 1}]`);

        // Simulate request with timeout
        const response = await Promise.race([
          instance.handle(request),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);

        // Record metrics
        const latency = Date.now() - startTime;
        this.recordMetrics(serviceName, latency, false);

        return response;

      } catch (error) {
        console.log(`  ✗ ${error.message}`);
        if (attempt === retries - 1) {
          this.recordMetrics(serviceName, Date.now() - startTime, true);
          throw error;
        }
      }
    }
  }

  // Record metrics
  recordMetrics(serviceName, latency, isError) {
    const metrics = this.metrics.get(serviceName);
    metrics.requests++;
    if (isError) metrics.errors++;
    metrics.latencies.push(latency);
  }

  // Get metrics
  getMetrics(serviceName) {
    const metrics = this.metrics.get(serviceName);
    if (!metrics) return null;

    const avgLatency = metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length;
    const errorRate = (metrics.errors / metrics.requests) * 100;

    return {
      requests: metrics.requests,
      errors: metrics.errors,
      errorRate: errorRate.toFixed(2) + '%',
      avgLatency: avgLatency.toFixed(2) + 'ms'
    };
  }
}

// Mock service instance
class ServiceInstance {
  constructor(id, failRate = 0, latency = 50) {
    this.id = id;
    this.failRate = failRate;
    this.latency = latency;
  }

  async handle(request) {
    await new Promise(resolve => setTimeout(resolve, this.latency));
    
    if (Math.random() < this.failRate) {
      throw new Error('Service error');
    }

    return { instance: this.id, data: `Processed: ${request}` };
  }
}

// Demo
console.log('=== Service Mesh Demo ===\n');

const mesh = new ServiceMesh();

// Register services
mesh.registerService('user-service', [
  new ServiceInstance('user-v1', 0, 50),
  new ServiceInstance('user-v2', 0, 30) // Faster new version
]);

mesh.registerService('order-service', [
  new ServiceInstance('order-1', 0.2, 100), // 20% fail rate
  new ServiceInstance('order-2', 0, 80)
]);

// Test requests
(async () => {
  console.log('\n--- Canary Deployment (90% v1, 10% v2) ---');
  for (let i = 0; i < 5; i++) {
    try {
      await mesh.proxyRequest('user-service', `request-${i}`, { weights: [90, 10] });
    } catch (e) {}
  }

  console.log('\n--- Order Service (with retries) ---');
  for (let i = 0; i < 3; i++) {
    try {
      await mesh.proxyRequest('order-service', `order-${i}`, { retries: 3 });
    } catch (e) {}
  }

  console.log('\n=== Metrics ===');
  console.log('User Service:', mesh.getMetrics('user-service'));
  console.log('Order Service:', mesh.getMetrics('order-service'));
})();

export default ServiceMesh;
