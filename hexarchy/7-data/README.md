# Layer 7 - Data

Data warehousing, ETL pipelines, business intelligence, and reporting for the Hootner video platform.

## 📁 Structure

```
7-data/
├── warehouse/                 # Data Warehouse
│   └── DataWarehouseService.js        # Star schema, queries, aggregates
├── etl/                       # ETL Pipelines
│   └── ETLService.js                  # Extract, transform, load
├── analytics/                 # Business Intelligence
│   └── BusinessIntelligenceService.js # BI reports, dashboards
├── reporting/                 # Data Export & Archival
│   └── DataExportService.js           # Exports, archives, GDPR
├── index.js                   # Central export
└── README.md                  # This file
```

## 🎯 Purpose

Layer 7 provides data warehousing and analytics infrastructure:
- **Data Warehouse**: Star schema with fact and dimension tables
- **ETL**: Scheduled data pipelines (every 4-6 hours)
- **Business Intelligence**: Executive dashboards, reports, insights
- **Data Export**: User data exports, archival, retention policies

## 🏗️ Data Warehouse

### DataWarehouseService
Star schema data warehouse for analytics:

**Warehouse Tables:**

**Fact Tables (transactional data):**
- `fact_video_views` - Video view events
  - view_id, video_id, user_id, view_date, watch_duration, completion_rate, device_type, country, referrer
- `fact_user_engagement` - User engagement events
  - engagement_id, user_id, video_id, engagement_type (like/comment/share/subscribe), engagement_date, metadata
- `fact_revenue` - Revenue transactions
  - transaction_id, user_id, revenue_type (subscription/ad/tip/purchase), amount, currency, transaction_date, payment_method

**Dimension Tables (descriptive data):**
- `dim_users` - User profiles (anonymized)
  - user_id, username, email_domain, signup_date, country, subscription_tier, is_creator
- `dim_videos` - Video catalog
  - video_id, title, category, duration, upload_date, creator_id, is_monetized
- `dim_time` - Time dimension
  - date, year, quarter, month, week, day_of_week, day_name, is_weekend, is_holiday

**Aggregate Tables (pre-computed stats):**
- `agg_daily_stats` - Daily platform metrics
- `agg_weekly_stats` - Weekly rollups
- `agg_monthly_stats` - Monthly rollups
  - date, total_views, unique_viewers, total_watch_time, total_revenue, new_users, active_users, avg_session_duration, engagement_rate

**Methods:**
- `initializeWarehouse()` - Create all tables and schema
- `loadData(tableName, data)` - Batch insert records
- `query(sql, parameters)` - Execute SQL queries
- `getVideoPerformance(videoId, startDate, endDate)` - Video analytics (views, unique viewers, watch time, completion rate, engagements)
- `getUserAnalytics(userId, startDate, endDate)` - User analytics (videos watched, watch time, engagements, spending)
- `getPlatformStatistics(startDate, endDate, granularity)` - Platform metrics by granularity (daily/weekly/monthly)
- `getTrendingContent(period, limit)` - Trending videos with trend score
- `getRevenueBreakdown(startDate, endDate)` - Revenue by type and currency
- `getCohortAnalysis(cohortStartDate, cohortEndDate)` - User cohort retention
- `archiveOldData(tableName, retentionDays)` - Archive and delete old data

**Query Examples:**
```sql
-- Video performance with joins
SELECT v.title, COUNT(DISTINCT vw.user_id) as unique_viewers
FROM dim_videos v
JOIN fact_video_views vw ON v.video_id = vw.video_id
WHERE vw.view_date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY v.video_id, v.title;

-- Revenue by subscription tier
SELECT u.subscription_tier, SUM(r.amount) as revenue
FROM fact_revenue r
JOIN dim_users u ON r.user_id = u.user_id
GROUP BY u.subscription_tier;
```

## 🔄 ETL Pipelines

### ETLService
Extract, Transform, Load data from operational database to warehouse:

**ETL Jobs:**
- `video_views` - Extract video views (every 6 hours)
- `user_engagement` - Extract likes, comments, shares (every 6 hours)
- `revenue` - Extract completed transactions (every 4 hours)
- `user_dimensions` - Update user profiles (daily at 2 AM)
- `video_dimensions` - Update video catalog (daily at 3 AM)
- `daily_aggregates` - Generate daily stats (daily at 1 AM)

