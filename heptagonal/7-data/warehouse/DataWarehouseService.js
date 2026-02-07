// Data Warehouse Service
import { logger } from '../../0-core/logging/logger.js';

export class DataWarehouseService {
  constructor(warehouseClient, etlService) {
    this.warehouseClient = warehouseClient; // BigQuery, Redshift, or Snowflake client
    this.etlService = etlService;

    // Warehouse tables
    this.tables = {
      FACT_VIDEO_VIEWS: 'fact_video_views',
      FACT_USER_ENGAGEMENT: 'fact_user_engagement',
      FACT_REVENUE: 'fact_revenue',
      DIM_USERS: 'dim_users',
      DIM_VIDEOS: 'dim_videos',
      DIM_TIME: 'dim_time',
      AGG_DAILY_STATS: 'agg_daily_stats',
      AGG_WEEKLY_STATS: 'agg_weekly_stats',
      AGG_MONTHLY_STATS: 'agg_monthly_stats'
    };
  }

  // Initialize warehouse schema
  async initializeWarehouse() {
    try {
      // Create fact tables
      await this.createFactVideoViewsTable();
      await this.createFactUserEngagementTable();
      await this.createFactRevenueTable();

      // Create dimension tables
      await this.createDimUsersTable();
      await this.createDimVideosTable();
      await this.createDimTimeTable();

      // Create aggregate tables
      await this.createAggregateStatsTable('daily');
      await this.createAggregateStatsTable('weekly');
      await this.createAggregateStatsTable('monthly');

      logger.info('Data warehouse initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize warehouse:', error);
      throw error;
    }
  }

  // Create fact_video_views table
  async createFactVideoViewsTable() {
    const schema = {
      view_id: 'STRING',
      video_id: 'STRING',
      user_id: 'STRING',
      view_date: 'TIMESTAMP',
      watch_duration: 'INTEGER',
      completion_rate: 'FLOAT',
      device_type: 'STRING',
      country: 'STRING',
      referrer: 'STRING'
    };

    await this.warehouseClient.createTable(this.tables.FACT_VIDEO_VIEWS, schema);
  }

  // Create fact_user_engagement table
  async createFactUserEngagementTable() {
    const schema = {
      engagement_id: 'STRING',
      user_id: 'STRING',
      video_id: 'STRING',
      engagement_type: 'STRING', // like, comment, share, subscribe
      engagement_date: 'TIMESTAMP',
      metadata: 'JSON'
    };

    await this.warehouseClient.createTable(this.tables.FACT_USER_ENGAGEMENT, schema);
  }

  // Create fact_revenue table
  async createFactRevenueTable() {
    const schema = {
      transaction_id: 'STRING',
      user_id: 'STRING',
      revenue_type: 'STRING', // subscription, ad, tip, purchase
      amount: 'DECIMAL',
      currency: 'STRING',
      transaction_date: 'TIMESTAMP',
      payment_method: 'STRING'
    };

    await this.warehouseClient.createTable(this.tables.FACT_REVENUE, schema);
  }

  // Create dim_users table
  async createDimUsersTable() {
    const schema = {
      user_id: 'STRING',
      username: 'STRING',
      email_domain: 'STRING', // Anonymized
      signup_date: 'TIMESTAMP',
      country: 'STRING',
      subscription_tier: 'STRING',
      is_creator: 'BOOLEAN'
    };

    await this.warehouseClient.createTable(this.tables.DIM_USERS, schema);
  }

  // Create dim_videos table
  async createDimVideosTable() {
    const schema = {
      video_id: 'STRING',
      title: 'STRING',
      category: 'STRING',
      duration: 'INTEGER',
      upload_date: 'TIMESTAMP',
      creator_id: 'STRING',
      is_monetized: 'BOOLEAN'
    };

    await this.warehouseClient.createTable(this.tables.DIM_VIDEOS, schema);
  }

