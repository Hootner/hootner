#!/usr/bin/env node
/**
 * Layer 11: Distributed File System - HDFS-like distributed storage
 * Dependencies: Layer 3 (Filesystem), Layer 5 (RPC), Layer 6 (Distributed Storage)
 */

class DistributedFileSystem {
  constructor(replicationFactor = 3) {
    this.nameNode = new NameNode();
    this.dataNodes = new Map();
    this.replicationFactor = replicationFactor;
  }

  // Add data node
  addDataNode(nodeId, capacity = 1000) {
    const node = new DataNode(nodeId, capacity);
    this.dataNodes.set(nodeId, node);
    this.nameNode.registerDataNode(nodeId, capacity);
    console.log(`[DATANODE] Added ${nodeId}`);
  }

  // Write file
  write(path, data) {
    const blockSize = 64; // 64 bytes per block
    const blocks = [];
    
    // Split into blocks
    for (let i = 0; i < data.length; i += blockSize) {
      blocks.push(data.slice(i, i + blockSize));
    }
    
    console.log(`[WRITE] ${path} (${blocks.length} blocks)`);
    
    const blockLocations = [];
    
    // Write each block with replication
    for (let i = 0; i < blocks.length; i++) {
      const blockId = `${path}_block_${i}`;
      const nodes = this.selectDataNodes(this.replicationFactor);
      
      for (const nodeId of nodes) {
        const node = this.dataNodes.get(nodeId);
        node.writeBlock(blockId, blocks[i]);
      }
      
      blockLocations.push({ blockId, nodes });
    }
    
    // Update metadata
    this.nameNode.createFile(path, blockLocations);
    
    return blockLocations.length;
  }

  // Read file
  read(path) {
    const metadata = this.nameNode.getFile(path);
    if (!metadata) {
      console.log(`[ERROR] File ${path} not found`);
      return null;
    }
    
    console.log(`[READ] ${path} (${metadata.blocks.length} blocks)`);
    
    let data = '';
    
    // Read each block
    for (const { blockId, nodes } of metadata.blocks) {
      // Try each replica until success
      for (const nodeId of nodes) {
        const node = this.dataNodes.get(nodeId);
        if (node && node.healthy) {
          const block = node.readBlock(blockId);
          if (block) {
            data += block;
            break;
          }
        }
      }
    }
    
    return data;
  }

  // Delete file
  delete(path) {
    const metadata = this.nameNode.getFile(path);
    if (!metadata) return false;
    
    console.log(`[DELETE] ${path}`);
    
    // Delete all blocks
    for (const { blockId, nodes } of metadata.blocks) {
      for (const nodeId of nodes) {
        const node = this.dataNodes.get(nodeId);
        if (node) node.deleteBlock(blockId);
      }
    }
    
    this.nameNode.deleteFile(path);
    return true;
  }

  // Select data nodes for replication
  selectDataNodes(count) {
    const available = Array.from(this.dataNodes.values())
      .filter(n => n.healthy && n.used < n.capacity)
      .sort((a, b) => a.used - b.used);
    
    return available.slice(0, count).map(n => n.id);
  }

  // Check and repair replication
  checkReplication() {
    console.log('[REPLICATION] Checking...');
    
    for (const [path, metadata] of this.nameNode.files) {
      for (const { blockId, nodes } of metadata.blocks) {
        const healthy = nodes.filter(nodeId => {
          const node = this.dataNodes.get(nodeId);
          return node && node.healthy && node.hasBlock(blockId);
        });
        
        if (healthy.length < this.replicationFactor) {
          console.log(`  [REPAIR] Block ${blockId} under-replicated (${healthy.length}/${this.replicationFactor})`);
          this.replicateBlock(blockId, healthy, this.replicationFactor - healthy.length);
        }
      }
    }
  }

  // Replicate block
  replicateBlock(blockId, existingNodes, count) {
    const sourceNode = this.dataNodes.get(existingNodes[0]);
    const block = sourceNode.readBlock(blockId);
    
    const newNodes = this.selectDataNodes(count);
    
    for (const nodeId of newNodes) {
      if (!existingNodes.includes(nodeId)) {
        const node = this.dataNodes.get(nodeId);
        node.writeBlock(blockId, block);
      }
    }
  }

  // Get stats
  stats() {
    const totalCapacity = Array.from(this.dataNodes.values())
      .reduce((sum, n) => sum + n.capacity, 0);
    
    const totalUsed = Array.from(this.dataNodes.values())
      .reduce((sum, n) => sum + n.used, 0);
    
    return {
      dataNodes: this.dataNodes.size,
      files: this.nameNode.files.size,
      capacity: totalCapacity,
      used: totalUsed,
      utilization: (totalUsed / totalCapacity * 100).toFixed(1) + '%'
    };
  }
}

// NameNode (metadata server)
class NameNode {
  constructor() {
    this.files = new Map();
    this.dataNodes = new Map();
  }

  registerDataNode(nodeId, capacity) {
    this.dataNodes.set(nodeId, { id: nodeId, capacity, lastHeartbeat: Date.now() });
  }

  createFile(path, blocks) {
    this.files.set(path, { path, blocks, created: Date.now() });
  }

  getFile(path) {
    return this.files.get(path);
  }

  deleteFile(path) {
    this.files.delete(path);
  }
}

// DataNode (storage server)
class DataNode {
  constructor(id, capacity) {
    this.id = id;
    this.capacity = capacity;
    this.used = 0;
    this.blocks = new Map();
    this.healthy = true;
  }

  writeBlock(blockId, data) {
    this.blocks.set(blockId, data);
    this.used += data.length;
  }

  readBlock(blockId) {
    return this.blocks.get(blockId);
  }

  deleteBlock(blockId) {
    const data = this.blocks.get(blockId);
    if (data) {
      this.used -= data.length;
      this.blocks.delete(blockId);
    }
  }

  hasBlock(blockId) {
    return this.blocks.has(blockId);
  }
}

// Demo
if (require.main === module) {
  const dfs = new DistributedFileSystem(3);
  
  console.log('=== Distributed File System Demo ===\n');
  
  // Add data nodes
  dfs.addDataNode('node1', 1000);
  dfs.addDataNode('node2', 1000);
  dfs.addDataNode('node3', 1000);
  dfs.addDataNode('node4', 1000);
  
  console.log();
  
  // Write file
  const data = 'This is a test file that will be split into blocks and replicated across multiple data nodes for fault tolerance.';
  dfs.write('/user/data/test.txt', data);
  
  console.log();
  
  // Read file
  const content = dfs.read('/user/data/test.txt');
  console.log('Read content:', content.slice(0, 50) + '...');
  console.log('Match:', content === data);
  
  console.log();
  
  // Check replication
  dfs.checkReplication();
  
  console.log('\nStats:', dfs.stats());
}

module.exports = DistributedFileSystem;
