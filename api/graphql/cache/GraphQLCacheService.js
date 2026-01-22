/**
 * Redis Cache Service for GraphQL
 * Caching layer with TTL and invalidation strategies
 */

const Redis = require('ioredis');
const config = require('./shared/config');
const {
  generateCacheKey,
  calculateHitRate,
  extractKeyCount,
} = require('./shared/utils');

class GraphQLCacheService {
  constructor(options = {}) {
    // Merge with shared config
    const redisConfig = { ...config.redis, ...options.redis };

    this.redis = new Redis(redisConfig);

    // Default TTL values (in seconds)
    this.defaultTTL = options.defaultTTL || config.ttl.default;
    this.ttlByType = {
      ...config.ttl.byType,
      ...options.ttlByType,
    };

    // Cache invalidation patterns
    this.invalidationPatterns = {
      ...config.invalidation.patterns,
      ...options.invalidationPatterns,
    };

    this.setupEventListeners();
  }

  /**
   * Setup Redis event listeners
   */
  setupEventListeners() {
    this.redis.on('connect', () => {
      console.log('✓ Redis connected');
    });

    this.redis.on('error', (err) => {
      // Log error with context but don't expose sensitive info
      const errorInfo = {
        message: err.message || 'Unknown Redis error',
        code: err.code,
        syscall: err.syscall,
        timestamp: new Date().toISOString(),
      };
      console.error('Redis error:', errorInfo);
    });

    this.redis.on('ready', () => {
      console.log('✓ Redis ready');
    });

    this.redis.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });
  }

  /**
   * Generate cache key from GraphQL query and variables
   */
  generateCacheKey(query, variables = {}, context = {}) {
    return generateCacheKey(query, variables, context);
  }

  /**
   * Get cached result
   */
  async get(key) {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        try {
          // Safe JSON parsing with validation
          const parsed = JSON.parse(cached);
          // Validate parsed data is not malicious
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            console.log(`Cache HIT: ${key}`);
            return parsed;
          }
          console.warn(`Invalid cache data for key: ${key}`);
          return null;
        } catch (parseError) {
          console.error(`JSON parse error for key ${key}:`, parseError.message);
          // Delete corrupted cache entry
          await this.redis.del(key).catch(() => {});
          return null;
        }
      }
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache with TTL
   */
  async set(key, value, ttl = null) {
    try {
      const serialized = JSON.stringify(value);
      const cacheTTL = ttl || this.defaultTTL;

      await this.redis.setex(key, cacheTTL, serialized);
      console.log(`Cache SET: ${key} (TTL: ${cacheTTL}s)`);

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Set cache with type-based TTL
   */
  async setByType(key, value, typeName) {
    const ttl = this.ttlByType[typeName] || this.defaultTTL;
    return this.set(key, value, ttl);
  }

  /**
   * Delete cache key
   */
  async del(key) {
    try {
      await this.redis.del(key);
      console.log(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      }
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by resource type and ID
   */
  async invalidate(typeName, id = null) {
    try {
      const patterns = this.invalidationPatterns[typeName] || [`${typeName}:*`];
      let totalDeleted = 0;

      for (const pattern of patterns) {
        const searchPattern = id ? pattern.replace('*', `${id}*`) : pattern;

        const deleted = await this.delPattern(searchPattern);
        totalDeleted += deleted;
      }

      console.log(
        `Invalidated ${totalDeleted} cache entries for ${typeName}${id ? `:${id}` : ''}`
      );
      return totalDeleted;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Invalidate all caches for a user
   */
  async invalidateUser(userId) {
    const patterns = [
      `query:${userId}:*`,
      `User:${userId}*`,
      `UserProfile:${userId}*`,
      `UserVideos:${userId}*`,
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.delPattern(pattern);
    }

    console.log(`Invalidated ${totalDeleted} cache entries for user ${userId}`);
    return totalDeleted;
  }

  /**
   * Invalidate cache on mutation
   */
  async invalidateOnMutation(mutationName, args, result) {
    const invalidationMap = {
      createVideo: () => this.invalidate('Video'),
      updateVideo: () => this.invalidate('Video', args.id),
      deleteVideo: () => this.invalidate('Video', args.id),
      createComment: () => {
        this.invalidate('Comment');
        this.invalidate('Video', args.videoId);
      },
      updateComment: () => this.invalidate('Comment', args.id),
      deleteComment: () => this.invalidate('Comment', args.id),
      updateUser: () => this.invalidateUser(args.id),
      subscribe: () => this.invalidateUser(args.userId),
      unsubscribe: () => this.invalidateUser(args.userId),
    };

    const invalidationFn = invalidationMap[mutationName];
    if (invalidationFn) {
      await invalidationFn();
    }
  }

  /**
   * Warm cache with popular queries
   */
  async warmCache(queries) {
    console.log(`Warming cache with ${queries.length} queries...`);

    for (const { query, variables, execute } of queries) {
      const key = this.generateCacheKey(query, variables);
      const cached = await this.get(key);

      if (!cached) {
        const queryResult = await execute();
        await this.set(key, queryResult);
      }
    }

    console.log('Cache warming complete');
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const info = await this.redis.info('stats');
      const keyspace = await this.redis.info('keyspace');
      const memory = await this.redis.info('memory');

      // Parse info strings
      const parseInfoLocal = (str) => {
        const lines = str.split('\r\n');
        const stats = {};
        lines.forEach((line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
            stats[sanitizedKey] = value;
          }
        });
        return stats;
      };

      const statsInfo = parseInfoLocal(info);
      const keyspaceInfo = parseInfoLocal(keyspace);
      const memoryInfo = parseInfoLocal(memory);

      return {
        hits: parseInt(statsInfo.keyspace_hits) || 0,
        misses: parseInt(statsInfo.keyspace_misses) || 0,
        hitRate: this.calculateHitRate(statsInfo),
        keys: await this.extractKeyCount(keyspaceInfo),
        memory: memoryInfo.used_memory_human,
        evictions: parseInt(statsInfo.evicted_keys) || 0,
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate(stats) {
    const hits = parseInt(stats.keyspace_hits) || 0;
    const misses = parseInt(stats.keyspace_misses) || 0;
    return calculateHitRate(hits, misses);
  }

  /**
   * Extract key count from keyspace info
   */
  async extractKeyCount(keyspace) {
    return extractKeyCount(keyspace);
  }

  /**
   * Set cache with tags for group invalidation
   */
  async setWithTags(key, value, tags = [], ttl = null) {
    try {
      // Store the value
      await this.set(key, value, ttl);

      // Associate tags
      for (const tag of tags) {
        await this.redis.sadd(`tag:${tag}`, key);
      }

      return true;
    } catch (error) {
      console.error('Cache set with tags error:', error);
      return false;
    }
  }

  /**
   * Invalidate by tag
   */
  async invalidateByTag(tag) {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(`tag:${tag}`);
        console.log(`Invalidated ${keys.length} keys for tag: ${tag}`);
      }

      return keys.length;
    } catch (error) {
      console.error('Cache invalidate by tag error:', error);
      return 0;
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget(keys) {
    try {
      const values = await this.redis.mget(...keys);
      return values.map((v, i) => {
        if (!v) return { key: keys[i], value: null };

        try {
          const parsed = JSON.parse(v);
          // Validate parsed data
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return { key: keys[i], value: parsed };
          }
          return { key: keys[i], value: null };
        } catch (parseError) {
          console.error(
            `JSON parse error for key ${keys[i]}:`,
            parseError.message
          );
          return { key: keys[i], value: null };
        }
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map((key) => ({ key, value: null }));
    }
  }

  /**
   * Batch set multiple keys
   */
  async mset(entries, ttl = null) {
    try {
      const pipeline = this.redis.pipeline();

      for (const { key, value } of entries) {
        const serialized = JSON.stringify(value);
        const cacheTTL = ttl || this.defaultTTL;
        pipeline.setex(key, cacheTTL, serialized);
      }

      await pipeline.exec();
      console.log(`Cache MSET: ${entries.length} keys`);
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    await this.redis.quit();
    console.log('Redis connection closed');
  }
}

module.exports = GraphQLCacheService;
