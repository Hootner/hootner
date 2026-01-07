// Minimal Edge Computing - Geo-Distribution, Latency Optimization
class EdgeNode {
  constructor(id, location, capacity) {
    this.id = id;
    this.location = location;
    this.capacity = capacity;
    this.load = 0;
    this.functions = new Map();
  }

  deploy(fnName, fn) {
    this.functions.set(fnName, fn);
  }

  execute(fnName, ...args) {
    if (this.load >= this.capacity) {
      throw new Error('Node overloaded');
    }

    const fn = this.functions.get(fnName);
    if (!fn) throw new Error(`Function ${fnName} not found`);

    this.load++;
    const result = fn(...args);
    this.load--;
    return result;
  }
}

class EdgeOrchestrator {
  constructor() {
    this.nodes = new Map();
    this.latencyMap = new Map();
  }

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  setLatency(from, to, latency) {
    this.latencyMap.set(`${from}-${to}`, latency);
  }

  getLatency(from, to) {
    return this.latencyMap.get(`${from}-${to}`) || 999;
  }

  // Find nearest node with function
  findBestNode(clientLocation, fnName) {
    let best = null;
    let minLatency = Infinity;

    for (const node of this.nodes.values()) {
      if (!node.functions.has(fnName)) continue;
      if (node.load >= node.capacity) continue;

      const latency = this.getLatency(clientLocation, node.location);
      if (latency < minLatency) {
        minLatency = latency;
        best = node;
      }
    }

    return { node: best, latency: minLatency };
  }

  // Execute function at nearest edge
  execute(clientLocation, fnName, ...args) {
    const { node, latency } = this.findBestNode(clientLocation, fnName);
    
    if (!node) {
      throw new Error(`No available node for ${fnName}`);
    }

    console.log(`Routing to ${node.id} (latency: ${latency}ms)`);
    const result = node.execute(fnName, ...args);
    
    return { result, node: node.id, latency };
  }

  // Deploy function to multiple nodes
  deployGlobal(fnName, fn, locations) {
    locations.forEach(loc => {
      const node = Array.from(this.nodes.values())
        .find(n => n.location === loc);
      if (node) node.deploy(fnName, fn);
    });
  }
}

// Demo
console.log('=== Edge Computing Demo ===\n');

const orchestrator = new EdgeOrchestrator();

// Create edge nodes
orchestrator.addNode(new EdgeNode('edge-us-east', 'us-east', 10));
orchestrator.addNode(new EdgeNode('edge-us-west', 'us-west', 10));
orchestrator.addNode(new EdgeNode('edge-eu', 'eu-west', 10));
orchestrator.addNode(new EdgeNode('edge-asia', 'asia', 10));

// Set latencies (ms)
orchestrator.setLatency('us-east', 'us-east', 5);
orchestrator.setLatency('us-east', 'us-west', 80);
orchestrator.setLatency('us-east', 'eu-west', 100);
orchestrator.setLatency('us-east', 'asia', 200);

// Deploy image processing function globally
const processImage = (url) => `Processed: ${url}`;
orchestrator.deployGlobal('processImage', processImage, 
  ['us-east', 'us-west', 'eu-west', 'asia']);

// Execute from different locations
console.log('--- Client in US East ---');
const result1 = orchestrator.execute('us-east', 'processImage', 'photo.jpg');
console.log('Result:', result1.result);

console.log('\n--- Client in Asia ---');
orchestrator.setLatency('asia', 'asia', 5);
orchestrator.setLatency('asia', 'us-east', 200);
const result2 = orchestrator.execute('asia', 'processImage', 'photo.jpg');
console.log('Result:', result2.result);

export default EdgeOrchestrator;
