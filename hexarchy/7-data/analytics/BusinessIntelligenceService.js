// Business Intelligence and Reporting Service
import { logger } from '../../0-core/logging/logger.js';

export class BusinessIntelligenceService {
  constructor(warehouseService) {
    this.warehouseService = warehouseService;

    // Report types
    this.reportTypes = {
      EXECUTIVE_SUMMARY: 'executive_summary',
      CONTENT_PERFORMANCE: 'content_performance',
      USER_BEHAVIOR: 'user_behavior',
      REVENUE_ANALYSIS: 'revenue_analysis',
      GROWTH_METRICS: 'growth_metrics',
      ENGAGEMENT_INSIGHTS: 'engagement_insights',
      CREATOR_ANALYTICS: 'creator_analytics'
    };
  }

  // Generate executive summary dashboard
  async generateExecutiveSummary(startDate, endDate) {
    try {
      // Platform overview
      const overview = await this.getPlatformOverview(startDate, endDate);

      // Key metrics
      const keyMetrics = await this.getKeyMetrics(startDate, endDate);

      // Growth trends
      const growthTrends = await this.getGrowthTrends(startDate, endDate);

      // Top content
      const topContent = await this.warehouseService.getTrendingContent('30d', 10);

      // Revenue breakdown
      const revenueBreakdown = await this.warehouseService.getRevenueBreakdown(startDate, endDate);

      return {
        reportType: this.reportTypes.EXECUTIVE_SUMMARY,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        overview,
        keyMetrics,
        growthTrends,
        topContent,
        revenueBreakdown
      };
    } catch (error) {
      logger.error('Failed to generate executive summary:', error);
      throw error;
    }
  }

  // Get platform overview
  async getPlatformOverview(startDate, endDate) {
    const stats = await this.warehouseService.getPlatformStatistics(startDate, endDate, 'daily');

    const totalViews = stats.reduce((sum, day) => sum + day.total_views, 0);
    const totalRevenue = stats.reduce((sum, day) => sum + parseFloat(day.total_revenue), 0);
    const avgActiveUsers = stats.reduce((sum, day) => sum + day.active_users, 0) / stats.length;
    const totalNewUsers = stats.reduce((sum, day) => sum + day.new_users, 0);

    return {
      totalViews,
      totalRevenue,
      avgActiveUsers: Math.round(avgActiveUsers),
      totalNewUsers,
      avgEngagementRate: (stats.reduce((sum, day) => sum + day.engagement_rate, 0) / stats.length).toFixed(2)
    };
  }

  // Get key metrics with comparisons
  async getKeyMetrics(startDate, endDate) {
    // Current period
    const currentPeriod = await this.getPlatformOverview(startDate, endDate);

    // Previous period (same length)
    const periodLength = new Date(endDate) - new Date(startDate);
    const prevEndDate = new Date(new Date(startDate) - 1);
    const prevStartDate = new Date(prevEndDate - periodLength);

    const previousPeriod = await this.getPlatformOverview(
      prevStartDate.toISOString().split('T')[0],
      prevEndDate.toISOString().split('T')[0]
    );

    // Calculate changes
    return {
      views: {
        current: currentPeriod.totalViews,
        previous: previousPeriod.totalViews,
        change: this.calculatePercentChange(currentPeriod.totalViews, previousPeriod.totalViews)
      },
      revenue: {
        current: currentPeriod.totalRevenue,
        previous: previousPeriod.totalRevenue,
        change: this.calculatePercentChange(currentPeriod.totalRevenue, previousPeriod.totalRevenue)
      },
      activeUsers: {
        current: currentPeriod.avgActiveUsers,
        previous: previousPeriod.avgActiveUsers,
        change: this.calculatePercentChange(currentPeriod.avgActiveUsers, previousPeriod.avgActiveUsers)
      },
      newUsers: {
        current: currentPeriod.totalNewUsers,
        previous: previousPeriod.totalNewUsers,
        change: this.calculatePercentChange(currentPeriod.totalNewUsers, previousPeriod.totalNewUsers)
      }
    };
  }

