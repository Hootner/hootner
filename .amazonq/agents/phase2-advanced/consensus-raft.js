// Minimal Consensus Algorithm - Raft (Leader Election, Log Replication)
class RaftNode {
  constructor(id, peers) {
    this.id = id;
    this.peers = peers;
    this.state = 'follower'; // follower, candidate, leader
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];
    this.commitIndex = 0;
    this.votes = 0;
  }

  // Start election
  startElection() {
    this.state = 'candidate';
    this.currentTerm++;
    this.votedFor = this.id;
    this.votes = 1;
    
    console.log(`Node ${this.id}: Starting election for term ${this.currentTerm}`);
    
    // Request votes from peers
    this.peers.forEach(peer => {
      const granted = peer.requestVote(this.currentTerm, this.id, this.log.length);
      if (granted) this.votes++;
    });

    // Check if won
    if (this.votes > (this.peers.length + 1) / 2) {
      this.becomeLeader();
    }
  }

  // Handle vote request
  requestVote(term, candidateId, logLength) {
    if (term < this.currentTerm) return false;
    
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
      this.state = 'follower';
    }

    if (!this.votedFor && logLength >= this.log.length) {
      this.votedFor = candidateId;
      console.log(`Node ${this.id}: Voted for ${candidateId} in term ${term}`);
      return true;
    }
    return false;
  }

  becomeLeader() {
    this.state = 'leader';
    console.log(`Node ${this.id}: Became LEADER for term ${this.currentTerm}`);
  }

  // Append entry (leader only)
  appendEntry(data) {
    if (this.state !== 'leader') return false;
    
    const entry = { term: this.currentTerm, index: this.log.length, data };
    this.log.push(entry);
    
    // Replicate to followers
    let acks = 1;
    this.peers.forEach(peer => {
      if (peer.replicateLog(this.currentTerm, entry)) acks++;
    });

    // Commit if majority
    if (acks > (this.peers.length + 1) / 2) {
      this.commitIndex = entry.index;
      console.log(`Node ${this.id}: Committed entry ${entry.index}: ${data}`);
      return true;
    }
    return false;
  }

  // Replicate log entry (follower)
  replicateLog(term, entry) {
    if (term < this.currentTerm) return false;
    
    this.currentTerm = term;
    this.state = 'follower';
    this.log.push(entry);
    console.log(`Node ${this.id}: Replicated entry ${entry.index}`);
    return true;
  }

  getState() {
    return {
      id: this.id,
      state: this.state,
      term: this.currentTerm,
      logSize: this.log.length,
      commitIndex: this.commitIndex
    };
  }
}

// Demo: 5-node Raft cluster
const nodes = [];
for (let i = 1; i <= 5; i++) {
  nodes.push(new RaftNode(i, []));
}

// Set peers (exclude self)
nodes.forEach((node, i) => {
  node.peers = nodes.filter((_, j) => i !== j);
});

// Simulate election
console.log('=== Leader Election ===\n');
nodes[0].startElection();

// Leader appends entries
console.log('\n=== Log Replication ===\n');
const leader = nodes.find(n => n.state === 'leader');
if (leader) {
  leader.appendEntry('SET x=10');
  leader.appendEntry('SET y=20');
  leader.appendEntry('SET z=30');
}

// Show cluster state
console.log('\n=== Cluster State ===');
nodes.forEach(node => console.log(node.getState()));

export default RaftNode;
