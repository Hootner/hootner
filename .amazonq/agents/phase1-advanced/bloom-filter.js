// Minimal Bloom Filter - Probabilistic Set Membership
class BloomFilter {
  constructor(size = 1000, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  // Simple hash functions
  hash(str, seed = 0) {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % this.size;
  }

  setBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.bits[byteIndex] |= (1 << bitIndex);
  }

  getBit(index) {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.bits[byteIndex] & (1 << bitIndex)) !== 0;
  }

  add(item) {
    const str = String(item);
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(str, i);
      this.setBit(index);
    }
  }

  contains(item) {
    const str = String(item);
    for (let i = 0; i < this.hashCount; i++) {
      const index = this.hash(str, i);
      if (!this.getBit(index)) return false;
    }
    return true; // Probably contains (may have false positives)
  }

  // Estimate false positive rate
  falsePositiveRate(itemCount) {
    const k = this.hashCount;
    const m = this.size;
    const n = itemCount;
    return Math.pow(1 - Math.exp(-k * n / m), k);
  }
}

// Demo: URL Blacklist
const blacklist = new BloomFilter(10000, 4);

// Add malicious URLs
const maliciousUrls = [
  'evil.com/malware',
  'phishing.net/login',
  'scam.org/prize',
  'virus.io/download'
];

maliciousUrls.forEach(url => blacklist.add(url));

// Test membership
console.log('evil.com/malware blocked?', blacklist.contains('evil.com/malware')); // true
console.log('google.com blocked?', blacklist.contains('google.com')); // false (probably)
console.log('phishing.net/login blocked?', blacklist.contains('phishing.net/login')); // true

// False positive rate
console.log('False positive rate:', blacklist.falsePositiveRate(maliciousUrls.length).toFixed(4));

// Space efficiency
console.log('Memory used:', blacklist.bits.length, 'bytes for', maliciousUrls.length, 'items');

export default BloomFilter;
