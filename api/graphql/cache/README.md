# GraphQL Redis Caching Layer

Comprehensive caching solution for GraphQL queries with TTL, invalidation strategies, and performance optimization.

## Features

✅ **Smart Caching**

- Automatic query caching
- Type-based TTL configuration
- User-specific cache keys
- Mutation-triggered invalidation

✅ **Cache Strategies**

- Cache-aside pattern
- Tag-based invalidation
- Pattern-based invalidation
- Batch operations

✅ **Performance**

- Configurable TTL per type
- Cache warming
- Batch get/set operations
- Redis pipeline support

✅ **Monitoring**

- Hit/miss tracking
- Cache statistics
- Memory usage monitoring
- Eviction tracking

## Architecture

```
cache/
├── GraphQLCacheService.js    # Core caching service
├── GraphQLCachePlugin.js     # Apollo Server plugin
├── CacheMiddleware.js         # Express middleware
└── README.md                  # Documentation
```

## Installation

```bash
npm install ioredis
```

## Configuration

### Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Initialize Cache Service

```javascript
const GraphQLCacheService = require("./cache/GraphQLCacheService");

const cache = new GraphQLCacheService({
  host: "localhost",
  port: 6379,
  defaultTTL: 300, // 5 minutes
  ttlByType: {
    User: 600, // 10 minutes
    Video: 300, // 5 minutes
    Comment: 180, // 3 minutes
    VideoStats: 60, // 1 minute
    TrendingVideos: 120, // 2 minutes
  },
});
```

## Usage

### Apollo Server Integration

```javascript
const { ApolloServer } = require("apollo-server-express");
const GraphQLCachePlugin = require("./cache/GraphQLCachePlugin");

const cachePlugin = new GraphQLCachePlugin({
  cacheableOperations: [
    "getUser",
    "getVideo",
    "getTrendingVideos",
    "searchVideos",
  ],
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [cachePlugin.plugin()],
  context: ({ req }) => ({
    user: req.user,
  }),
});
```

### Express Middleware

```javascript
const express = require("express");
const CacheMiddleware = require("./cache/CacheMiddleware");

const app = express();
const cacheMiddleware = new CacheMiddleware();

// Cache GraphQL queries
app.use(
  "/graphql",
  cacheMiddleware.cacheGraphQL({
    excludeQueries: ["getCurrentUser"],
  })
);

// Invalidate on mutations
app.use("/graphql", cacheMiddleware.invalidateOnMutation());

// Cache REST routes
app.get("/api/trending", cacheMiddleware.cacheRoute(120), (req, res) => {
  // Handler
});
```

### Manual Caching

```javascript
const cache = require("./cache/GraphQLCacheService");

// Cache a query result
await cache.set("video:123", videoData, 300);

// Get cached result
const cached = await cache.get("video:123");

// Set with type-based TTL
await cache.setByType("video:123", videoData, "Video");

// Delete cache
await cache.del("video:123");

// Invalidate by pattern
await cache.delPattern("video:*");

// Invalidate by type
await cache.invalidate("Video", "123");
```

## TTL Configuration

### Default TTLs by Type

| Type           | TTL    | Use Case        |
| -------------- | ------ | --------------- |
| User           | 10 min | User profiles   |
| Video          | 5 min  | Video metadata  |
| Comment        | 3 min  | Comments        |
| VideoStats     | 1 min  | Real-time stats |
| TrendingVideos | 2 min  | Trending lists  |
| SearchResults  | 5 min  | Search results  |

### Custom TTL

```javascript
// Set with custom TTL
await cache.set("key", value, 600); // 10 minutes

// Set without TTL (persist)
await cache.redis.set("key", JSON.stringify(value));
```

## Invalidation Strategies

### 1. Type-Based Invalidation

```javascript
// Invalidate all Video caches
await cache.invalidate("Video");

// Invalidate specific video
await cache.invalidate("Video", "123");
```

### 2. Pattern-Based Invalidation

```javascript
// Invalidate all user-related caches
await cache.delPattern("User:*");

// Invalidate specific user queries
await cache.delPattern("query:user123:*");
```

### 3. Mutation-Triggered Invalidation

```javascript
// Automatically invalidates related caches
await cache.invalidateOnMutation("updateVideo", {
  id: "123",
  title: "New Title",
});
```

### 4. User-Specific Invalidation

```javascript
// Invalidate all caches for a user
await cache.invalidateUser("user123");
```

### 5. Tag-Based Invalidation

```javascript
// Set with tags
await cache.setWithTags("video:123", videoData, [
  "video",
  "trending",
  "featured",
]);

// Invalidate by tag
await cache.invalidateByTag("trending");
```

## Cache Warming

```javascript
// Warm cache with popular queries
await cache.warmCache([
  {
    query: GET_TRENDING_VIDEOS,
    variables: {},
    execute: () => getTrendingVideos(),
  },
  {
    query: GET_POPULAR_USERS,
    variables: {},
    execute: () => getPopularUsers(),
  },
]);
```

## Batch Operations

### Batch Get

```javascript
const keys = ["video:1", "video:2", "video:3"];
const results = await cache.mget(keys);

// Results: [{ key: 'video:1', value: {...} }, ...]
```

