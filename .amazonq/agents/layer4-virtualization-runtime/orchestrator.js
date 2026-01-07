// Container Orchestrator - Layer 4.4
// Kubernetes-like orchestration

import Container from './container.js';

class Orchestrator {
  constructor() {
    this.containers = new Map();
    this.services = new Map();
    this.nodes = new Map();
    this.deployments = new Map();
  }

  // Deploy application
  deploy(name, spec) {
    console.log(`[ORCH] Deploying ${name}...`);
    
    const deployment = {
      name,
      replicas: spec.replicas || 1,
      image: spec.image,
      containers: [],
      strategy: spec.strategy || 'rolling'
    };

    // Create replicas
    for (let i = 0; i < deployment.replicas; i++) {
      const id = `${name}-${i}`;
      const container = new Container(id, spec.image);
      
      // Apply spec
      if (spec.resources) {
        container.setLimits(
          spec.resources.cpu || 100,
          spec.resources.memory || 512 * 1024 * 1024
        );
      }
      
      if (spec.env) {
        Object.entries(spec.env).forEach(([k, v]) => container.setEnv(k, v));
      }
      
      if (spec.volumes) {
        spec.volumes.forEach(vol => container.addVolume(vol.host, vol.container));
      }
      
      container.start();
      this.containers.set(id, container);
      deployment.containers.push(id);
    }

    this.deployments.set(name, deployment);
    console.log(`[ORCH] Deployed ${name} with ${deployment.replicas} replicas`);
    return deployment;
  }

  // Scale deployment
  scale(name, replicas) {
    const deployment = this.deployments.get(name);
    if (!deployment) return false;

    const current = deployment.replicas;
    const diff = replicas - current;

    console.log(`[ORCH] Scaling ${name}: ${current} -> ${replicas}`);

    if (diff > 0) {
      // Scale up
      for (let i = 0; i < diff; i++) {
        const id = `${name}-${current + i}`;
        const container = new Container(id, deployment.image);
        container.start();
        this.containers.set(id, container);
        deployment.containers.push(id);
      }
    } else if (diff < 0) {
      // Scale down
      for (let i = 0; i < Math.abs(diff); i++) {
        const id = deployment.containers.pop();
        const container = this.containers.get(id);
        if (container) {
          container.stop();
          this.containers.delete(id);
        }
      }
    }

    deployment.replicas = replicas;
    return true;
  }

  // Rolling update
  update(name, newImage) {
    const deployment = this.deployments.get(name);
    if (!deployment) return false;

    console.log(`[ORCH] Rolling update ${name}: ${deployment.image} -> ${newImage}`);

    // Update one at a time
    deployment.containers.forEach((id, i) => {
      console.log(`[ORCH] Updating replica ${i + 1}/${deployment.replicas}`);
      
      const old = this.containers.get(id);
      old.stop();
      
      const newContainer = new Container(id, newImage);
      newContainer.start();
      this.containers.set(id, newContainer);
    });

    deployment.image = newImage;
    console.log(`[ORCH] Update complete`);
    return true;
  }

  // Create service (load balancer)
  createService(name, selector, port) {
    const service = {
      name,
      selector,
      port,
      endpoints: []
    };

    // Find matching containers
    this.containers.forEach((container, id) => {
      if (id.startsWith(selector)) {
        service.endpoints.push(id);
      }
    });

    this.services.set(name, service);
    console.log(`[ORCH] Service ${name} created with ${service.endpoints.length} endpoints`);
    return service;
  }

  // Health check
  healthCheck() {
    console.log('[ORCH] Running health checks...');
    
    this.containers.forEach((container, id) => {
      if (container.state !== 'running') {
        console.log(`[ORCH] Unhealthy: ${id} (${container.state})`);
        // Restart
        container.stop();
        container.start();
      }
    });
  }

  // Get cluster status
  status() {
    return {
      deployments: this.deployments.size,
      containers: this.containers.size,
      services: this.services.size,
      running: Array.from(this.containers.values()).filter(c => c.state === 'running').length
    };
  }

  // List all resources
  list() {
    console.log('\n=== Cluster Status ===');
    console.log('Deployments:');
    this.deployments.forEach((dep, name) => {
      console.log(`  ${name}: ${dep.replicas} replicas (${dep.image})`);
    });
    
    console.log('\nServices:');
    this.services.forEach((svc, name) => {
      console.log(`  ${name}: ${svc.endpoints.length} endpoints on port ${svc.port}`);
    });
    
    console.log('\nContainers:');
    this.containers.forEach((container, id) => {
      console.log(`  ${id}: ${container.state}`);
    });
  }
}

// Demo
const orch = new Orchestrator();

// Deploy application
orch.deploy('web-app', {
  image: 'nginx:1.21',
  replicas: 3,
  resources: { cpu: 50, memory: 256 * 1024 * 1024 },
  env: { PORT: '80' }
});

// Create service
orch.createService('web-svc', 'web-app', 80);

// Scale
orch.scale('web-app', 5);

// Update
orch.update('web-app', 'nginx:1.22');

// Health check
orch.healthCheck();

// Status
console.log('\nCluster:', orch.status());
orch.list();

export default Orchestrator;
