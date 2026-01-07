// Minimal Hash Table
class HashTable {
  constructor(size = 16) {
    this.size = size;
    this.buckets = Array(size).fill(null).map(() => []);
  }

  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
    }
    return Math.abs(hash) % this.size;
  }

  set(key, value) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const existing = bucket.find(([k]) => k === key);
    if (existing) existing[1] = value;
    else bucket.push([key, value]);
  }

  get(key) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    const entry = bucket.find(([k]) => k === key);
    return entry ? entry[1] : undefined;
  }
}

const ht = new HashTable();
ht.set('name', 'Alice');
console.log(ht.get('name'));

export default HashTable;
