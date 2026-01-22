/**
 * Shared Cache Utilities
 * Common functions used across cache implementations
 */

const crypto = require('crypto');

/**
 * Generate cache key from GraphQL query and variables
 */
function generateCacheKey(query, variables = {}, context = {}) {
  const userId = context.user?.id || 'anonymous';
  const sanitizedUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const queryHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ query, variables }))
    .digest('hex')
    .substring(0, 16);

  return `query:${sanitizedUserId}:${queryHash}`;
}

/**
 * Parse Redis INFO command output
 */
function parseInfo(infoString) {
  const lines = infoString.split('\r\n');
  const stats = {};

  lines.forEach((line) => {
    const [key, value] = line.split(':');
    if (key && value) {
      stats[key] = value;
    }
  });

  return stats;
}

/**
 * Extract type name from GraphQL operation name
 */
function extractTypeName(operationName) {
  const typeMap = {
    getUser: 'User',
    getUserProfile: 'User',
    getUserVideos: 'Video',
    getVideo: 'Video',
    getVideos: 'Video',
    getTrendingVideos: 'Video',
    searchVideos: 'Video',
    getComments: 'Comment',
    getVideoComments: 'Comment',
    getVideoStats: 'VideoStats',
  };

  return typeMap[operationName] || 'Query';
}

/**
 * Calculate cache hit rate
 */
function calculateHitRate(hits, misses) {
  const total = hits + misses;
  if (total === 0) return 0;
  return ((hits / total) * 100).toFixed(2);
}

/**
 * Extract key count from Redis keyspace info
 */
function extractKeyCount(keyspaceInfo) {
  const db0Info = keyspaceInfo.db0;
  if (!db0Info) return 0;

  const match = db0Info.match(/keys=(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Check if operation is a GraphQL mutation
 */
function isMutation(query) {
  if (!query) return false;
  return query.trim().startsWith('mutation');
}

/**
 * Check if operation is cacheable
 */
function isCacheable(operationName, cacheableOperations) {
  return cacheableOperations.includes(operationName);
}

/**
 * Generate tag-based cache keys
 */
function generateTaggedKeys(tags) {
  return tags.map((tag) => `tag:${tag}`);
}

/**
 * Sanitize cache key to prevent injection
 */
function sanitizeCacheKey(key) {
  return key.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

/**
 * Create Redis pipeline for batch operations
 */
function createPipeline(redis, operations) {
  const pipeline = redis.pipeline();

  operations.forEach(({ command, args }) => {
    if (typeof pipeline[command] === 'function') {
      pipeline[command](...args);
    }
  });

  return pipeline;
}

module.exports = {
  generateCacheKey,
  parseInfo,
  extractTypeName,
  calculateHitRate,
  extractKeyCount,
  isMutation,
  isCacheable,
  generateTaggedKeys,
  sanitizeCacheKey,
  createPipeline,
};