  // Get growth trends
  async getGrowthTrends(startDate, endDate) {
    const stats = await this.warehouseService.getPlatformStatistics(startDate, endDate, 'daily');

    // Calculate daily growth rates
    const viewsGrowth = this.calculateGrowthRate(stats.map(s => s.total_views));
    const revenueGrowth = this.calculateGrowthRate(stats.map(s => parseFloat(s.total_revenue)));
    const usersGrowth = this.calculateGrowthRate(stats.map(s => s.active_users));

    return {
      viewsGrowth: viewsGrowth.toFixed(2) + '%',
      revenueGrowth: revenueGrowth.toFixed(2) + '%',
      usersGrowth: usersGrowth.toFixed(2) + '%',
      timeline: stats.map(s => ({
        date: s.date,
        views: s.total_views,
        revenue: parseFloat(s.total_revenue),
        users: s.active_users
      }))
    };
  }

  // Generate content performance report
  async generateContentPerformanceReport(startDate, endDate, filters = {}) {
    const { category, creatorId, minViews } = filters;

    let sql = `
      SELECT
        v.video_id,
        v.title,
        v.category,
        v.creator_id,
        COUNT(DISTINCT vw.view_id) as total_views,
        COUNT(DISTINCT vw.user_id) as unique_viewers,
        SUM(vw.watch_duration) as total_watch_time,
        AVG(vw.completion_rate) as avg_completion_rate,
        COUNT(DISTINCT e.engagement_id) as total_engagements,
        (COUNT(DISTINCT e.engagement_id)::float / NULLIF(COUNT(DISTINCT vw.view_id), 0)) as engagement_rate
      FROM dim_videos v
      JOIN fact_video_views vw ON v.video_id = vw.video_id
      LEFT JOIN fact_user_engagement e ON v.video_id = e.video_id
      WHERE vw.view_date BETWEEN @startDate AND @endDate
    `;

    if (category) sql += ` AND v.category = @category`;
    if (creatorId) sql += ` AND v.creator_id = @creatorId`;

    sql += `
      GROUP BY v.video_id, v.title, v.category, v.creator_id
      HAVING COUNT(DISTINCT vw.view_id) >= @minViews
      ORDER BY total_views DESC
    `;

    const results = await this.warehouseService.query(sql, {
      startDate,
      endDate,
      category,
      creatorId,
      minViews: minViews || 0
    });

    return {
      reportType: this.reportTypes.CONTENT_PERFORMANCE,
      period: { startDate, endDate },
      filters,
      videos: results
    };
  }

  // Generate user behavior analysis
  async generateUserBehaviorReport(startDate, endDate) {
    // View patterns by device
    const deviceDistribution = await this.warehouseService.query(`
      SELECT
        device_type,
        COUNT(*) as view_count,
        AVG(watch_duration) as avg_watch_duration
      FROM fact_video_views
      WHERE view_date BETWEEN @startDate AND @endDate
      GROUP BY device_type
    `, { startDate, endDate });

    // Geographic distribution
    const geoDistribution = await this.warehouseService.query(`
      SELECT
        country,
        COUNT(DISTINCT user_id) as users,
        COUNT(*) as views,
        SUM(watch_duration) as total_watch_time
      FROM fact_video_views
      WHERE view_date BETWEEN @startDate AND @endDate
      GROUP BY country
      ORDER BY views DESC
      LIMIT 20
    `, { startDate, endDate });

    // Engagement patterns
    const engagementPatterns = await this.warehouseService.query(`
      SELECT
        engagement_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM fact_user_engagement
      WHERE engagement_date BETWEEN @startDate AND @endDate
      GROUP BY engagement_type
    `, { startDate, endDate });

    return {
      reportType: this.reportTypes.USER_BEHAVIOR,
      period: { startDate, endDate },
      deviceDistribution,
      geoDistribution,
      engagementPatterns
    };
  }

