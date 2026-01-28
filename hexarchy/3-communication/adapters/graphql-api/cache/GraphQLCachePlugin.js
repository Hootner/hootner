
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
/**
 * GraphQL Cache Middleware
 * Apollo Server plugin for caching GraphQL queries
 */

const GraphQLCacheService = require('./GraphQLCacheService')

class GraphQLCachePlugin {
  constructor(options = {}) {
    this.cache = new GraphQLCacheService(options)
    this.cacheableOperations = options.cacheableOperations || [
      'getUser',
      'getVideo',
      'getVideos',
      'getComments',
      'getTrendingVideos',
      'searchVideos',
      'getUserProfile',
      'getVideoStats',
    ]
    this.excludeFields = options.excludeFields || ['currentUser']
  }

  /**
   * Check if operation should be cached
   */
  shouldCacheOperation(operationName) {
    return this.cacheableOperations.includes(operationName)
  }

  /**
   * Check if operation is a mutation
   */
  isMutation(operation) {
    return operation.operation === 'mutation'
  }

  /**
   * Apollo Server plugin interface
   */
  plugin() {
    return {
      async requestDidStart(requestContext) {
        const { request, context } = requestContext
        const operationName = request.operationName

        // Skip caching for mutations
        if (!operationName || this.isMutation(requestContext.operation)) {
          return {
            async willSendResponse(responseContext) {
              // Invalidate cache on mutation
              if (responseContext.operation.operation === 'mutation') {
                await this.cache.invalidateOnMutation(
                  operationName,
                  request.variables,
                  responseContext.response.data
                )
              }
            },
          }
        }

        // Check if operation should be cached
        if (!this.shouldCacheOperation(operationName)) {
          return
        }

        // Generate cache key
        const cacheKey = this.cache.generateCacheKey(
          request.query,
          request.variables,
          context
        )

        return {
          async willSendResponse(responseContext) {
            const { response } = responseContext

            // Don't cache errors
            if (response.errors) {
              return
            }

            // Get type name from operation
            const typeName = this.extractTypeName(operationName)

            // Cache the response
            await this.cache.setByType(cacheKey, response.data, typeName)
          },
        }
      },
    }
  }

  /**
   * Express middleware for cache checking
   */
  middleware() {
    return async (req, res, next) => {
      // Only handle POST requests (GraphQL queries)
      if (req.method !== 'POST') {
        return next()
      }

      const { query, variables, operationName } = req.body

      // Skip if no operation name or is mutation with type checking
      if (
        !operationName ||
        typeof query !== 'string' ||
        query.trim().startsWith('mutation')
      ) {
        return next()
      }

      // Check if operation should be cached
      if (!this.shouldCacheOperation(operationName)) {
        return next()
      }

      // Generate cache key
      const cacheKey = this.cache.generateCacheKey(query, variables, req)

      // Try to get from cache
      const cached = await this.cache.get(cacheKey)

      if (cached) {
        // Return cached response
        return res.json({
          data: cached,
          extensions: {
            cached: true,
            cacheKey,
          },
        })
      }

      // Store original send function
      const originalSend = res.json.bind(res)

      // Override send to cache response
      res.json = async function (body) {
        // Only cache successful responses
        if (body.data && !body.errors) {
          const typeName = this.extractTypeName(operationName)
          await this.cache.setByType(cacheKey, body.data, typeName)
        }

        return originalSend(body)
      }.bind(this)

      next()
    }
  }

  /**
   * Extract type name from operation name
   */
  extractTypeName(operationName) {
    // Convert getUser -> User, getTrendingVideos -> Video, etc.
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
    }

    return typeMap[operationName] || 'Query'
  }

  /**
   * Get cache service instance
   */
  getCacheService() {
    return this.cache
  }
}

module.exports = GraphQLCachePlugin
