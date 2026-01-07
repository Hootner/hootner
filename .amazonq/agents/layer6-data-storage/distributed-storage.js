#!/usr/bin/env node
/**
 * Layer 6: Distributed Storage - Replicated and sharded storage system
 * Dependencies: Layer 0 (Hash), Layer 5 (RPC, Message Broker), Layer 6 (Key-Value)
 */

class DistributedStorage {
  constructor(replicationFactor = 3) {
    this.nodes = new Map();
    this.replicationFactor = replicationFactor;
    this.data = new Map();
    this.operations = [];
  }

  // Add storage node
  addNode(nodeId, capacity = 1000) {
    this.nodes.set(nodeId, {
      id: nodeId,
      capacity,
      used: 0,
      data: new Map(),
      healthy: true
    });
    console.log(`[NODE] Added ${nodeId} (capacity: ${capacity})`);
  }

  // Hash key to determine shard
  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  // Get nodes for key (consistent hashing)
  getNodesForKey(key) {
    const nodeIds = Array.from(this.nodes.keys()).filter(id => 
      this.nodes.get(id).healthy
    );
    
    if (nodeIds.length === 0) return [];
    
    const hash = this.hash(key);
    const primaryIdx = hash % nodeIds.length;
    const nodes = [];
    
    // Primary + replicas
    for (let i = 0; i < Math.min(this.replicationFactor, nodeIds.length); i++) {
      const idx = (primaryIdx + i) % nodeIds.length;
      nodes.push(nodeIds[idx]);
    }
    
    return nodes;
  }

  // Put key-value
  async put(key, value, consistency = 'quorum') {
    const nodes = this.getNodesForKey(key);
    
    console.log(`[PUT] ${key} -> nodes: ${nodes.join(', ')}`);
    
    const writes = [];
    for (const nodeId of nodes) {
      writes.push(this.writeToNode(nodeId, key, value));
    }
    
    // Wait based on consistency level
    const required = this.getRequiredWrites(nodes.length, consistency);
    const results = await Promise.allSettled(writes);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    if (successful >= required) {
      this.operations.push({ op: 'PUT', key, nodes, time: Date.now() });
      console.log(`[SUCCESS] ${successful}/${nodes.length} writes`);
      return true;
    } else {
      console.log(`[FAILED] Only ${successful}/${required} writes succeeded`);
      return false;
    }
  }

  // Get key-value
  async get(key, consistency = 'quorum') {
    const nodes = this.getNodesForKey(key);
    
    console.log(`[GET] ${key} from nodes: ${nodes.join(', ')}`);
    
    const reads = [];
    for (const nodeId of nodes) {
      reads.push(this.readFromNode(nodeId, key));
    }
    
    // Wait based on consistency level
    const required = this.getRequiredReads(nodes.length, consistency);
    const results = await Promise.allSettled(reads);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    if (successful.length >= required) {
      // Read repair: resolve conflicts
      const values = successful.map(r => r.value);
      const resolved = this.resolveConflict(values);
      
      this.operations.push({ op: 'GET', key, nodes, time: Date.now() });
      console.log(`[SUCCESS] Read from ${successful.length}/${nodes.length} nodes`);
      return resolved;
    } else {
      console.log(`[FAILED] Only ${successful.length}/${required} reads succeeded`);
      return null;
    }
  }

  // Write to node
  async writeToNode(nodeId, key, value) {
    const node = this.nodes.get(nodeId);
    if (!node || !node.healthy) throw new Error('Node unavailable');
    
    node.data.set(key, {
      value,
      version: Date.now(),
      timestamp: Date.now()
    });
    node.used++;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    return true;
  }

  // Read from node
  async readFromNode(nodeId, key) {
    const node = this.nodes.get(nodeId);
    if (!node || !node.healthy) throw new Error('Node unavailable');
    
    const entry = node.data.get(key);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    return entry || null;
  }

  // Resolve conflicts (last-write-wins)
  resolveConflict(values) {
    const valid = values.filter(v => v !== null);
    if (valid.length === 0) return null;
    
    // Use highest version (timestamp)
    return valid.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    );
  }

  // Get required writes for consistency
  getRequiredWrites(total, consistency) {
    if (consistency === 'one') return 1;
    if (consistency === 'all') return total;
    return Math.floor(total / 2) + 1; // quorum
  }

  // Get required reads for consistency
  getRequiredReads(total, consistency) {
    if (consistency === 'one') return 1;
    if (consistency === 'all') return total;
    return Math.floor(total / 2) + 1; // quorum
  }

  // Mark node as unhealthy
  markUnhealthy(nodeId) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.healthy = false;
      console.log(`[UNHEALTHY] Node ${nodeId}`);
    }
  }

  // Rebalance data across nodes
  rebalance() {
    console.log('[REBALANCE] Starting data rebalancing');
    // In production, this would redistribute data
    // based on node capacity and load
  }

  // Get statistics
  stats() {
    const nodeStats = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      used: n.used,
      capacity: n.capacity,
      healthy: n.healthy,
      utilization: (n.used / n.capacity * 100).toFixed(1) + '%'
    }));
    
    return {
      nodes: this.nodes.size,
      replicationFactor: this.replicationFactor,
      operations: this.operations.length,
      nodes: nodeStats
    };
  }
}

// Demo
if (require.main === module) {
  const storage = new DistributedStorage(3);
  
  console.log('=== Distributed Storage Demo ===\n');
  
  // Add nodes
  storage.addNode('node1', 1000);
  storage.addNode('node2', 1000);
  storage.addNode('node3', 1000);
  storage.addNode('node4', 1000);
  
  console.log();
  
  (async () => {
    // Put with quorum consistency
    await storage.put('user:1', 'Alice', 'quorum');
    await storage.put('user:2', 'Bob', 'quorum');
    
    console.log();
    
    // Get with quorum consistency
    const value1 = await storage.get('user:1', 'quorum');
    console.log('Value:', value1?.value);
    
    console.log();
    
    // Simulate node failure
    storage.markUnhealthy('node2');
    
    // Still works with remaining nodes
    const value2 = await storage.get('user:2', 'quorum');
    console.log('Value:', value2?.value);
    
    console.log('\nStats:', storage.stats());
  })();
}

module.exports = DistributedStorage;