**Methods:**
- `runJob(jobName)` - Execute specific ETL job
- `extractVideoViews()` - Extract and transform video view events
  - Incremental extraction (only new records)
  - Normalize device types (MOBILE, TABLET, DESKTOP, SMART_TV)
  - Handle missing values
- `extractUserEngagement()` - Extract likes, comments, shares
  - Combines multiple engagement types
  - Enriches with metadata
- `extractRevenue()` - Extract completed transactions
  - Only processes 'completed' status
  - Converts amounts to decimal
- `extractUserDimensions()` - Update user dimension table
  - Anonymizes email (domain only)
  - Upsert (update existing, insert new)
- `extractVideoDimensions()` - Update video dimension table
  - Only published videos
- `generateDailyAggregates()` - Calculate daily platform stats
  - Total views, unique viewers, watch time, revenue, new users, active users
  - Triggers weekly aggregates on Sunday
  - Triggers monthly aggregates on last day of month
- `generateWeeklyAggregates(endDate)` - Rollup daily stats to weekly
- `generateMonthlyAggregates(endDate)` - Rollup daily stats to monthly
- `runAllJobs()` - Execute all ETL jobs sequentially

**Incremental Processing:**
- Tracks `last_run` timestamp per job in `etl_metadata` table
- Only extracts new records since last run
- Updates timestamp after successful run

**Schedule:**
```javascript
const jobs = {
  VIDEO_VIEWS: { schedule: '0 */6 * * *' },      // Every 6 hours
  USER_ENGAGEMENT: { schedule: '0 */6 * * *' },  // Every 6 hours
  REVENUE: { schedule: '0 */4 * * *' },          // Every 4 hours
  USER_DIMENSIONS: { schedule: '0 2 * * *' },    // Daily at 2 AM
  VIDEO_DIMENSIONS: { schedule: '0 3 * * *' },   // Daily at 3 AM
  DAILY_AGGREGATES: { schedule: '0 1 * * *' }    // Daily at 1 AM
};
```

## 📊 Business Intelligence

### BusinessIntelligenceService
Generate executive dashboards and analytics reports:

**Report Types:**
- EXECUTIVE_SUMMARY - High-level platform overview
- CONTENT_PERFORMANCE - Video performance analysis
- USER_BEHAVIOR - User patterns and demographics
- REVENUE_ANALYSIS - Revenue breakdown and trends
- GROWTH_METRICS - Growth rates and KPIs
- ENGAGEMENT_INSIGHTS - Engagement patterns
- CREATOR_ANALYTICS - Creator-specific metrics

**Methods:**
- `generateExecutiveSummary(startDate, endDate)` - Executive dashboard
  - Platform overview (total views, revenue, users)
  - Key metrics with period-over-period comparison
  - Growth trends (daily growth rates)
  - Top content (trending videos)
  - Revenue breakdown by type
- `getPlatformOverview(startDate, endDate)` - Aggregate platform metrics
- `getKeyMetrics(startDate, endDate)` - KPIs with comparisons
  - Calculates percent change vs. previous period
  - Views, revenue, active users, new users
- `getGrowthTrends(startDate, endDate)` - Daily growth rates with timeline
- `generateContentPerformanceReport(startDate, endDate, filters)` - Video analytics
  - Filters: category, creatorId, minViews
  - Metrics: views, unique viewers, watch time, completion rate, engagement rate
- `generateUserBehaviorReport(startDate, endDate)` - User analysis
  - Device distribution (view count, avg watch duration)
  - Geographic distribution (top 20 countries)
  - Engagement patterns by type
- `generateRevenueAnalysis(startDate, endDate)` - Revenue insights
  - Revenue breakdown by type
  - Revenue by user segment (subscription tier)
  - Revenue trends (daily by type)
- `generateCreatorAnalytics(creatorId, startDate, endDate)` - Creator dashboard
  - Video performance (views, watch time, engagements)
  - Audience demographics (top 10 countries)
  - Total earnings
- `exportReport(report, format)` - Export to JSON/CSV/PDF

