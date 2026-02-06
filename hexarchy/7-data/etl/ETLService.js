// ETL (Extract, Transform, Load) Service
import { logger } from '../../0-core/logging/logger.js';

export class ETLService {
  constructor(sourceDb, warehouseService) {
    this.sourceDb = sourceDb;
    this.warehouseService = warehouseService;

    // ETL job configurations
    this.jobs = {
      VIDEO_VIEWS: { name: 'video_views', schedule: '0 */6 * * *' }, // Every 6 hours
      USER_ENGAGEMENT: { name: 'user_engagement', schedule: '0 */6 * * *' },
      REVENUE: { name: 'revenue', schedule: '0 */4 * * *' }, // Every 4 hours
      USER_DIMENSIONS: { name: 'user_dimensions', schedule: '0 2 * * *' }, // Daily at 2 AM
      VIDEO_DIMENSIONS: { name: 'video_dimensions', schedule: '0 3 * * *' },
      DAILY_AGGREGATES: { name: 'daily_aggregates', schedule: '0 1 * * *' } // Daily at 1 AM
    };
  }

  // Run ETL job
  async runJob(jobName) {
    try {
      logger.info('Starting ETL job', { jobName });
      const startTime = Date.now();

      switch (jobName) {
        case 'video_views':
          await this.extractVideoViews();
          break;
        case 'user_engagement':
          await this.extractUserEngagement();
          break;
        case 'revenue':
          await this.extractRevenue();
          break;
        case 'user_dimensions':
          await this.extractUserDimensions();
          break;
        case 'video_dimensions':
          await this.extractVideoDimensions();
          break;
        case 'daily_aggregates':
          await this.generateDailyAggregates();
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }

      const duration = Date.now() - startTime;
      logger.info('ETL job completed', { jobName, duration });

      return { success: true, duration };
    } catch (error) {
      logger.error('ETL job failed', { jobName, error: error.message });
      throw error;
    }
  }

  // Extract video views from source database
  async extractVideoViews() {
    // Get last ETL timestamp
    const lastRun = await this.getLastETLTimestamp('video_views');

    // Extract new video views
    const views = await this.sourceDb.query(`
      SELECT
        id as view_id,
        video_id,
        user_id,
        created_at as view_date,
        watch_duration,
        completion_rate,
        device_type,
        country,
        referrer
      FROM video_views
      WHERE created_at > $1
    `, [lastRun]);

    // Transform data
    const transformedViews = views.map(view => ({
      ...view,
      watch_duration: parseInt(view.watch_duration) || 0,
      completion_rate: parseFloat(view.completion_rate) || 0,
      device_type: this.normalizeDeviceType(view.device_type),
      country: view.country || 'UNKNOWN'
    }));

    // Load into warehouse
    if (transformedViews.length > 0) {
      await this.warehouseService.loadData('fact_video_views', transformedViews);
      await this.updateETLTimestamp('video_views');
    }

    logger.info('Video views extracted', { count: transformedViews.length });
  }

  // Extract user engagement
  async extractUserEngagement() {
    const lastRun = await this.getLastETLTimestamp('user_engagement');

    // Extract likes
    const likes = await this.sourceDb.query(`
      SELECT
        id as engagement_id,
        user_id,
        video_id,
        'like' as engagement_type,
        created_at as engagement_date,
        '{}' as metadata
      FROM likes
      WHERE created_at > $1
    `, [lastRun]);

    // Extract comments
    const comments = await this.sourceDb.query(`
      SELECT
        id as engagement_id,
        user_id,
        video_id,
        'comment' as engagement_type,
        created_at as engagement_date,
        json_build_object('comment_length', length(text)) as metadata
      FROM comments
      WHERE created_at > $1
    `, [lastRun]);

    // Extract shares
    const shares = await this.sourceDb.query(`
      SELECT
        id as engagement_id,
        user_id,
        video_id,
        'share' as engagement_type,
        created_at as engagement_date,
        json_build_object('platform', platform) as metadata
      FROM shares
      WHERE created_at > $1
    `, [lastRun]);

    // Combine all engagement types
    const allEngagement = [...likes, ...comments, ...shares];

    if (allEngagement.length > 0) {
      await this.warehouseService.loadData('fact_user_engagement', allEngagement);
      await this.updateETLTimestamp('user_engagement');
    }

    logger.info('User engagement extracted', { count: allEngagement.length });
  }

