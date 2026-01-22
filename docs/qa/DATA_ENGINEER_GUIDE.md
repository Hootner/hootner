# Data Engineer Onboarding Guide

## Welcome to HOOTNER Data Team

This guide will help you get up to speed with our data infrastructure, analytics systems, and optimization procedures.

## Day 1: Environment Setup

### Access & Credentials
- [ ] MongoDB Atlas access
- [ ] Redis Cloud access
- [ ] AWS S3 access
- [ ] Grafana/Prometheus access
- [ ] GitHub repository access
- [ ] Slack channels: #data-team, #alerts

### Local Development
```bash
# Clone repository
git clone https://github.com/hootner/enterprise-platform.git
cd enterprise-platform

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Verify connections
npm run db:test
npm run redis:test
```

### Database Connections
```javascript
// MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hootner';

// Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
};
```

## Data Architecture Overview

### Database Schema

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (indexed, unique),
  name: String,
  passwordHash: String,
  createdAt: Date (indexed),
  lastLoginAt: Date,
  subscription: {
    plan: String,
    status: String,
    startDate: Date,
    endDate: Date
  },
  preferences: Object,
  deleted: Boolean (indexed)
}
```

#### Videos Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  title: String (text indexed),
  description: String (text indexed),
  fileSize: Number,
  duration: Number,
  resolution: String,
  format: String,
  s3Key: String,
  thumbnailUrl: String,
  views: Number (indexed),
  likes: Number,
  createdAt: Date (indexed),
  updatedAt: Date,
  deleted: Boolean (indexed),
  tags: [String] (indexed)
}
```

#### Activity Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  action: String (indexed),
  resource: String,
  metadata: Object,
  timestamp: Date (indexed, TTL: 90 days),
  ipAddress: String,
  userAgent: String
}
```

#### Payments Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  stripePaymentId: String (indexed, unique),
  amount: Number,
  currency: String,
  status: String (indexed),
  createdAt: Date (indexed),
  metadata: Object
}
```

### Indexes

#### Current Indexes
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ deleted: 1 });

// Videos
db.videos.createIndex({ userId: 1, createdAt: -1 });
db.videos.createIndex({ views: -1 });
db.videos.createIndex({ tags: 1 });
db.videos.createIndex({ title: "text", description: "text" });
db.videos.createIndex({ deleted: 1 });

// Activity Logs
db.activity_logs.createIndex({ userId: 1, timestamp: -1 });
db.activity_logs.createIndex({ action: 1, timestamp: -1 });
db.activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Payments
db.payments.createIndex({ userId: 1, createdAt: -1 });
db.payments.createIndex({ stripePaymentId: 1 }, { unique: true });
db.payments.createIndex({ status: 1, createdAt: -1 });
```

### Redis Cache Strategy

#### Cache Keys
```
user:{userId}                    # User profile (TTL: 1 hour)
video:{videoId}                  # Video metadata (TTL: 1 hour)
videos:trending                  # Trending videos (TTL: 15 min)
videos:user:{userId}             # User's videos (TTL: 30 min)
session:{sessionId}              # User session (TTL: 24 hours)
api_requests:{timestamp}         # API metrics (TTL: 5 min)
```

#### Cache Patterns
```javascript
// Read-through cache
async function getVideo(videoId) {
  const cacheKey = `video:${videoId}`;
  
  // Try cache first
  let video = await redis.get(cacheKey);
  if (video) return JSON.parse(video);
  
  // Cache miss - fetch from DB
  video = await db.collection('videos').findOne({ _id: videoId });
  
  // Store in cache
  await redis.setex(cacheKey, 3600, JSON.stringify(video));
  
  return video;
}

// Write-through cache
async function updateVideo(videoId, updates) {
  // Update database
  await db.collection('videos').updateOne(
    { _id: videoId },
    { $set: updates }
  );
  
  // Invalidate cache
  await redis.del(`video:${videoId}`);
}
```

## Database Optimization

### Query Optimization Checklist
- [ ] All queries use appropriate indexes
- [ ] No full collection scans
- [ ] Projection used to limit fields
- [ ] Aggregation pipelines optimized
- [ ] Connection pooling configured

### Performance Monitoring
```bash
# Enable profiling
db.setProfilingLevel(1, { slowms: 100 });