  // Create dim_time table
  async createDimTimeTable() {
    const schema = {
      date: 'DATE',
      year: 'INTEGER',
      quarter: 'INTEGER',
      month: 'INTEGER',
      week: 'INTEGER',
      day_of_week: 'INTEGER',
      day_name: 'STRING',
      is_weekend: 'BOOLEAN',
      is_holiday: 'BOOLEAN'
    };

    await this.warehouseClient.createTable(this.tables.DIM_TIME, schema);
  }

  // Create aggregate stats table
  async createAggregateStatsTable(period) {
    const tableName = `agg_${period}_stats`;
    const schema = {
      date: 'DATE',
      total_views: 'INTEGER',
      unique_viewers: 'INTEGER',
      total_watch_time: 'INTEGER',
      total_revenue: 'DECIMAL',
      new_users: 'INTEGER',
      active_users: 'INTEGER',
      avg_session_duration: 'FLOAT',
      engagement_rate: 'FLOAT'
    };

    await this.warehouseClient.createTable(tableName, schema);
  }

  // Load data into warehouse
  async loadData(tableName, data) {
    try {
      await this.warehouseClient.insertBatch(tableName, data);
      logger.info('Data loaded into warehouse', { tableName, records: data.length });
    } catch (error) {
      logger.error('Failed to load data:', error);
      throw error;
    }
  }

  // Query warehouse
  async query(sql, parameters = {}) {
    try {
      const results = await this.warehouseClient.execute(sql, parameters);
      return results;
    } catch (error) {
      logger.error('Warehouse query failed:', error);
      throw error;
    }
  }

  // Get video performance analytics
  async getVideoPerformance(videoId, startDate, endDate) {
    const sql = `
      SELECT
        v.video_id,
        v.title,
        v.category,
        COUNT(DISTINCT vw.view_id) as total_views,
        COUNT(DISTINCT vw.user_id) as unique_viewers,
        SUM(vw.watch_duration) as total_watch_time,
        AVG(vw.completion_rate) as avg_completion_rate,
        COUNT(DISTINCT e.engagement_id) as total_engagements
      FROM ${this.tables.DIM_VIDEOS} v
      LEFT JOIN ${this.tables.FACT_VIDEO_VIEWS} vw ON v.video_id = vw.video_id
      LEFT JOIN ${this.tables.FACT_USER_ENGAGEMENT} e ON v.video_id = e.video_id
      WHERE v.video_id = @videoId
        AND vw.view_date BETWEEN @startDate AND @endDate
      GROUP BY v.video_id, v.title, v.category
    `;

    return await this.query(sql, { videoId, startDate, endDate });
  }

  // Get user analytics
  async getUserAnalytics(userId, startDate, endDate) {
    const sql = `
      SELECT
        u.user_id,
        u.username,
        COUNT(DISTINCT vw.video_id) as videos_watched,
        SUM(vw.watch_duration) as total_watch_time,
        COUNT(DISTINCT e.engagement_id) as total_engagements,
        SUM(r.amount) as total_spent
      FROM ${this.tables.DIM_USERS} u
      LEFT JOIN ${this.tables.FACT_VIDEO_VIEWS} vw ON u.user_id = vw.user_id
      LEFT JOIN ${this.tables.FACT_USER_ENGAGEMENT} e ON u.user_id = e.user_id
      LEFT JOIN ${this.tables.FACT_REVENUE} r ON u.user_id = r.user_id
      WHERE u.user_id = @userId
        AND vw.view_date BETWEEN @startDate AND @endDate
      GROUP BY u.user_id, u.username
    `;

    return await this.query(sql, { userId, startDate, endDate });
  }

  // Get platform statistics
  async getPlatformStatistics(startDate, endDate, granularity = 'daily') {
    const aggregateTable = `agg_${granularity}_stats`;

    const sql = `
      SELECT
        date,
        total_views,
        unique_viewers,
        total_watch_time,
        total_revenue,
        new_users,
        active_users,
        avg_session_duration,
        engagement_rate
      FROM ${aggregateTable}
      WHERE date BETWEEN @startDate AND @endDate
      ORDER BY date ASC
    `;

    return await this.query(sql, { startDate, endDate });
  }