  // Extract revenue data
  async extractRevenue() {
    const lastRun = await this.getLastETLTimestamp('revenue');

    const transactions = await this.sourceDb.query(`
      SELECT
        id as transaction_id,
        user_id,
        revenue_type,
        amount,
        currency,
        created_at as transaction_date,
        payment_method
      FROM transactions
      WHERE created_at > $1 AND status = 'completed'
    `, [lastRun]);

    // Transform amounts to decimal
    const transformedTransactions = transactions.map(tx => ({
      ...tx,
      amount: parseFloat(tx.amount) || 0,
      currency: tx.currency || 'USD'
    }));

    if (transformedTransactions.length > 0) {
      await this.warehouseService.loadData('fact_revenue', transformedTransactions);
      await this.updateETLTimestamp('revenue');
    }

    logger.info('Revenue data extracted', { count: transformedTransactions.length });
  }

  // Extract user dimensions
  async extractUserDimensions() {
    const users = await this.sourceDb.query(`
      SELECT
        id as user_id,
        username,
        SPLIT_PART(email, '@', 2) as email_domain,
        created_at as signup_date,
        country,
        subscription_tier,
        is_creator
      FROM users
    `);

    // Transform user data (anonymize sensitive info)
    const transformedUsers = users.map(user => ({
      ...user,
      email_domain: user.email_domain || 'unknown.com',
      country: user.country || 'UNKNOWN',
      subscription_tier: user.subscription_tier || 'free',
      is_creator: Boolean(user.is_creator)
    }));

    // Upsert into warehouse (update existing, insert new)
    await this.warehouseService.loadData('dim_users', transformedUsers);

    logger.info('User dimensions extracted', { count: transformedUsers.length });
  }

  // Extract video dimensions
  async extractVideoDimensions() {
    const videos = await this.sourceDb.query(`
      SELECT
        id as video_id,
        title,
        category,
        duration,
        created_at as upload_date,
        user_id as creator_id,
        monetization_enabled as is_monetized
      FROM videos
      WHERE status = 'published'
    `);

    const transformedVideos = videos.map(video => ({
      ...video,
      duration: parseInt(video.duration) || 0,
      category: video.category || 'Other',
      is_monetized: Boolean(video.is_monetized)
    }));

    await this.warehouseService.loadData('dim_videos', transformedVideos);

    logger.info('Video dimensions extracted', { count: transformedVideos.length });
  }

  // Generate daily aggregates
  async generateDailyAggregates() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = yesterday.toISOString().split('T')[0];

    // Calculate daily stats
    const stats = await this.sourceDb.query(`
      SELECT
        $1 as date,
        COUNT(DISTINCT vv.id) as total_views,
        COUNT(DISTINCT vv.user_id) as unique_viewers,
        SUM(vv.watch_duration) as total_watch_time,
        COALESCE(SUM(t.amount), 0) as total_revenue,
        COUNT(DISTINCT u.id) FILTER (WHERE u.created_at::date = $1) as new_users,
        COUNT(DISTINCT vv.user_id) as active_users,
        AVG(vv.watch_duration) as avg_session_duration,
        (COUNT(DISTINCT l.id)::float / NULLIF(COUNT(DISTINCT vv.id), 0)) as engagement_rate
      FROM video_views vv
      LEFT JOIN users u ON u.created_at::date = $1
      LEFT JOIN transactions t ON t.created_at::date = $1 AND t.status = 'completed'
      LEFT JOIN likes l ON l.created_at::date = $1
      WHERE vv.created_at::date = $1
    `, [date]);