# View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10);

# Explain query
db.videos.find({ userId: "123" }).explain("executionStats");
```

### Optimization Scripts
```javascript
// Analyze collection stats
db.videos.stats();

// Find missing indexes
db.videos.aggregate([
  { $indexStats: {} }
]);

// Compact collection
db.runCommand({ compact: 'videos' });
```

## Analytics Infrastructure

### KPIs Dashboard
Located at: `hexarchy/7-data/analytics/analytics-engine.js`

**Key Metrics:**
- DAU/MAU (Daily/Monthly Active Users)
- Video views and watch time
- Revenue and MRR
- Conversion rate
- Churn rate
- Storage usage
- API performance

### Running Analytics
```bash
# Get current KPIs
node -e "
  import('./hexarchy/7-data/analytics/analytics-engine.js').then(m => {
    const engine = new m.AnalyticsEngine(db, redis);
    engine.getKPIs('24h').then(console.log);
  });
"

# Generate weekly report
npm run analytics:report -- --period=7d

# Export data for analysis
npm run analytics:export -- --format=csv --output=./data/analytics.csv
```

### Custom Analytics Queries

#### User Engagement
```javascript
// Average session duration
db.activity_logs.aggregate([
  { $match: { action: 'session_end' } },
  { $group: {
    _id: null,
    avgDuration: { $avg: '$metadata.duration' }
  }}
]);

// Most active users
db.activity_logs.aggregate([
  { $group: {
    _id: '$userId',
    activityCount: { $sum: 1 }
  }},
  { $sort: { activityCount: -1 } },
  { $limit: 100 }
]);
```

#### Content Analytics
```javascript
// Top performing videos
db.videos.find({}).sort({ views: -1 }).limit(10);

// Video upload trends
db.videos.aggregate([
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
    count: { $sum: 1 },
    totalSize: { $sum: '$fileSize' }
  }},
  { $sort: { _id: -1 } }
]);
```

#### Revenue Analytics
```javascript
// Revenue by day
db.payments.aggregate([
  { $match: { status: 'succeeded' } },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
    revenue: { $sum: '$amount' },
    transactions: { $sum: 1 }
  }},
  { $sort: { _id: -1 } }
]);

// Customer lifetime value
db.payments.aggregate([
  { $match: { status: 'succeeded' } },
  { $group: {
    _id: '$userId',
    totalSpent: { $sum: '$amount' },
    transactionCount: { $sum: 1 }
  }},
  { $group: {
    _id: null,
    avgLTV: { $avg: '$totalSpent' }
  }}
]);
```

## Backup & Recovery

### Backup System
Located at: `hexarchy/7-data/backup/backup-manager.js`

**Backup Types:**
- Full backup: Daily at 2 AM
- Incremental: Every 6 hours
- PITR snapshots: Every 15 minutes

### Backup Operations
```bash
# Create manual backup
npm run backup:create

# List backups
npm run backup:list

# Restore from backup
npm run backup:restore -- --backup=mongodb-full-2024-01-15

# Test disaster recovery
npm run backup:test-dr
```

### Backup Verification
```bash
# Verify backup integrity
npm run backup:verify -- --backup=mongodb-full-2024-01-15

# Test restore to staging
npm run backup:restore -- --backup=latest --target=staging
```

## Data Pipeline

### ETL Processes

#### Daily ETL Job
```javascript
// Extract
const rawData = await db.collection('activity_logs').find({
  timestamp: { $gte: yesterday, $lt: today }
}).toArray();

// Transform
const transformed = rawData.map(log => ({
  date: log.timestamp.toISOString().split('T')[0],
  userId: log.userId,
  action: log.action,
  duration: log.metadata?.duration || 0
}));

