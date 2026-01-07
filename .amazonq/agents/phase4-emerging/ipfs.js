// Minimal IPFS - Content Addressing, DHT, Block Storage
const crypto = require('crypto');

class Block {
  constructor(data) {
    this.data = data;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.data).digest('hex').substring(0, 16);
  }
}

class IPFSNode {
  constructor(id) {
    this.id = id;
    this.blocks = new Map();
    this.peers = [];
  }

  addPeer(peer) {
    if (!this.peers.includes(peer)) {
      this.peers.push(peer);
    }
  }

  // Add content and return CID
  add(content) {
    const block = new Block(content);
    this.blocks.set(block.hash, block);
    console.log(`Node ${this.id}: Added block ${block.hash}`);
    return block.hash;
  }

  // Get content by CID
  get(cid) {
    if (this.blocks.has(cid)) {
      console.log(`Node ${this.id}: Found locally`);
      return this.blocks.get(cid).data;
    }

    // Search peers
    for (const peer of this.peers) {
      if (peer.blocks.has(cid)) {
        console.log(`Node ${this.id}: Found on peer ${peer.id}`);
        const block = peer.blocks.get(cid);
        // Cache locally
        this.blocks.set(cid, block);
        return block.data;
      }
    }

    return null;
  }

  // Pin content (prevent garbage collection)
  pin(cid) {
    const block = this.blocks.get(cid);
    if (block) {
      block.pinned = true;
      console.log(`Node ${this.id}: Pinned ${cid}`);
    }
  }

  // List stored blocks
  list() {
    return Array.from(this.blocks.keys());
  }
}

class IPFSNetwork {
  constructor() {
    this.nodes = new Map();
  }

  createNode(id) {
    const node = new IPFSNode(id);
    this.nodes.set(id, node);
    return node;
  }

  connect(nodeId1, nodeId2) {
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);
    
    if (node1 && node2) {
      node1.addPeer(node2);
      node2.addPeer(node1);
      console.log(`Connected ${nodeId1} <-> ${nodeId2}`);
    }
  }
}

// Demo
console.log('=== IPFS Demo ===\n');

const network = new IPFSNetwork();

// Create nodes
const node1 = network.createNode('node-1');
const node2 = network.createNode('node-2');
const node3 = network.createNode('node-3');

// Connect nodes
network.connect('node-1', 'node-2');
network.connect('node-2', 'node-3');

console.log('\n--- Add Content ---');
const cid1 = node1.add('Hello, IPFS!');
const cid2 = node2.add('Distributed storage');

console.log('\n--- Retrieve Content ---');
const content1 = node1.get(cid1);
console.log('Retrieved:', content1);

console.log('\n--- Peer Discovery ---');
const content2 = node3.get(cid2); // Node3 gets from Node2
console.log('Retrieved from peer:', content2);

console.log('\n--- Content Addressing ---');
console.log('Same content = same CID');
const cid3 = node3.add('Hello, IPFS!');
console.log(`CID1: ${cid1}`);
console.log(`CID3: ${cid3}`);
console.log(`Match: ${cid1 === cid3}`);

module.exports = { IPFSNode, IPFSNetwork };