**Key Metrics:**
- Total views, unique viewers, watch time
- Total revenue, avg revenue per user (ARPU)
- New users, active users, retention
- Engagement rate, completion rate
- Growth rates (views, revenue, users)

## 📤 Data Export & Archival

### DataExportService
User data exports, archival, and retention policies:

**Export Formats:**
- JSON - Structured data
- CSV - Tabular data
- PARQUET - Columnar format (archives)
- AVRO - Binary format

**Retention Policies:**
- RAW_DATA: 90 days - Raw event data
- AGGREGATED: 365 days - Aggregated stats
- ARCHIVED: 2,555 days (7 years) - Archived data
- USER_EXPORTS: 30 days - User data exports

**Methods:**
- `exportUserData(userId, format)` - Export all user data (GDPR compliance)
  - Profile, videos, view history, engagements, revenue
  - Generates downloadable file
  - Expires after 30 days
- `exportAnalyticsReport(reportConfig)` - Export analytics report
  - Report types: platform_stats, trending_content, revenue_breakdown
  - Formats: JSON, CSV
- `archiveData(tableName, cutoffDate)` - Archive old data
  - Exports data to Parquet file
  - Stores in long-term storage (S3)
  - Deletes from warehouse
- `runScheduledArchival()` - Daily archival process
  - Archives fact tables older than 90 days
- `cleanupExpiredExports()` - Delete expired user exports
  - Runs daily to remove exports older than 30 days

**User Data Export Includes:**
- Profile: username, email domain, signup date, country, subscription tier
- Videos: All uploaded videos with metadata
- View History: Last 1,000 video views
- Engagements: Last 1,000 likes/comments/shares
- Revenue: All transactions

**Archival Process:**
1. Export data older than retention period to Parquet
2. Store in S3 (or equivalent cloud storage)
3. Create archive record for tracking
4. Delete archived data from warehouse
5. Retain archives for 7 years

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 0 (Infrastructure) - Logging, storage, cloud services
- Layer 1 (Foundation) - Data models, repositories

**Provides:**
- Analytics data for Layer 4 (Interface) dashboards
- Metrics for Layer 8 (Operations) monitoring
- Reports for Layer 6 (Governance) compliance

## 📚 Usage Examples

### Data Warehouse
```javascript
import { DataWarehouseService } from './hexarchy/7-data/index.js';

const warehouse = new DataWarehouseService(bigQueryClient, etlService);

// Initialize schema
await warehouse.initializeWarehouse();

// Load data
await warehouse.loadData('fact_video_views', viewRecords);

// Query video performance
const performance = await warehouse.getVideoPerformance(
  'video123',
  '2026-01-01',
  '2026-01-31'
);

// Get platform statistics
const stats = await warehouse.getPlatformStatistics(
  '2026-01-01',
  '2026-01-31',
  'daily'
);

// Get trending content
const trending = await warehouse.getTrendingContent('7d', 10);

// Get revenue breakdown
const revenue = await warehouse.getRevenueBreakdown(
  '2026-01-01',
  '2026-01-31'
);

// Archive old data
await warehouse.archiveOldData('fact_video_views', 90);
```

### ETL Pipeline
```javascript
import { ETLService } from './hexarchy/7-data/index.js';

const etl = new ETLService(sourceDb, warehouse);

// Run specific job
await etl.runJob('video_views');

// Run all jobs
const results = await etl.runAllJobs();
console.log('ETL results:', results);

// Generate aggregates
await etl.generateDailyAggregates();

// Schedule with cron
import cron from 'node-cron';

// Every 6 hours
cron.schedule('0 */6 * * *', async () => {
  await etl.runJob('video_views');
  await etl.runJob('user_engagement');
});

// Daily at 1 AM
cron.schedule('0 1 * * *', async () => {
  await etl.runJob('daily_aggregates');
});
```

