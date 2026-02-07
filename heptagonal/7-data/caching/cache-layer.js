/**
 * Cache Layer Implementation
 * Multi-tier caching: Memory → Redis → Database
 */

import { createLogger } from '../../0-core/utils/logger.js';

const logger = createLogger('data', 'cache');

class CacheLayer {
  constructor(config = {}) {
    this.memoryCache = new Map();
    this.maxMemorySize = config.maxMemorySize || 1000;
    this.defaultTTL = config.defaultTTL || 300000; // 5 minutes
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  /**
   * Get value from cache (checks memory, then Redis, then DB)
   */
  async get(key, options = {}) {
    const { fetchFn, ttl = this.defaultTTL } = options;

    // Level 1: Memory cache
    const memoryValue = this._getFromMemory(key);
    if (memoryValue !== null) {
      this.stats.hits++;
      logger.debug('Cache hit (memory)', { key });
      return memoryValue;
    }

    // Level 2: Redis cache (would be implemented with actual Redis)
    const redisValue = await this._getFromRedis(key);
    if (redisValue !== null) {
      this.stats.hits++;
      logger.debug('Cache hit (redis)', { key });
      // Promote to memory cache
      this._setInMemory(key, redisValue, ttl);
      return redisValue;
    }

    // Level 3: Fetch from source if provided
    if (fetchFn) {
      this.stats.misses++;
      logger.debug('Cache miss, fetching', { key });
      
      const value = await fetchFn();
      await this.set(key, value, ttl);
      return value;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = this.defaultTTL) {
    this.stats.sets++;
    logger.debug('Setting cache', { key, ttl });

    // Set in memory
    this._setInMemory(key, value, ttl);

    // Set in Redis (would be implemented)
    await this._setInRedis(key, value, ttl);
  }

  /**
   * Invalidate cache key
   */
  async invalidate(key) {
    logger.debug('Invalidating cache', { key });
    
    // Remove from memory
    this.memoryCache.delete(key);

    // Remove from Redis (would be implemented)
    await this._deleteFromRedis(key);
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern) {
    logger.debug('Invalidating cache pattern', { pattern });
    
    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.invalidate(key);
    }
  }

  // Internal memory cache methods
  _getFromMemory(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.value;
  }

  _setInMemory(key, value, ttl) {
    // Evict if over size limit
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
      this.stats.evictions++;
    }

    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  // Redis methods (placeholders)
  async _getFromRedis(key) {
    // Would use actual Redis client
    return null;
  }

  async _setInRedis(key, value, ttl) {
    // Would use actual Redis client
  }

  async _deleteFromRedis(key) {
    // Would use actual Redis client
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    return {
      ...this.stats,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      memorySize: this.memoryCache.size
    };
  }

  /**
   * Clear all caches
   */
  async clear() {
    logger.info('Clearing all caches');
    this.memoryCache.clear();
    // Would clear Redis too
  }
}

export const cacheLayer = new CacheLayer();
export default cacheLayer;