  // Get trending content
  async getTrendingContent(period = '7d', limit = 10) {
    const startDate = this.getDateOffset(period);
    const endDate = new Date().toISOString().split('T')[0];

    const sql = `
      SELECT
        v.video_id,
        v.title,
        v.category,
        COUNT(DISTINCT vw.view_id) as views,
        COUNT(DISTINCT vw.user_id) as unique_viewers,
        COUNT(DISTINCT e.engagement_id) as engagements,
        (COUNT(DISTINCT vw.view_id) + COUNT(DISTINCT e.engagement_id) * 5) as trend_score
      FROM ${this.tables.DIM_VIDEOS} v
      JOIN ${this.tables.FACT_VIDEO_VIEWS} vw ON v.video_id = vw.video_id
      LEFT JOIN ${this.tables.FACT_USER_ENGAGEMENT} e ON v.video_id = e.video_id
      WHERE vw.view_date BETWEEN @startDate AND @endDate
      GROUP BY v.video_id, v.title, v.category
      ORDER BY trend_score DESC
      LIMIT @limit
    `;

    return await this.query(sql, { startDate, endDate, limit });
  }

  // Get revenue breakdown
  async getRevenueBreakdown(startDate, endDate) {
    const sql = `
      SELECT
        revenue_type,
        COUNT(transaction_id) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount,
        currency
      FROM ${this.tables.FACT_REVENUE}
      WHERE transaction_date BETWEEN @startDate AND @endDate
      GROUP BY revenue_type, currency
      ORDER BY total_amount DESC
    `;

    return await this.query(sql, { startDate, endDate });
  }

  // Get user cohort analysis
  async getCohortAnalysis(cohortStartDate, cohortEndDate) {
    const sql = `
      SELECT
        DATE_TRUNC('month', u.signup_date) as cohort_month,
        DATE_DIFF('week', u.signup_date, vw.view_date) as weeks_since_signup,
        COUNT(DISTINCT u.user_id) as active_users
      FROM ${this.tables.DIM_USERS} u
      JOIN ${this.tables.FACT_VIDEO_VIEWS} vw ON u.user_id = vw.user_id
      WHERE u.signup_date BETWEEN @cohortStartDate AND @cohortEndDate
      GROUP BY cohort_month, weeks_since_signup
      ORDER BY cohort_month, weeks_since_signup
    `;

    return await this.query(sql, { cohortStartDate, cohortEndDate });
  }

  // Get date offset
  getDateOffset(period) {
    const date = new Date();
    const match = period.match(/(\d+)([dwmy])/);

    if (!match) return date.toISOString().split('T')[0];

    const [, amount, unit] = match;
    const offset = parseInt(amount);

    switch (unit) {
      case 'd':
        date.setDate(date.getDate() - offset);
        break;
      case 'w':
        date.setDate(date.getDate() - (offset * 7));
        break;
      case 'm':
        date.setMonth(date.getMonth() - offset);
        break;
      case 'y':
        date.setFullYear(date.getFullYear() - offset);
        break;
    }

    return date.toISOString().split('T')[0];
  }

  // Archive old data
  async archiveOldData(tableName, retentionDays = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const archiveTable = `${tableName}_archive`;

    // Move old data to archive
    const sql = `
      INSERT INTO ${archiveTable}
      SELECT * FROM ${tableName}
      WHERE date < @cutoffDate
    `;

    await this.query(sql, { cutoffDate: cutoffDate.toISOString().split('T')[0] });

    // Delete archived data from main table
    await this.query(
      `DELETE FROM ${tableName} WHERE date < @cutoffDate`,
      { cutoffDate: cutoffDate.toISOString().split('T')[0] }
    );

    logger.info('Old data archived', { tableName, cutoffDate });
  }
}

export default DataWarehouseService;
