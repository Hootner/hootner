/**
 * Unified Cache Configuration
 * Environment-aware configuration for Redis and caching strategies
 */

const baseConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'graphql:',
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  },

  ttl: {
    default: 300, // 5 minutes
    byType: {
      User: 600, // 10 minutes
      Video: 300, // 5 minutes
      Comment: 180, // 3 minutes
      VideoStats: 60, // 1 minute
      TrendingVideos: 120, // 2 minutes
      SearchResults: 300, // 5 minutes
    },
  },

  invalidation: {
    patterns: {
      User: ['User:*', 'UserProfile:*', 'UserVideos:*'],
      Video: ['Video:*', 'VideoList:*', 'TrendingVideos:*', 'SearchResults:*'],
      Comment: ['Comment:*', 'VideoComments:*'],
      Subscription: ['User:*:subscription', 'SubscriptionStats:*'],
    },

    mutationMap: {
      createVideo: 'Video',
      updateVideo: 'Video',
      deleteVideo: 'Video',
      createComment: 'Comment',
      updateComment: 'Comment',
      deleteComment: 'Comment',
      updateUser: 'User',
      subscribe: 'User',
      unsubscribe: 'User',
    },
  },

  operations: {
    cacheable: [
      'getUser',
      'getVideo',
      'getVideos',
      'getComments',
      'getTrendingVideos',
      'searchVideos',
      'getUserProfile',
      'getVideoStats',
    ],
    excludeFields: ['currentUser'],
  },
};

const developmentConfig = {
  ...baseConfig,
  redis: {
    ...baseConfig.redis,
    db: 0,
  },
  ttl: {
    ...baseConfig.ttl,
    default: 60, // Shorter TTL in dev
  },
};

const productionConfig = {
  ...baseConfig,
  redis: {
    ...baseConfig.redis,
    db: 1,
    password: process.env.REDIS_PASSWORD,
  },
  ttl: {
    ...baseConfig.ttl,
    default: 600, // Longer TTL in production
  },
};

const testConfig = {
  ...baseConfig,
  redis: {
    ...baseConfig.redis,
    db: 15, // Separate DB for tests
  },
  ttl: {
    ...baseConfig.ttl,
    default: 10, // Very short TTL for tests
  },
};

const configs = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig,
};

const env = process.env.NODE_ENV || 'development';

module.exports = configs[env] || developmentConfig;
