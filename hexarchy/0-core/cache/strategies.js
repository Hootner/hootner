// Cache Strategies
import { redisClient } from '../database/redis/config.js';

// TTL configurations (in seconds)
export const TTL = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 1800,          // 30 minutes
  HOUR: 3600,          // 1 hour
  DAY: 86400,          // 24 hours
  WEEK: 604800,        // 7 days
  MONTH: 2592000       // 30 days
};

// Cache-aside pattern
export const cacheAside = async (key, fetchFn, ttl = TTL.MEDIUM) => {
  try {
    // Try to get from cache
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from source
    const data = await fetchFn();
    
    // Store in cache
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Cache-aside error:', error);
    return fetchFn(); // Fallback to source
  }
};

// Write-through pattern
export const writeThrough = async (key, data, writeFn, ttl = TTL.MEDIUM) => {
  try {
    // Write to source
    await writeFn(data);
    
    // Write to cache
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Write-through error:', error);
    throw error;
  }
};

// Write-behind pattern (async write)
export const writeBehind = async (key, data, writeFn, ttl = TTL.MEDIUM) => {
  try {
    // Write to cache immediately
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    
    // Queue write to source
    setImmediate(async () => {
      try {
        await writeFn(data);
      } catch (error) {
        console.error('Write-behind error:', error);
      }
    });
    
    return data;
  } catch (error) {
    console.error('Write-behind error:', error);
    throw error;
  }
};

// Cache invalidation
export const invalidate = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

// Cache warming (preload hot data)
export const warmCache = async (entries) => {
  try {
    const pipeline = redisClient.multi();
    entries.forEach(({ key, value, ttl = TTL.HOUR }) => {
      pipeline.setEx(key, ttl, JSON.stringify(value));
    });
    await pipeline.exec();
    console.log(`🔥 Warmed ${entries.length} cache entries`);
  } catch (error) {
    console.error('Cache warming error:', error);
  }
};

export default { TTL, cacheAside, writeThrough, writeBehind, invalidate, warmCache };