    if (stats.length > 0) {
      await this.warehouseService.loadData('agg_daily_stats', stats);
    }

    // Generate weekly aggregates (if it's Sunday)
    if (yesterday.getDay() === 0) {
      await this.generateWeeklyAggregates(date);
    }

    // Generate monthly aggregates (if it's the last day of month)
    if (this.isLastDayOfMonth(yesterday)) {
      await this.generateMonthlyAggregates(date);
    }

    logger.info('Daily aggregates generated', { date });
  }

  // Generate weekly aggregates
  async generateWeeklyAggregates(endDate) {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);

    const sql = `
      SELECT
        $1 as date,
        SUM(total_views) as total_views,
        SUM(unique_viewers) as unique_viewers,
        SUM(total_watch_time) as total_watch_time,
        SUM(total_revenue) as total_revenue,
        SUM(new_users) as new_users,
        AVG(active_users) as active_users,
        AVG(avg_session_duration) as avg_session_duration,
        AVG(engagement_rate) as engagement_rate
      FROM agg_daily_stats
      WHERE date BETWEEN $2 AND $1
    `;

    const stats = await this.warehouseService.query(sql, { endDate, startDate: startDate.toISOString().split('T')[0] });

    if (stats.length > 0) {
      await this.warehouseService.loadData('agg_weekly_stats', stats);
    }

    logger.info('Weekly aggregates generated', { endDate });
  }

  // Generate monthly aggregates
  async generateMonthlyAggregates(endDate) {
    const date = new Date(endDate);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];

    const sql = `
      SELECT
        $1 as date,
        SUM(total_views) as total_views,
        SUM(unique_viewers) as unique_viewers,
        SUM(total_watch_time) as total_watch_time,
        SUM(total_revenue) as total_revenue,
        SUM(new_users) as new_users,
        AVG(active_users) as active_users,
        AVG(avg_session_duration) as avg_session_duration,
        AVG(engagement_rate) as engagement_rate
      FROM agg_daily_stats
      WHERE date BETWEEN $2 AND $1
    `;

    const stats = await this.warehouseService.query(sql, { endDate, startDate });

    if (stats.length > 0) {
      await this.warehouseService.loadData('agg_monthly_stats', stats);
    }

    logger.info('Monthly aggregates generated', { endDate });
  }

  // Normalize device type
  normalizeDeviceType(deviceType) {
    if (!deviceType) return 'UNKNOWN';

    const type = deviceType.toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) return 'MOBILE';
    if (type.includes('tablet') || type.includes('ipad')) return 'TABLET';
    if (type.includes('desktop') || type.includes('windows') || type.includes('mac')) return 'DESKTOP';
    if (type.includes('tv') || type.includes('smart')) return 'SMART_TV';

    return 'OTHER';
  }

  // Check if last day of month
  isLastDayOfMonth(date) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getDate() === 1;
  }

  // Get last ETL timestamp
  async getLastETLTimestamp(jobName) {
    try {
      const result = await this.sourceDb.query(
        'SELECT last_run FROM etl_metadata WHERE job_name = $1',
        [jobName]
      );
      return result[0]?.last_run || '1970-01-01';
    } catch (error) {
      return '1970-01-01';
    }
  }

  // Update ETL timestamp
  async updateETLTimestamp(jobName) {
    await this.sourceDb.query(
      `INSERT INTO etl_metadata (job_name, last_run)
       VALUES ($1, NOW())
       ON CONFLICT (job_name) DO UPDATE SET last_run = NOW()`,
      [jobName]
    );
  }

  // Run all ETL jobs
  async runAllJobs() {
    const results = {};

    for (const [key, job] of Object.entries(this.jobs)) {
      try {
        results[job.name] = await this.runJob(job.name);
      } catch (error) {
        results[job.name] = { success: false, error: error.message };
      }
    }

    return results;
  }
}

export default ETLService;
