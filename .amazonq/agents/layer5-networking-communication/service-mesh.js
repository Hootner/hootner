#!/usr/bin/env node
/**
 * Layer 5: Service Mesh - Microservices communication infrastructure
 * Dependencies: Layer 4 (Process), Layer 5 (Proxy, Load Balancer, RPC)
 */

class ServiceMesh {
  constructor() {
    this.services = new Map();
    this.sidecars = new Map();
    this.policies = [];
    this.metrics = [];
  }

  // Register service
  registerService(name, instances) {
    this.services.set(name, {
      name,
      instances: instances.map(i => ({
        id: i.id,
        host: i.host,
        port: i.port,
        healthy: true,
        version: i.version || 'v1'
      }))
    });
    
    // Create sidecar for each instance
    for (const instance of instances) {
      this.sidecars.set(instance.id, {
        serviceId: instance.id,
        serviceName: name,
        intercepted: 0,
        forwarded: 0
      });
    }
    
    console.log(`[SERVICE] Registered ${name} with ${instances.length} instances`);
  }

  // Add traffic policy
  addPolicy(policy) {
    this.policies.push({
      service: policy.service,
      type: policy.type, // 'retry', 'timeout', 'circuit-breaker', 'rate-limit'
      config: policy.config
    });
    console.log(`[POLICY] Added ${policy.type} for ${policy.service}`);
  }

  // Route request through mesh
  async route(from, to, request) {
    const fromSidecar = this.sidecars.get(from);
    const toService = this.services.get(to);
    
    if (!toService) throw new Error(`Service ${to} not found`);
    
    console.log(`[MESH] ${from} -> ${to}: ${request.path}`);
    
    // Intercept at source sidecar
    fromSidecar.intercepted++;
    
    // Apply policies
    const policies = this.policies.filter(p => p.service === to);
    for (const policy of policies) {
      await this.applyPolicy(policy, request);
    }
    
    // Select instance (load balancing)
    const instance = this.selectInstance(toService);
    
    // Forward through destination sidecar
    const toSidecar = this.sidecars.get(instance.id);
    toSidecar.forwarded++;
    
    // Record metrics
    this.metrics.push({
      from,
      to: instance.id,
      path: request.path,
      latency: Math.random() * 100,
      status: 200,
      time: Date.now()
    });
    
    console.log(`[FORWARD] -> ${instance.id} (${instance.host}:${instance.port})`);
    
    return { status: 200, body: 'Response' };
  }

  // Apply traffic policy
  async applyPolicy(policy, request) {
    switch (policy.type) {
      case 'retry':
        console.log(`[POLICY] Retry: max ${policy.config.attempts} attempts`);
        break;
      case 'timeout':
        console.log(`[POLICY] Timeout: ${policy.config.duration}ms`);
        break;
      case 'circuit-breaker':
        console.log(`[POLICY] Circuit breaker: threshold ${policy.config.threshold}`);
        break;
      case 'rate-limit':
        console.log(`[POLICY] Rate limit: ${policy.config.rps} req/s`);
        break;
    }
  }

  // Select service instance
  selectInstance(service) {
    const healthy = service.instances.filter(i => i.healthy);
    return healthy[Math.floor(Math.random() * healthy.length)];
  }

  // Traffic splitting (canary/blue-green)
  splitTraffic(service, weights) {
    const svc = this.services.get(service);
    console.log(`[SPLIT] ${service}:`, weights);
    
    // Assign weights to versions
    for (const instance of svc.instances) {
      instance.weight = weights[instance.version] || 0;
    }
  }

  // Get observability metrics
  observability() {
    const byService = {};
    for (const metric of this.metrics) {
      const key = `${metric.from}->${metric.to}`;
      if (!byService[key]) {
        byService[key] = { count: 0, avgLatency: 0, errors: 0 };
      }
      byService[key].count++;
      byService[key].avgLatency += metric.latency;
    }
    
    for (const key in byService) {
      byService[key].avgLatency = (byService[key].avgLatency / byService[key].count).toFixed(2);
    }
    
    return {
      services: this.services.size,
      sidecars: this.sidecars.size,
      policies: this.policies.length,
      requests: this.metrics.length,
      byService
    };
  }
}

// Demo
if (require.main === module) {
  const mesh = new ServiceMesh();
  
  console.log('=== Service Mesh Demo ===\n');
  
  // Register services
  mesh.registerService('frontend', [
    { id: 'frontend-1', host: '10.0.1.10', port: 8080, version: 'v1' }
  ]);
  
  mesh.registerService('backend', [
    { id: 'backend-1', host: '10.0.2.10', port: 8080, version: 'v1' },
    { id: 'backend-2', host: '10.0.2.11', port: 8080, version: 'v2' }
  ]);
  
  // Add policies
  mesh.addPolicy({
    service: 'backend',
    type: 'retry',
    config: { attempts: 3, backoff: 'exponential' }
  });
  
  mesh.addPolicy({
    service: 'backend',
    type: 'timeout',
    config: { duration: 5000 }
  });
  
  console.log();
  
  (async () => {
    // Route requests
    await mesh.route('frontend-1', 'backend', { path: '/api/users' });
    await mesh.route('frontend-1', 'backend', { path: '/api/posts' });
    
    // Traffic splitting
    console.log();
    mesh.splitTraffic('backend', { v1: 90, v2: 10 });
    
    console.log('\nObservability:', mesh.observability());
  })();
}

module.exports = ServiceMesh;
