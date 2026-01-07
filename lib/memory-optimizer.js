const gc = global.gc;

class MemoryOptimizer { constructor(opts = {}) { this.threshold = opts.threshold || 150 * 1024 * 1024;
    this.interval = null;
    this.cache = new Map();
    this.maxCacheSize = opts.maxCacheSize || 100; }

  start() { this.interval = setInterval(() => { const { heapUsed } = process.memoryUsage();
      if (heapUsed > this.threshold) { this.cleanup(); } }, 60000); }

  cleanup() { this.cache.clear();
    if (gc) gc(); }

  set(key, value, ttl = 300000) { if (this.cache.size >= this.maxCacheSize) { const first = this.cache.keys().next().value;
      this.cache.delete(first); }
    this.cache.set(key, { value, expires: Date.now() + ttl }); }

  get(key) { const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) { this.cache.delete(key);
      return null; }
    return item.value; }

  stop() { if (this.interval) clearInterval(this.interval);
    this.cache.clear(); } }

export default MemoryOptimizer;