// Load
await db.collection('analytics_daily').insertMany(transformed);
```

#### Aggregation Tables
```javascript
// Create daily aggregations
db.createCollection('analytics_daily');
db.analytics_daily.createIndex({ date: -1, userId: 1 });

// Populate aggregations
db.activity_logs.aggregate([
  { $match: { timestamp: { $gte: startDate } } },
  { $group: {
    _id: {
      date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      userId: '$userId'
    },
    actions: { $sum: 1 },
    uniqueActions: { $addToSet: '$action' }
  }},
  { $out: 'analytics_daily' }
]);
```

## Monitoring & Alerts

### Database Metrics
```bash
# Monitor database size
db.stats();

# Monitor collection sizes
db.videos.stats();

# Monitor index usage
db.videos.aggregate([{ $indexStats: {} }]);

# Monitor replication lag
rs.printSlaveReplicationInfo();
```

### Alert Configuration
```javascript
// Prometheus metrics
const metrics = {
  dbConnections: new Gauge({ name: 'mongodb_connections', help: 'Active connections' }),
  queryDuration: new Histogram({ name: 'mongodb_query_duration', help: 'Query duration' }),
  cacheHitRate: new Gauge({ name: 'redis_cache_hit_rate', help: 'Cache hit rate' })
};
```

### Alert Thresholds
- Database connections > 80%: Warning
- Slow queries > 1s: Warning
- Cache hit rate < 80%: Warning
- Replication lag > 10s: Critical
- Disk usage > 85%: Critical

## Data Quality

### Validation Rules
```javascript
// User data validation
const userSchema = {
  email: { type: 'string', format: 'email', required: true },
  name: { type: 'string', minLength: 1, maxLength: 100 },
  createdAt: { type: 'date', required: true }
};

// Video data validation
const videoSchema = {
  userId: { type: 'objectId', required: true },
  title: { type: 'string', minLength: 1, maxLength: 200, required: true },
  fileSize: { type: 'number', minimum: 0 },
  duration: { type: 'number', minimum: 0 }
};
```

### Data Cleanup Jobs
```bash
# Remove deleted users (30 days old)
npm run data:cleanup:users

# Remove orphaned videos
npm run data:cleanup:videos

# Enforce retention policy
npm run data:retention:enforce
```

## Compliance & Security

### Data Retention
- Activity logs: 90 days (TTL index)
- Deleted users: 30 days grace period
- Backups: 30 days
- Audit logs: 1 year

### Data Encryption
- At rest: MongoDB encryption
- In transit: TLS/SSL
- Backups: Encrypted with AWS KMS

### Access Control
```javascript
// Database roles
db.createRole({
  role: "dataEngineer",
  privileges: [
    { resource: { db: "hootner", collection: "" }, actions: ["find", "insert", "update"] },
    { resource: { db: "hootner", collection: "system.profile" }, actions: ["find"] }
  ],
  roles: []
});
```

## Tools & Resources

### Database Tools
- MongoDB Compass: GUI for MongoDB
- Redis Commander: GUI for Redis
- mongodump/mongorestore: Backup tools
- mongostat/mongotop: Monitoring tools

### Analytics Tools
- Grafana: Metrics visualization
- Metabase: Business intelligence
- Jupyter Notebooks: Data analysis

### Documentation
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Redis Best Practices](https://redis.io/topics/optimization)
- [Data Architecture](docs/architecture/DATA_ARCHITECTURE.md)

## Common Tasks

### Weekly Tasks
- [ ] Review slow query log
- [ ] Check backup success rate
- [ ] Monitor database growth
- [ ] Review cache hit rates
- [ ] Update analytics dashboards

### Monthly Tasks
- [ ] Database performance review
- [ ] Index optimization
- [ ] Capacity planning
- [ ] Data quality audit
- [ ] Backup restore test

## Contact

**Data Team Lead:** data@hootner.com
**On-call:** +1-XXX-XXX-XXXX
**Slack:** #data-team

---

**Last Updated:** [DATE]
**Version:** 1.0
