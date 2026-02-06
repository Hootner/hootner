/**
 * Unified Cache Manager
 * Consolidates Apollo Server plugin and Express middleware functionality
 */

const GraphQLCacheService = require('./GraphQLCacheService');
const config = require('./shared/config');
const { extractTypeName, isMutation, isCacheable } = require('./shared/utils');

class UnifiedCacheManager {
  constructor(options = {}) {
    // Initialize cache service with merged config
    this.cache = new GraphQLCacheService({
      ...config,
      ...options,
    });

    // Merge operation configuration
    this.config = {
      cacheableOperations: options.cacheableOperations || config.operations.cacheable,
      excludeFields: options.excludeFields || config.operations.excludeFields,
      excludeQueries: options.excludeQueries || [],
      includeQueries: options.includeQueries || [],
    };
  }

  /**
   * Apollo Server plugin interface
   */
  apolloPlugin() {
    const cache = this.cache;
    const shouldCacheOperation = this.shouldCacheOperation.bind(this);

    return {
      async requestDidStart(requestContext) {
        const { request, context } = requestContext;
        const operationName = request.operationName;

        // Skip caching for mutations
        if (!operationName || requestContext.operation?.operation === 'mutation') {
          return {
            async willSendResponse(responseContext) {
              // Invalidate cache on mutation
              if (responseContext.operation?.operation === 'mutation') {
                await cache.invalidateOnMutation(
                  operationName,
                  request.variables,
                  responseContext.response.data
                );
              }
            },
          };
        }

        // Check if operation should be cached
        if (!shouldCacheOperation(operationName)) {
          return;
        }

        // Generate cache key
        const cacheKey = cache.generateCacheKey(
          request.query,
          request.variables,
          context
        );

        // Try to get from cache
        const cached = await cache.get(cacheKey);
        if (cached) {
          // Return cached response
          return {
            async executionDidStart() {
              return {
                async executionDidEnd() {
                  requestContext.response = {
                    data: cached,
                    extensions: {
                      fromCache: true,
                      cacheKey,
                    },
                  };
                },
              };
            },
          };
        }

        return {
          async willSendResponse(responseContext) {
            const { response } = responseContext;

            // Don't cache errors
            if (response.errors) {
              return;
            }

            // Get type name from operation
            const typeName = extractTypeName(operationName);

            // Cache the response
            await cache.setByType(cacheKey, response.data, typeName);
          },
        };
      },
    };
  }

  /**
   * Express middleware for GraphQL caching
   */
  graphqlMiddleware(options = {}) {
    const cache = this.cache;
    const mergedOptions = { ...this.config, ...options };

    return async (req, res, next) => {
      // Only cache POST requests
      if (req.method !== 'POST') {
        return next();
      }

      const { query, variables, operationName } = req.body;

      // Skip mutations
      if (!query || isMutation(query)) {
        return next();
      }

      // Check exclusion/inclusion lists
      if (
        mergedOptions.excludeQueries.length > 0 &&
        mergedOptions.excludeQueries.includes(operationName)
      ) {
        return next();
      }

      if (
        mergedOptions.includeQueries.length > 0 &&
        !mergedOptions.includeQueries.includes(operationName)
      ) {
        return next();
      }

      // Check if operation is cacheable
      if (!isCacheable(operationName, mergedOptions.cacheableOperations)) {
        return next();
      }

      // Generate cache key
      const cacheKey = cache.generateCacheKey(query, variables, {
        user: req.user,
      });

      // Try to get from cache
      const cached = await cache.get(cacheKey);

      if (cached) {
        return res.json({
          data: cached,
          extensions: {
            fromCache: true,
            cacheKey,
          },
        });
      }

      // Capture response
      const originalJson = res.json.bind(res);

      res.json = function (body) {
        // Cache successful responses
        if (body.data && !body.errors) {
          setImmediate(async () => {
            const typeName = extractTypeName(operationName);
            await cache.setByType(cacheKey, body.data, typeName);
          });
        }

        return originalJson(body);
      }.bind(this);

      next();
    };
  }

  /**
   * Express middleware for route caching
   */
  routeMiddleware(ttl = 300) {
    const cache = this.cache;

    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = `route:${req.originalUrl}`;

      // Try to get from cache
      const cached = await cache.get(cacheKey);

      if (cached) {
        res.set('X-Cache-Status', 'HIT');
        return res.json(cached);
      }

      // Capture response
      const originalJson = res.json.bind(res);

      res.json = function (body) {
        // Cache response
        setImmediate(async () => {
          await cache.set(cacheKey, body, ttl);
        });

        res.set('X-Cache-Status', 'MISS');
        return originalJson(body);
      }.bind(this);

      next();
    };
  }

  /**
   * Cache invalidation middleware
   */
  invalidationMiddleware() {
    const cache = this.cache;

    return async (req, res, next) => {
      const { operationName, variables } = req.body;

      // Only handle mutations
      if (!operationName || !isMutation(req.body.query)) {
        return next();
      }

      // Capture response
      const originalJson = res.json.bind(res);

      res.json = function (body) {
        // Invalidate cache after mutation
        setImmediate(async () => {
          await cache.invalidateOnMutation(operationName, variables, body.data);
        });

        return originalJson(body);
      }.bind(this);

      next();
    };
  }

  /**
   * Check if operation should be cached
   */
  shouldCacheOperation(operationName) {
    return this.config.cacheableOperations.includes(operationName);
  }

  /**
   * Get cache service instance
   */
  getCacheService() {
    return this.cache;
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    return this.cache.getStats();
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    return this.cache.clearAll();
  }

  /**
   * Warm cache with popular queries
   */
  async warmCache(queries) {
    return this.cache.warmCache(queries);
  }

  /**
   * Close cache connection
   */
  async close() {
    return this.cache.close();
  }
}

module.exports = UnifiedCacheManager;
