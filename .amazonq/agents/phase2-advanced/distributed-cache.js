// Minimal Distributed Cache - Consistent Hashing, Replication, Sharding
const crypto = require('crypto');

class CacheNode {
  constructor(id) {
    this.id = id;
    this.data = new Map();
  }

  get(key) {
    return this.data.get(key);
  }

  set(key, value) {
    this.data.set(key, value);
  }

  delete(key) {
    this.data.delete(key);
  }

  size() {
    return this.data.size;
  }
}

class DistributedCache {
  constructor(replicas = 3) {
    this.nodes = new Map();
    this.ring = [];
    this.virtualNodes = 150; // Virtual nodes per physical node
    this.replicas = replicas;
  }

  hash(key) {
    return parseInt(crypto.createHash('md5').update(key).digest('hex').substring(0, 8), 16);
  }

  // Add node to ring
  addNode(nodeId) {
    const node = new CacheNode(nodeId);
    this.nodes.set(nodeId, node);

    // Add virtual nodes
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeId}:${i}`);
      this.ring.push({ hash, nodeId });
    }

    this.ring.sort((a, b) => a.hash - b.hash);
    console.log(`Added node ${nodeId} (${this.virtualNodes} virtual nodes)`);
  }

  // Remove node
  removeNode(nodeId) {
    this.nodes.delete(nodeId);
    this.ring = this.ring.filter(vn => vn.nodeId !== nodeId);
    console.log(`Removed node ${nodeId}`);
  }

  // Find nodes for key (with replication)
  findNodes(key) {
    if (this.ring.length === 0) return [];

    const hash = this.hash(key);
    const nodes = new Set();

    // Find position in ring
    let idx = this.ring.findIndex(vn => vn.hash >= hash);
    if (idx === -1) idx = 0;

    // Get replicas
    for (let i = 0; i < this.ring.length && nodes.size < this.replicas; i++) {
      const vnode = this.ring[(idx + i) % this.ring.length];
      nodes.add(vnode.nodeId);
    }

    return Array.from(nodes);
  }

  // Set value (replicated)
  set(key, value) {
    const nodeIds = this.findNodes(key);
    console.log(`SET ${key} -> nodes: ${nodeIds.join(', ')}`);

    nodeIds.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) node.set(key, value);
    });
  }

  // Get value (read from first available replica)
  get(key) {
    const nodeIds = this.findNodes(key);
    
    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      if (node) {
        const value = node.get(key);
        if (value !== undefined) {
          console.log(`GET ${key} <- node: ${nodeId}`);
          return value;
        }
      }
    }
    return undefined;
  }

  // Delete value
  delete(key) {
    const nodeIds = this.findNodes(key);
    console.log(`DELETE ${key} from nodes: ${nodeIds.join(', ')}`);

    nodeIds.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) node.delete(key);
    });
  }

  // Get stats
  getStats() {
    const stats = {};
    this.nodes.forEach((node, id) => {
      stats[id] = { keys: node.size() };
    });
    return stats;
  }
}

// Demo
console.log('=== Distributed Cache Demo ===\n');

const cache = new DistributedCache(2); // 2 replicas

// Add nodes
cache.addNode('node-1');
cache.addNode('node-2');
cache.addNode('node-3');

console.log('\n--- Setting values ---');
cache.set('user:1', { name: 'Alice', age: 30 });
cache.set('user:2', { name: 'Bob', age: 25 });
cache.set('user:3', { name: 'Charlie', age: 35 });
cache.set('session:abc', { token: 'xyz123' });

console.log('\n--- Getting values ---');
console.log(cache.get('user:1'));
console.log(cache.get('user:2'));

console.log('\n--- Node failure simulation ---');
cache.removeNode('node-2');

console.log('\n--- Getting after failure ---');
console.log(cache.get('user:1')); // Should still work (replica)

console.log('\n--- Stats ---');
console.log(cache.getStats());

module.exports = DistributedCache;