  // Generate revenue analysis
  async generateRevenueAnalysis(startDate, endDate) {
    const revenueBreakdown = await this.warehouseService.getRevenueBreakdown(startDate, endDate);

    // Revenue by user segment
    const revenueBySegment = await this.warehouseService.query(`
      SELECT
        u.subscription_tier,
        COUNT(DISTINCT r.user_id) as paying_users,
        SUM(r.amount) as total_revenue,
        AVG(r.amount) as avg_transaction
      FROM fact_revenue r
      JOIN dim_users u ON r.user_id = u.user_id
      WHERE r.transaction_date BETWEEN @startDate AND @endDate
      GROUP BY u.subscription_tier
    `, { startDate, endDate });

    // Revenue trends
    const revenueTrends = await this.warehouseService.query(`
      SELECT
        DATE_TRUNC('day', transaction_date) as date,
        revenue_type,
        SUM(amount) as daily_revenue
      FROM fact_revenue
      WHERE transaction_date BETWEEN @startDate AND @endDate
      GROUP BY date, revenue_type
      ORDER BY date
    `, { startDate, endDate });

    return {
      reportType: this.reportTypes.REVENUE_ANALYSIS,
      period: { startDate, endDate },
      breakdown: revenueBreakdown,
      bySegment: revenueBySegment,
      trends: revenueTrends
    };
  }

  // Generate creator analytics
  async generateCreatorAnalytics(creatorId, startDate, endDate) {
    // Creator's video performance
    const videoPerformance = await this.warehouseService.query(`
      SELECT
        v.video_id,
        v.title,
        COUNT(DISTINCT vw.view_id) as views,
        COUNT(DISTINCT vw.user_id) as unique_viewers,
        SUM(vw.watch_duration) as watch_time,
        COUNT(DISTINCT e.engagement_id) as engagements
      FROM dim_videos v
      LEFT JOIN fact_video_views vw ON v.video_id = vw.video_id
      LEFT JOIN fact_user_engagement e ON v.video_id = e.video_id
      WHERE v.creator_id = @creatorId
        AND vw.view_date BETWEEN @startDate AND @endDate
      GROUP BY v.video_id, v.title
      ORDER BY views DESC
    `, { creatorId, startDate, endDate });

    // Audience demographics
    const audienceDemographics = await this.warehouseService.query(`
      SELECT
        vw.country,
        COUNT(DISTINCT vw.user_id) as unique_viewers,
        AVG(vw.watch_duration) as avg_watch_time
      FROM dim_videos v
      JOIN fact_video_views vw ON v.video_id = vw.video_id
      WHERE v.creator_id = @creatorId
        AND vw.view_date BETWEEN @startDate AND @endDate
      GROUP BY vw.country
      ORDER BY unique_viewers DESC
      LIMIT 10
    `, { creatorId, startDate, endDate });

    // Revenue (if applicable)
    const revenue = await this.warehouseService.query(`
      SELECT
        SUM(amount) as total_earnings
      FROM fact_revenue
      WHERE user_id = @creatorId
        AND transaction_date BETWEEN @startDate AND @endDate
    `, { creatorId, startDate, endDate });

    return {
      reportType: this.reportTypes.CREATOR_ANALYTICS,
      creatorId,
      period: { startDate, endDate },
      videoPerformance,
      audienceDemographics,
      totalEarnings: revenue[0]?.total_earnings || 0
    };
  }

  // Calculate percent change
  calculatePercentChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(2);
  }

  // Calculate growth rate
  calculateGrowthRate(values) {
    if (values.length < 2) return 0;

    const first = values[0] || 1;
    const last = values[values.length - 1] || 0;

    return ((last - first) / first) * 100;
  }

  // Export report to various formats
  async exportReport(report, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return this.convertToCSV(report);
      case 'pdf':
        return this.convertToPDF(report);
      default:
        throw new Error('Unsupported format');
    }
  }

  // Convert to CSV
  convertToCSV(report) {
    // Simplified CSV conversion
    let csv = 'Report Type,' + report.reportType + '\n';
    csv += 'Generated At,' + report.generatedAt + '\n\n';

    // Add data sections
    if (report.overview) {
      csv += 'Overview\n';
      csv += Object.entries(report.overview).map(([key, value]) => `${key},${value}`).join('\n');
    }

    return csv;
  }

  // Convert to PDF (placeholder)
  convertToPDF(report) {
    // In production, use a library like pdfkit or puppeteer
    return Buffer.from(JSON.stringify(report));
  }
}

export default BusinessIntelligenceService;
