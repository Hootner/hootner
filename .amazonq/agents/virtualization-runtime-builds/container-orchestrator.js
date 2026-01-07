// Minimal Container Orchestrator - Kubernetes-like scaling and management
class ContainerOrchestrator {
  constructor() {
    this.nodes = new Map();
    this.pods = new Map();
    this.services = new Map();
    this.nextPodId = 1;
  }

  // Add worker node
  addNode(nodeId, capacity = 10) {
    this.nodes.set(nodeId, { id: nodeId, capacity, pods: [] });
    console.log(`Node ${nodeId} added (capacity: ${capacity})`);
  }

  // Deploy pod
  deploy(name, replicas = 1, image = 'app:latest') {
    console.log(`\nDeploying ${name} (${replicas} replicas)`);
    
    for (let i = 0; i < replicas; i++) {
      const podId = `${name}-${this.nextPodId++}`;
      const node = this.selectNode();
      
      if (!node) {
        console.log(`  ✗ No available nodes for ${podId}`);
        continue;
      }

      const pod = { id: podId, name, image, node: node.id, status: 'running' };
      this.pods.set(podId, pod);
      node.pods.push(podId);
      
      console.log(`  ✓ ${podId} scheduled on ${node.id}`);
    }
  }

  // Select node (simple round-robin)
  selectNode() {
    let selected = null;
    let minLoad = Infinity;

    for (const node of this.nodes.values()) {
      if (node.pods.length < node.capacity && node.pods.length < minLoad) {
        minLoad = node.pods.length;
        selected = node;
      }
    }

    return selected;
  }

  // Scale deployment
  scale(name, replicas) {
    const current = Array.from(this.pods.values()).filter(p => p.name === name);
    const diff = replicas - current.length;

    console.log(`\nScaling ${name}: ${current.length} → ${replicas}`);

    if (diff > 0) {
      // Scale up
      this.deploy(name, diff);
    } else if (diff < 0) {
      // Scale down
      for (let i = 0; i < Math.abs(diff); i++) {
        const pod = current[i];
        this.deletePod(pod.id);
      }
    }
  }

  // Delete pod
  deletePod(podId) {
    const pod = this.pods.get(podId);
    if (pod) {
      const node = this.nodes.get(pod.node);
      node.pods = node.pods.filter(p => p !== podId);
      this.pods.delete(podId);
      console.log(`  ✗ ${podId} deleted`);
    }
  }

  // Create service (load balancer)
  createService(name, selector) {
    this.services.set(name, { name, selector, endpoints: [] });
    this.updateService(name);
    console.log(`Service ${name} created`);
  }

  // Update service endpoints
  updateService(name) {
    const service = this.services.get(name);
    service.endpoints = Array.from(this.pods.values())
      .filter(p => p.name === service.selector && p.status === 'running')
      .map(p => p.id);
  }

  // Get service endpoint (round-robin)
  getEndpoint(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.endpoints.length === 0) return null;
    
    const endpoint = service.endpoints[Math.floor(Math.random() * service.endpoints.length)];
    return endpoint;
  }

  // Health check
  healthCheck() {
    console.log('\n--- Health Check ---');
    for (const pod of this.pods.values()) {
      // Simulate random failures
      if (Math.random() < 0.1) {
        pod.status = 'failed';
        console.log(`  ✗ ${pod.id} failed`);
        this.deletePod(pod.id);
        // Auto-restart
        this.deploy(pod.name, 1, pod.image);
      }
    }
  }

  // Status
  status() {
    console.log('\n=== Cluster Status ===');
    console.log(`Nodes: ${this.nodes.size}`);
    console.log(`Pods: ${this.pods.size}`);
    console.log(`Services: ${this.services.size}`);
    
    console.log('\nNode Distribution:');
    for (const node of this.nodes.values()) {
      console.log(`  ${node.id}: ${node.pods.length}/${node.capacity} pods`);
    }
  }
}

// Demo
console.log('=== Container Orchestrator Demo ===\n');

const k8s = new ContainerOrchestrator();

// Add nodes
k8s.addNode('node-1', 5);
k8s.addNode('node-2', 5);
k8s.addNode('node-3', 5);

// Deploy app
k8s.deploy('web-app', 3);
k8s.deploy('api', 2);

// Create service
k8s.createService('web-service', 'web-app');

// Scale
k8s.scale('web-app', 5);

// Health check
k8s.healthCheck();

// Status
k8s.status();

export default ContainerOrchestrator;
