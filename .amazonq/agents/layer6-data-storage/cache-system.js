#!/usr/bin/env node
/**
 * Layer 6: Cache System - LRU cache with TTL and eviction policies
 * Dependencies: Layer 0 (Hash), Layer 3 (Memory), Layer 6 (Key-Value Store)
 */

class CacheSystem {
  constructor(maxSize = 100, policy = 'lru') {
    this.maxSize = maxSize;
    this.policy = policy; // 'lru', 'lfu', 'fifo'
    this.cache = new Map();
    this.accessCount = new Map();
    this.accessOrder = [];
    this.hits = 0;
    this.misses = 0;
  }

  // Get from cache
  get(key) {
    if (!this.cache.has(key)) {
      this.misses++;
      console.log(`[MISS] ${key}`);
      return null;
    }
    
    const entry = this.cache.get(key);
    
    // Check TTL
    if (entry.expires && Date.now() > entry.expires) {
      this.cache.delete(key);
      this.misses++;
      console.log(`[EXPIRED] ${key}`);
      return null;
    }
    
    // Update access tracking
    this.updateAccess(key);
    
    this.hits++;
    console.log(`[HIT] ${key} = ${entry.value}`);
    return entry.value;
  }

  // Put in cache
  set(key, value, ttl = null) {
    // Evict if at capacity
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      this.evict();
    }
    
    const entry = {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : null,
      created: Date.now()
    };
    
    this.cache.set(key, entry);
    this.updateAccess(key);
    
    console.log(`[SET] ${key} = ${value}${ttl ? ` (TTL: ${ttl}s)` : ''}`);
  }

  // Update access tracking
  updateAccess(key) {
    if (this.policy === 'lru') {
      // Remove from current position
      const idx = this.accessOrder.indexOf(key);
      if (idx > -1) this.accessOrder.splice(idx, 1);
      // Add to end (most recent)
      this.accessOrder.push(key);
    } else if (this.policy === 'lfu') {
      this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    }
  }

  // Evict based on policy
  evict() {
    let keyToEvict;
    
    if (this.policy === 'lru') {
      // Evict least recently used (first in order)
      keyToEvict = this.accessOrder[0];
      this.accessOrder.shift();
    } else if (this.policy === 'lfu') {
      // Evict least frequently used
      let minCount = Infinity;
      for (const [key, count] of this.accessCount) {
        if (count < minCount) {
          minCount = count;
          keyToEvict = key;
        }
      }
      this.accessCount.delete(keyToEvict);
    } else if (this.policy === 'fifo') {
      // Evict first in
      keyToEvict = this.cache.keys().next().value;
    }
    
    this.cache.delete(keyToEvict);
    console.log(`[EVICT] ${keyToEvict} (${this.policy})`);
  }

  // Delete from cache
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const idx = this.accessOrder.indexOf(key);
      if (idx > -1) this.accessOrder.splice(idx, 1);
      this.accessCount.delete(key);
      console.log(`[DELETE] ${key}`);
    }
    return deleted;
  }

  // Clear cache
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.accessOrder = [];
    this.accessCount.clear();
    console.log(`[CLEAR] Removed ${size} entries`);
  }

  // Get statistics
  stats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      policy: this.policy,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total * 100).toFixed(1) + '%' : '0%'
    };
  }

  // Warm up cache
  warmUp(data) {
    console.log(`[WARMUP] Loading ${data.length} entries`);
    for (const [key, value] of data) {
      this.set(key, value);
    }
  }
}

// Write-through cache
class WriteThroughCache extends CacheSystem {
  constructor(backend, maxSize) {
    super(maxSize);
    this.backend = backend; // Database or storage backend
  }

  get(key) {
    let value = super.get(key);
    
    if (value === null && this.backend) {
      // Cache miss - load from backend
      value = this.backend.get(key);
      if (value !== null) {
        this.set(key, value);
      }
    }
    
    return value;
  }

  set(key, value, ttl) {
    // Write to cache
    super.set(key, value, ttl);
    
    // Write to backend immediately
    if (this.backend) {
      this.backend.set(key, value);
    }
  }
}

// Demo
if (require.main === module) {
  console.log('=== Cache System Demo ===\n');
  
  const cache = new CacheSystem(3, 'lru');
  
  // Set values
  cache.set('user:1', 'Alice');
  cache.set('user:2', 'Bob');
  cache.set('user:3', 'Charlie');
  
  console.log();
  
  // Get values
  cache.get('user:1');
  cache.get('user:2');
  
  console.log();
  
  // Trigger eviction
  cache.set('user:4', 'Dave'); // Evicts user:3 (LRU)
  
  console.log();
  
  // Cache miss
  cache.get('user:3');
  
  console.log();
  
  // TTL
  cache.set('session:abc', 'token123', 2);
  cache.get('session:abc');
  
  console.log('\nStats:', cache.stats());
  
  // Write-through demo
  console.log('\n--- Write-Through Cache ---\n');
  
  const backend = new Map();
  backend.get = (k) => backend.has(k) ? backend.get(k) : null;
  backend.set = (k, v) => { backend.set(k, v); console.log(`[BACKEND] Wrote ${k}`); };
  
  const wtCache = new WriteThroughCache(backend, 5);
  wtCache.set('key1', 'value1');
  wtCache.get('key1');
}

module.exports = { CacheSystem, WriteThroughCache };