### Business Intelligence
```javascript
import { BusinessIntelligenceService } from './hexarchy/7-data/index.js';

const bi = new BusinessIntelligenceService(warehouse);

// Executive dashboard
const summary = await bi.generateExecutiveSummary(
  '2026-01-01',
  '2026-01-31'
);

console.log('Total Views:', summary.overview.totalViews);
console.log('Total Revenue:', summary.overview.totalRevenue);
console.log('Growth Trends:', summary.growthTrends);

// Content performance
const contentReport = await bi.generateContentPerformanceReport(
  '2026-01-01',
  '2026-01-31',
  { category: 'Gaming', minViews: 1000 }
);

// User behavior analysis
const userBehavior = await bi.generateUserBehaviorReport(
  '2026-01-01',
  '2026-01-31'
);

console.log('Device Distribution:', userBehavior.deviceDistribution);
console.log('Top Countries:', userBehavior.geoDistribution);

// Revenue analysis
const revenueReport = await bi.generateRevenueAnalysis(
  '2026-01-01',
  '2026-01-31'
);

// Creator analytics
const creatorReport = await bi.generateCreatorAnalytics(
  'creator123',
  '2026-01-01',
  '2026-01-31'
);

// Export report
const csvReport = await bi.exportReport(summary, 'csv');
```

### Data Export
```javascript
import { DataExportService } from './hexarchy/7-data/index.js';

const exporter = new DataExportService(warehouse, storageService);

// Export user data (GDPR)
const userExport = await exporter.exportUserData('user123', 'json');
console.log('Download:', userExport.filePath);

// Export analytics report
const analyticsExport = await exporter.exportAnalyticsReport({
  reportType: 'platform_stats',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  format: 'csv'
});

// Archive old data
await exporter.archiveData('fact_video_views', '2025-10-01');

// Scheduled archival (run daily)
cron.schedule('0 4 * * *', async () => {
  await exporter.runScheduledArchival();
  await exporter.cleanupExpiredExports();
});

// Get export status
const status = await exporter.getExportStatus('export123');
```

## 🔍 Analytics Queries

### Video Performance Analysis
```javascript
// Top performing videos
const topVideos = await warehouse.query(`
  SELECT 
    v.video_id,
    v.title,
    COUNT(DISTINCT vw.view_id) as views,
    AVG(vw.completion_rate) as avg_completion,
    COUNT(DISTINCT e.engagement_id) as engagements
  FROM dim_videos v
  JOIN fact_video_views vw ON v.video_id = vw.video_id
  LEFT JOIN fact_user_engagement e ON v.video_id = e.video_id
  WHERE vw.view_date >= '2026-01-01'
  GROUP BY v.video_id, v.title
  ORDER BY views DESC
  LIMIT 10
`);
```

### User Retention Cohort
```javascript
// Cohort retention analysis
const retention = await warehouse.getCohortAnalysis(
  '2025-01-01',
  '2025-12-31'
);

// Calculate retention rate by week
const retentionRates = {};
retention.forEach(row => {
  if (!retentionRates[row.cohort_month]) {
    retentionRates[row.cohort_month] = {};
  }
  retentionRates[row.cohort_month][`week_${row.weeks_since_signup}`] = row.active_users;
});
```

### Revenue Trends
```javascript
// Daily revenue by source
const revenueTrends = await warehouse.query(`
  SELECT 
    DATE(transaction_date) as date,
    revenue_type,
    SUM(amount) as daily_revenue
  FROM fact_revenue
  WHERE transaction_date >= '2026-01-01'
  GROUP BY date, revenue_type
  ORDER BY date, revenue_type
`);
```

## ✅ Complete

Layer 7 (Data) is **100% complete** with:
- ✅ 1 data warehouse service (star schema, 9 tables)
- ✅ 1 ETL service (6 scheduled jobs)
- ✅ 1 business intelligence service (7 report types)
- ✅ 1 data export service (4 formats, retention policies)
- ✅ Central export file

**Total: 5 files** providing comprehensive data warehousing, ETL, and analytics infrastructure.

**Key Features:**
- Star schema with fact and dimension tables
- Incremental ETL processing (every 4-6 hours)
- Pre-computed aggregates (daily, weekly, monthly)
- Executive dashboards with KPIs
- Period-over-period comparisons
- Cohort retention analysis
- User data exports (GDPR compliant)
- Automated data archival (7-year retention)
- Multiple export formats (JSON, CSV, Parquet)
- Scheduled jobs with cron expressions
