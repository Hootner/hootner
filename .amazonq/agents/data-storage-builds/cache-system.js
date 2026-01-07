// Minimal Cache System
class Cache {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  set(key, value, ttl = null) {
    this.store.set(key, value);
    if (ttl) {
      this.ttls.set(key, Date.now() + ttl);
      setTimeout(() => this.delete(key), ttl);
    }
  }

  get(key) {
    if (this.ttls.has(key) && Date.now() > this.ttls.get(key)) {
      this.delete(key);
      return null;
    }
    return this.store.get(key);
  }

  delete(key) {
    this.store.delete(key);
    this.ttls.delete(key);
  }
}

const cache = new Cache();
cache.set('user:1', { name: 'Alice' }, 1000);
console.log(cache.get('user:1'));

export default Cache;
