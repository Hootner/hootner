// Minimal BitTorrent Client
class BitTorrent {
  constructor() {
    this.peers = [];
    this.pieces = new Map();
  }

  addPeer(peer) {
    this.peers.push(peer);
  }

  request(pieceIndex) {
    const peer = this.peers[Math.floor(Math.random() * this.peers.length)];
    console.log(`Requesting piece ${pieceIndex} from ${peer}`);
    return peer;
  }

  download(file, numPieces) {
    for (let i = 0; i < numPieces; i++) {
      const peer = this.request(i);
      this.pieces.set(i, `piece-${i}-from-${peer}`);
    }
    return Array.from(this.pieces.values()).join('');
  }
}

const bt = new BitTorrent();
bt.addPeer('peer1');
bt.addPeer('peer2');
console.log(bt.download('file.txt', 3));

export default BitTorrent;
