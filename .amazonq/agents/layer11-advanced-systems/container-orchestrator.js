#!/usr/bin/env node
/**
 * Layer 11: Container Orchestrator - Kubernetes-like orchestration
 * Dependencies: Layer 4 (Container), Layer 5 (Load Balancer), Layer 10 (Monitoring)
 */

class ContainerOrchestrator {
  constructor() {
    this.nodes = new Map();
    this.pods = new Map();
    this.services = new Map();
    this.deployments = new Map();
  }

  // Add node
  addNode(nodeId, capacity) {
    this.nodes.set(nodeId, {
      id: nodeId,
      capacity,
      used: 0,
      pods: [],
      healthy: true
    });
    console.log(`[NODE] Added ${nodeId} (capacity: ${capacity})`);
  }

  // Create deployment
  createDeployment(name, spec) {
    const deployment = {
      name,
      replicas: spec.replicas || 1,
      image: spec.image,
      resources: spec.resources || { cpu: 1, memory: 512 },
      pods: [],
      created: Date.now()
    };
    
    this.deployments.set(name, deployment);
    console.log(`[DEPLOYMENT] Created ${name} (${deployment.replicas} replicas)`);
    
    // Schedule pods
    this.schedulePods(deployment);
  }

  // Schedule pods
  schedulePods(deployment) {
    for (let i = 0; i < deployment.replicas; i++) {
      const podId = `${deployment.name}-${i}`;
      const node = this.selectNode(deployment.resources);
      
      if (node) {
        this.createPod(podId, deployment, node.id);
      } else {
        console.log(`[ERROR] No node available for pod ${podId}`);
      }
    }
  }

  // Select node (bin packing)
  selectNode(resources) {
    const available = Array.from(this.nodes.values())
      .filter(n => n.healthy && n.used + resources.cpu <= n.capacity)
      .sort((a, b) => b.used - a.used); // Best fit
    
    return available[0];
  }

  // Create pod
  createPod(podId, deployment, nodeId) {
    const pod = {
      id: podId,
      deployment: deployment.name,
      image: deployment.image,
      resources: deployment.resources,
      node: nodeId,
      status: 'running',
      created: Date.now()
    };
    
    this.pods.set(podId, pod);
    deployment.pods.push(podId);
    
    const node = this.nodes.get(nodeId);
    node.pods.push(podId);
    node.used += deployment.resources.cpu;
    
    console.log(`  [POD] Created ${podId} on ${nodeId}`);
  }

  // Scale deployment
  scale(deploymentName, replicas) {
    const deployment = this.deployments.get(deploymentName);
    if (!deployment) return;
    
    console.log(`[SCALE] ${deploymentName}: ${deployment.replicas} -> ${replicas}`);
    
    const diff = replicas - deployment.replicas;
    
    if (diff > 0) {
      // Scale up
      deployment.replicas = replicas;
      for (let i = 0; i < diff; i++) {
        const podId = `${deploymentName}-${deployment.pods.length}`;
        const node = this.selectNode(deployment.resources);
        if (node) this.createPod(podId, deployment, node.id);
      }
    } else if (diff < 0) {
      // Scale down
      for (let i = 0; i < Math.abs(diff); i++) {
        const podId = deployment.pods.pop();
        this.deletePod(podId);
      }
      deployment.replicas = replicas;
    }
  }

  // Delete pod
  deletePod(podId) {
    const pod = this.pods.get(podId);
    if (!pod) return;
    
    const node = this.nodes.get(pod.node);
    node.pods = node.pods.filter(p => p !== podId);
    node.used -= pod.resources.cpu;
    
    this.pods.delete(podId);
    console.log(`  [POD] Deleted ${podId}`);
  }

  // Create service (load balancer)
  createService(name, deploymentName, port) {
    const deployment = this.deployments.get(deploymentName);
    if (!deployment) return;
    
    const service = {
      name,
      deployment: deploymentName,
      port,
      endpoints: deployment.pods.map(podId => {
        const pod = this.pods.get(podId);
        return { pod: podId, node: pod.node };
      })
    };
    
    this.services.set(name, service);
    console.log(`[SERVICE] Created ${name} -> ${deploymentName}`);
  }

  // Health check
  healthCheck() {
    console.log('[HEALTH] Checking pods...');
    
    for (const [podId, pod] of this.pods) {
      // Simulate health check
      if (Math.random() < 0.1) {
        console.log(`  [UNHEALTHY] ${podId}`);
        this.restartPod(podId);
      }
    }
  }

  // Restart pod
  restartPod(podId) {
    const pod = this.pods.get(podId);
    const deployment = this.deployments.get(pod.deployment);
    
    this.deletePod(podId);
    
    const node = this.selectNode(deployment.resources);
    if (node) {
      this.createPod(podId, deployment, node.id);
      console.log(`  [RESTART] ${podId}`);
    }
  }

  // Get stats
  stats() {
    const nodeStats = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      pods: n.pods.length,
      utilization: (n.used / n.capacity * 100).toFixed(1) + '%'
    }));
    
    return {
      nodes: this.nodes.size,
      pods: this.pods.size,
      deployments: this.deployments.size,
      services: this.services.size,
      nodes: nodeStats
    };
  }
}

// Demo
if (require.main === module) {
  const orchestrator = new ContainerOrchestrator();
  
  console.log('=== Container Orchestrator Demo ===\n');
  
  // Add nodes
  orchestrator.addNode('node1', 10);
  orchestrator.addNode('node2', 10);
  orchestrator.addNode('node3', 10);
  
  console.log();
  
  // Create deployment
  orchestrator.createDeployment('web-app', {
    replicas: 3,
    image: 'nginx:latest',
    resources: { cpu: 2, memory: 512 }
  });
  
  console.log();
  
  // Create service
  orchestrator.createService('web-service', 'web-app', 80);
  
  console.log();
  
  // Scale up
  orchestrator.scale('web-app', 5);
  
  console.log();
  
  // Scale down
  orchestrator.scale('web-app', 2);
  
  console.log('\nStats:', orchestrator.stats());
}

module.exports = ContainerOrchestrator;
