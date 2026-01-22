/**
 * Cache Module Exports
 * Unified entry point for all caching functionality
 */

const UnifiedCacheManager = require('./UnifiedCacheManager');
const GraphQLCacheService = require('./GraphQLCacheService');
const config = require('./shared/config');
const utils = require('./shared/utils');
const constants = require('./shared/constants');

// Legacy exports for backwards compatibility
const GraphQLCachePlugin = require('./GraphQLCachePlugin');
const CacheMiddleware = require('./CacheMiddleware');

module.exports = {
  // Recommended: Use unified manager
  UnifiedCacheManager,

  // Direct access to services
  GraphQLCacheService,

  // Legacy support (deprecated, use UnifiedCacheManager)
  GraphQLCachePlugin,
  CacheMiddleware,

  // Shared utilities
  config,
  utils,
  constants,

  // Convenience factory
  createCacheManager: (options) => new UnifiedCacheManager(options),
};
