// Minimal WebRTC Signaling - P2P Connection Setup
class WebRTCPeer {
  constructor(id) {
    this.id = id;
    this.connections = new Map();
    this.localDescription = null;
    this.remoteDescriptions = new Map();
    this.iceCandidates = [];
  }

  createOffer(peerId) {
    this.localDescription = {
      type: 'offer',
      sdp: `offer-${this.id}-to-${peerId}-${Date.now()}`
    };
    return this.localDescription;
  }

  createAnswer(peerId, offer) {
    this.remoteDescriptions.set(peerId, offer);
    this.localDescription = {
      type: 'answer',
      sdp: `answer-${this.id}-to-${peerId}-${Date.now()}`
    };
    return this.localDescription;
  }

  addIceCandidate(candidate) {
    this.iceCandidates.push(candidate);
  }

  connect(peerId) {
    this.connections.set(peerId, { state: 'connected', channel: null });
    console.log(`${this.id} connected to ${peerId}`);
  }

  send(peerId, data) {
    if (this.connections.has(peerId)) {
      console.log(`${this.id} -> ${peerId}: ${data}`);
      return true;
    }
    return false;
  }
}

class SignalingServer {
  constructor() {
    this.peers = new Map();
    this.messages = [];
  }

  register(peer) {
    this.peers.set(peer.id, peer);
    console.log(`Registered peer: ${peer.id}`);
  }

  signal(fromId, toId, message) {
    const toPeer = this.peers.get(toId);
    if (!toPeer) {
      throw new Error(`Peer ${toId} not found`);
    }

    this.messages.push({ from: fromId, to: toId, message, timestamp: Date.now() });
    
    console.log(`Signal: ${fromId} -> ${toId} (${message.type})`);
    return true;
  }

  // Facilitate P2P connection
  connect(peerId1, peerId2) {
    const peer1 = this.peers.get(peerId1);
    const peer2 = this.peers.get(peerId2);

    if (!peer1 || !peer2) {
      throw new Error('Peers not found');
    }

    console.log(`\n=== Connecting ${peerId1} <-> ${peerId2} ===`);

    // 1. Peer1 creates offer
    const offer = peer1.createOffer(peerId2);
    this.signal(peerId1, peerId2, offer);

    // 2. Peer2 receives offer and creates answer
    const answer = peer2.createAnswer(peerId1, offer);
    this.signal(peerId2, peerId1, answer);

    // 3. Exchange ICE candidates
    const ice1 = { candidate: `ice-${peerId1}`, sdpMid: 0 };
    const ice2 = { candidate: `ice-${peerId2}`, sdpMid: 0 };
    
    peer1.addIceCandidate(ice2);
    peer2.addIceCandidate(ice1);

    // 4. Establish connection
    peer1.connect(peerId2);
    peer2.connect(peerId1);

    console.log('Connection established!\n');
  }
}

// Demo
console.log('=== WebRTC Signaling Demo ===\n');

const server = new SignalingServer();

// Create peers
const alice = new WebRTCPeer('alice');
const bob = new WebRTCPeer('bob');
const charlie = new WebRTCPeer('charlie');

// Register with signaling server
server.register(alice);
server.register(bob);
server.register(charlie);

// Connect peers
server.connect('alice', 'bob');
server.connect('alice', 'charlie');

// Send P2P messages
console.log('--- P2P Communication ---');
alice.send('bob', 'Hello Bob!');
bob.send('alice', 'Hi Alice!');
alice.send('charlie', 'Hey Charlie!');

console.log('\n--- Connection Status ---');
console.log('Alice connections:', Array.from(alice.connections.keys()));
console.log('Bob connections:', Array.from(bob.connections.keys()));
console.log('Charlie connections:', Array.from(charlie.connections.keys()));

export { WebRTCPeer, SignalingServer };
