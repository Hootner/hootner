#!/usr/bin/env node

/**
 * Example: Using UnifiedCacheManager
 */

const { UnifiedCacheManager } = require('./index');
const express = require('express');

// Initialize unified cache manager
const cacheManager = new UnifiedCacheManager({
  cacheableOperations: [
    'getUser',
    'getVideo',
    'getTrendingVideos',
    'searchVideos',
  ],
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

// Express app
const app = express();
app.use(express.json());

// GraphQL caching middleware
app.use(
  '/graphql',
  cacheManager.graphqlMiddleware({
    excludeQueries: ['currentUser'],
  })
);

// Invalidation middleware
app.use('/graphql', cacheManager.invalidationMiddleware());

// Route caching
app.get('/api/trending', cacheManager.routeMiddleware(120), (req, res) => {
  res.json({
    videos: [
      { id: 1, title: 'Video 1', views: 1000 },
      { id: 2, title: 'Video 2', views: 2000 },
    ],
  });
});

// Cache statistics endpoint
app.get('/api/cache/stats', async (req, res) => {
  const stats = await cacheManager.getStats();
  res.json(stats);
});

// Clear cache endpoint (admin only)
app.post(
  '/api/cache/clear',
  // TODO: Add authentication middleware here
  // Example: authenticateAdmin,
  async (req, res) => {
    // Verify admin authorization
    if (!req.user || !req.user.isAdmin) {
      return res
        .status(403)
        .json({ error: 'Forbidden: Admin access required' });
    }

    await cacheManager.clearAll();
    res.json({
      message: 'Cache cleared',
      timestamp: new Date().toISOString(),
      clearedBy: req.user.id,
    });
  }
);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Cache stats: http://localhost:${PORT}/api/cache/stats`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await cacheManager.close();
  process.exit(0);
});
