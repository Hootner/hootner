/**
 * Cache Middleware for Express/GraphQL
 * Request-level caching with Redis
 */

const GraphQLCacheService = require('./GraphQLCacheService')

class CacheMiddleware {
  constructor(options = {}) {
    this.cache = new GraphQLCacheService(options)
  }

  /**
   * Cache GraphQL queries
   */
  cacheGraphQL(options = {}) {
    const { excludeQueries = [], includeQueries = [] } = options

    return async (req, res, next) => {
      // Only cache POST requests
      if (req.method !== 'POST') {
        return next()
      }

      const { query, variables, operationName } = req.body

      // Skip mutations
      if (!query || query.trim().startsWith('mutation')) {
        return next()
      }

      // Check exclusion/inclusion lists
      if (excludeQueries.length > 0 && excludeQueries.includes(operationName)) {
        return next()
      }

      if (includeQueries.length > 0 && !includeQueries.includes(operationName)) {
        return next()
      }

      // Generate cache key
      const cacheKey = this.cache.generateCacheKey(query, variables, {
        user: req.user,
      })

      // Try to get from cache
      const cached = await this.cache.get(cacheKey)

      if (cached) {
        return res.json({
          data: cached,
          extensions: {
            fromCache: true,
            cacheKey,
          },
        })
      }

      // Capture response
      const originalJson = res.json.bind(res)

      res.json = function (body) {
        // Cache successful responses
        if (body.data && !body.errors) {
          setImmediate(async () => {
            await this.cache.set(cacheKey, body.data)
          })
        }

        return originalJson(body)
      }.bind(this)

      next()
    }
  }

  /**
   * Cache API responses by route
   */
  cacheRoute(ttl = 300) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next()
      }

      const cacheKey = `route:${req.originalUrl}`

      // Try to get from cache
      const cached = await this.cache.get(cacheKey)

      if (cached) {
        return res.json(cached)
      }

      // Capture response
      const originalJson = res.json.bind(res)

      res.json = function (body) {
        // Cache response
        setImmediate(async () => {
          await this.cache.set(cacheKey, body, ttl)
        })

        return originalJson(body)
      }.bind(this)

      next()
    }
  }

  /**
   * Cache invalidation middleware
   */
  invalidateOnMutation() {
    return async (req, res, next) => {
      const { operationName, variables } = req.body

      // Only handle mutations
      if (!operationName || !req.body.query?.trim().startsWith('mutation')) {
        return next()
      }

      // Capture response
      const originalJson = res.json.bind(res)

      res.json = function (body) {
        // Invalidate cache after mutation
        setImmediate(async () => {
          await this.cache.invalidateOnMutation(operationName, variables, body.data)
        })

        return originalJson(body)
      }.bind(this)

      next()
    }
  }

  /**
   * Get cache instance
   */
  getCacheService() {
    return this.cache
  }
}

module.exports = CacheMiddleware
