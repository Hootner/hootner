#!/usr/bin/env node
/**
 * Layer 11: Consensus Algorithm - Distributed consensus (Raft-like)
 * Dependencies: Layer 5 (RPC, Message Broker), Layer 11 (Blockchain)
 */

class ConsensusNode {
  constructor(id, peers) {
    this.id = id;
    this.peers = peers;
    this.state = 'follower'; // follower, candidate, leader
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];
    this.commitIndex = 0;
    this.lastApplied = 0;
    this.electionTimeout = this.randomTimeout();
    this.heartbeatInterval = 50;
  }

  // Random election timeout
  randomTimeout() {
    return 150 + Math.random() * 150;
  }

  // Start election
  startElection() {
    this.state = 'candidate';
    this.currentTerm++;
    this.votedFor = this.id;
    
    console.log(`[${this.id}] Starting election for term ${this.currentTerm}`);
    
    let votes = 1; // Vote for self
    
    // Request votes from peers
    for (const peer of this.peers) {
      const granted = this.requestVote(peer);
      if (granted) votes++;
    }
    
    // Check if won election
    if (votes > (this.peers.length + 1) / 2) {
      this.becomeLeader();
    } else {
      this.state = 'follower';
    }
  }

  // Request vote from peer
  requestVote(peer) {
    console.log(`  [${this.id}] Requesting vote from ${peer.id}`);
    
    // Peer grants vote if:
    // 1. Haven't voted in this term
    // 2. Candidate's log is at least as up-to-date
    if (peer.currentTerm < this.currentTerm && peer.votedFor === null) {
      peer.votedFor = this.id;
      peer.currentTerm = this.currentTerm;
      console.log(`  [${peer.id}] Granted vote to ${this.id}`);
      return true;
    }
    
    return false;
  }

  // Become leader
  becomeLeader() {
    this.state = 'leader';
    console.log(`[${this.id}] Became leader for term ${this.currentTerm}`);
    
    // Send heartbeats
    this.sendHeartbeats();
  }

  // Send heartbeats
  sendHeartbeats() {
    if (this.state !== 'leader') return;
    
    console.log(`[${this.id}] Sending heartbeats`);
    
    for (const peer of this.peers) {
      this.appendEntries(peer);
    }
  }

  // Append entries (heartbeat or log replication)
  appendEntries(peer, entries = []) {
    if (peer.currentTerm > this.currentTerm) {
      this.state = 'follower';
      this.currentTerm = peer.currentTerm;
      return false;
    }
    
    // Peer accepts if term is current
    if (peer.currentTerm <= this.currentTerm) {
      peer.currentTerm = this.currentTerm;
      peer.state = 'follower';
      
      // Append entries
      for (const entry of entries) {
        peer.log.push(entry);
      }
      
      return true;
    }
    
    return false;
  }

  // Client request (leader only)
  clientRequest(command) {
    if (this.state !== 'leader') {
      console.log(`[${this.id}] Not leader, cannot process request`);
      return false;
    }
    
    const entry = {
      term: this.currentTerm,
      command,
      index: this.log.length
    };
    
    this.log.push(entry);
    console.log(`[${this.id}] Appended entry: ${command}`);
    
    // Replicate to peers
    let replicated = 1; // Self
    
    for (const peer of this.peers) {
      if (this.appendEntries(peer, [entry])) {
        replicated++;
      }
    }
    
    // Commit if majority
    if (replicated > (this.peers.length + 1) / 2) {
      this.commitIndex = entry.index;
      console.log(`[${this.id}] Committed entry ${entry.index}`);
      return true;
    }
    
    return false;
  }

  // Get status
  status() {
    return {
      id: this.id,
      state: this.state,
      term: this.currentTerm,
      logLength: this.log.length,
      commitIndex: this.commitIndex
    };
  }
}

// Demo
if (require.main === module) {
  console.log('=== Consensus Algorithm Demo ===\n');
  
  // Create cluster
  const node1 = new ConsensusNode('node1', []);
  const node2 = new ConsensusNode('node2', []);
  const node3 = new ConsensusNode('node3', []);
  
  // Set peers
  node1.peers = [node2, node3];
  node2.peers = [node1, node3];
  node3.peers = [node1, node2];
  
  console.log('Initial state:');
  console.log('  Node1:', node1.status());
  console.log('  Node2:', node2.status());
  console.log('  Node3:', node3.status());
  
  console.log();
  
  // Start election
  node1.startElection();
  
  console.log();
  console.log('After election:');
  console.log('  Node1:', node1.status());
  console.log('  Node2:', node2.status());
  console.log('  Node3:', node3.status());
  
  console.log();
  
  // Client requests
  node1.clientRequest('SET x = 1');
  node1.clientRequest('SET y = 2');
  
  console.log();
  console.log('After requests:');
  console.log('  Node1:', node1.status());
  console.log('  Node2:', node2.status());
  console.log('  Node3:', node3.status());
}

module.exports = ConsensusNode;
