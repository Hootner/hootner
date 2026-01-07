// Minimal Decentralized Storage (IPFS-like)
import crypto from 'crypto';

class DecentralizedStorage {
  constructor() {
    this.blocks = new Map();
  }

  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  }

  put(data) {
    const hash = this.hash(data);
    this.blocks.set(hash, data);
    return hash;
  }

  get(hash) {
    return this.blocks.get(hash);
  }

  pin(hash) {
    console.log(`Pinned: ${hash}`);
  }
}

const storage = new DecentralizedStorage();
const hash = storage.put('Hello World');
console.log('Hash:', hash);
console.log('Data:', storage.get(hash));

export default DecentralizedStorage;