### Batch Set

```javascript
const entries = [
  { key: "video:1", value: videoData1 },
  { key: "video:2", value: videoData2 },
  { key: "video:3", value: videoData3 },
];

await cache.mset(entries, 300);
```

## Cache Statistics

```javascript
const stats = await cache.getStats();

console.log(stats);
// {
//   hits: 1250,
//   misses: 350,
//   hitRate: '78.13%',
//   keys: 1500,
//   memory: '45.2MB',
//   evictions: 23
// }
```

## Resolver-Level Caching

```javascript
const resolvers = {
  Query: {
    getVideo: async (parent, { id }, context) => {
      const cacheKey = `video:${id}`;

      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      // Fetch from database
      const video = await Video.findById(id);

      // Cache result
      await cache.setByType(cacheKey, video, "Video");

      return video;
    },

    getTrendingVideos: async (parent, args, context) => {
      const cacheKey = "trending:videos";

      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const videos = await Video.find().sort({ views: -1 }).limit(10);

      await cache.setByType(cacheKey, videos, "TrendingVideos");

      return videos;
    },
  },

  Mutation: {
    updateVideo: async (parent, { id, input }, context) => {
      const video = await Video.findByIdAndUpdate(id, input, { new: true });

      // Invalidate related caches
      await cache.invalidate("Video", id);

      return video;
    },
  },
};
```

## Invalidation Patterns

```javascript
const invalidationPatterns = {
  User: ["User:*", "UserProfile:*", "UserVideos:*"],
  Video: ["Video:*", "VideoList:*", "TrendingVideos:*", "SearchResults:*"],
  Comment: ["Comment:*", "VideoComments:*"],
  Subscription: ["User:*:subscription", "SubscriptionStats:*"],
};
```

## Best Practices

### 1. Cache Queries, Not Mutations

```javascript
// ✅ Good - Cache query
const videos = await cache.getOrSet("videos:all", () => Video.find());

// ❌ Bad - Don't cache mutations
const video = await Video.create(data); // Never cache this
```

### 2. Use Type-Based TTLs

```javascript
// ✅ Good - Different TTLs for different types
await cache.setByType("user:123", user, "User"); // 10 min
await cache.setByType("stats:123", stats, "VideoStats"); // 1 min
```

### 3. Invalidate on Mutations

```javascript
// ✅ Good - Invalidate after mutation
await Video.update(id, data);
await cache.invalidate("Video", id);
```

### 4. Use Patterns for Related Data

```javascript
// ✅ Good - Invalidate all related caches
await cache.delPattern(`video:${videoId}:*`);
```

### 5. Handle Cache Failures Gracefully

```javascript
// ✅ Good - Fallback on cache failure
const cached = await cache.get(key).catch(() => null);
if (cached) return cached;

const data = await fetchFromDB();
await cache.set(key, data).catch(console.error);
return data;
```

## Monitoring

### Redis Info

```bash
# Connect to Redis
redis-cli

# Get cache info
INFO stats
INFO keyspace
INFO memory

# Monitor real-time commands
MONITOR

# Check keys
KEYS graphql:*

# Get key TTL
TTL graphql:video:123
```

### Application Metrics

```javascript
// Track cache hit rate
app.get("/api/cache/stats", async (req, res) => {
  const stats = await cache.getStats();
  res.json(stats);
});

// Clear cache (admin only)
app.post("/api/cache/clear", async (req, res) => {
  await cache.clearAll();
  res.json({ message: "Cache cleared" });
});
```

## Performance Tips

1. **Batch operations** - Use `mget`/`mset` for multiple keys
2. **Pipeline commands** - Group Redis commands together
3. **Appropriate TTLs** - Shorter for dynamic data, longer for static
4. **Selective caching** - Don't cache everything
5. **Monitor hit rate** - Aim for >70% hit rate
6. **Use Redis persistence** - Enable AOF for durability
7. **Cache warming** - Preload popular data
8. **Lazy loading** - Cache-aside pattern

## Troubleshooting

### High Cache Misses

- Check TTL values (may be too short)
- Verify cache keys are consistent
- Ensure cache warming is working

### Memory Issues

- Increase `maxmemory` in Redis config
- Use `allkeys-lru` eviction policy
- Reduce TTL values
- Clear unused caches

### Stale Data

- Ensure invalidation is triggered
- Check invalidation patterns
- Verify mutation hooks

## Production Checklist

- [ ] Configure Redis persistence (AOF/RDB)
- [ ] Set appropriate maxmemory
- [ ] Enable Redis password authentication
- [ ] Monitor cache hit rate (>70%)
- [ ] Set up alerts for Redis downtime
- [ ] Configure Redis replication
- [ ] Test cache warming on startup
- [ ] Verify invalidation patterns
- [ ] Document custom TTL values
- [ ] Set up Redis monitoring (Prometheus)

## Next Steps

1. Add Redis Sentinel for high availability
2. Implement Redis Cluster for horizontal scaling
3. Add cache compression for large objects
4. Implement cache preloading strategies
5. Add A/B testing with cache variations
6. Monitor cache performance with APM
7. Implement cache versioning
8. Add distributed tracing
