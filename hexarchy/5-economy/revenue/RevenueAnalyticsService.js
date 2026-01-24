// Revenue Analytics and Reporting Service
import { logger } from '../../0-core/logging/logger.js';

export class RevenueAnalyticsService {
  constructor(revenueRepository, subscriptionService, adRevenueService) {
    this.revenueRepository = revenueRepository;
    this.subscriptionService = subscriptionService;
    this.adRevenueService = adRevenueService;
  }

  // Get platform revenue summary
  async getPlatformRevenue(period = '30d') {
    try {
      // Get subscription revenue
      const subscriptionRevenue = await this.getSubscriptionRevenue(period);

      // Get ad revenue
      const adRevenue = await this.getAdRevenue(period);

      // Get transaction fees
      const feeRevenue = await this.getFeeRevenue(period);

      const totalRevenue = subscriptionRevenue + adRevenue + feeRevenue;

      return {
        period,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        subscriptionRevenue: parseFloat(subscriptionRevenue.toFixed(2)),
        adRevenue: parseFloat(adRevenue.toFixed(2)),
        feeRevenue: parseFloat(feeRevenue.toFixed(2)),
        breakdown: {
          subscriptions: ((subscriptionRevenue / totalRevenue) * 100).toFixed(2),
          ads: ((adRevenue / totalRevenue) * 100).toFixed(2),
          fees: ((feeRevenue / totalRevenue) * 100).toFixed(2)
        }
      };
    } catch (error) {
      logger.error('Failed to get platform revenue:', error);
      throw error;
    }
  }

  // Get subscription revenue
  async getSubscriptionRevenue(period) {
    const subscriptions = await this.revenueRepository.findSubscriptionsByPeriod(period);
    return subscriptions.reduce((sum, sub) => {
      const tier = this.subscriptionService.getTier(sub.tierId);
      return sum + (tier?.price || 0);
    }, 0);
  }

  // Get ad revenue
  async getAdRevenue(period) {
    const impressions = await this.revenueRepository.findAdImpressionsByPeriod(period);

    return impressions.reduce((sum, imp) => {
      return sum + this.adRevenueService.calculateRevenue(1, imp.adType);
    }, 0);
  }

  // Get transaction fee revenue
  async getFeeRevenue(period) {
    const transactions = await this.revenueRepository.findTransactionsByPeriod(period);
    return transactions.reduce((sum, tx) => sum + (tx.platformFee || 0), 0);
  }

  // Get revenue by category
  async getRevenueByCategory(period = '30d') {
    const categories = {};

    // Get all videos with revenue
    const videos = await this.revenueRepository.findVideosWithRevenue(period);

    for (const video of videos) {
      const category = video.category || 'Other';
      const revenue = await this.adRevenueService.getVideoRevenue(video.id, period);

      if (!categories[category]) {
        categories[category] = {
          category,
          videos: 0,
          revenue: 0,
          impressions: 0
        };
      }

      categories[category].videos++;
      categories[category].revenue += revenue.totalRevenue;
      categories[category].impressions += revenue.totalImpressions;
    }

    return Object.values(categories).sort((a, b) => b.revenue - a.revenue);
  }

  // Get revenue timeline
  async getRevenueTimeline(period = '30d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const timeline = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get revenue for each source
      const subscriptions = await this.revenueRepository.findSubscriptionsByDate(dateStr);
      const ads = await this.revenueRepository.findAdImpressionsByDate(dateStr);
      const fees = await this.revenueRepository.findTransactionsByDate(dateStr);

      const subscriptionRevenue = subscriptions.reduce((sum, sub) => {
        const tier = this.subscriptionService.getTier(sub.tierId);
        return sum + (tier?.price || 0);
      }, 0);

      const adRevenue = ads.reduce((sum, imp) => {
        return sum + this.adRevenueService.calculateRevenue(1, imp.adType);
      }, 0);

      const feeRevenue = fees.reduce((sum, tx) => sum + (tx.platformFee || 0), 0);

      timeline.push({
        date: dateStr,
        subscriptions: parseFloat(subscriptionRevenue.toFixed(2)),
        ads: parseFloat(adRevenue.toFixed(2)),
        fees: parseFloat(feeRevenue.toFixed(2)),
        total: parseFloat((subscriptionRevenue + adRevenue + feeRevenue).toFixed(2))
      });
    }

    return timeline;
  }

  // Get top revenue creators
  async getTopRevenueCreators(limit = 10, period = '30d') {
    const creators = await this.revenueRepository.findCreatorsByRevenue(period);

    const creatorStats = await Promise.all(
      creators.map(async creator => {
        const revenue = await this.adRevenueService.getCreatorRevenue(creator.userId, period);
        return {
          userId: creator.userId,
          username: creator.username,
          totalRevenue: revenue.totalRevenue,
          creatorShare: revenue.creatorShare,
          videos: revenue.videoCount,
          impressions: revenue.totalImpressions,
          avgRevenuePerVideo: revenue.avgRevenuePerVideo
        };
      })
    );

    return creatorStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  // Get revenue forecast
  async getRevenueForecast(months = 3) {
    // Get historical revenue (last 90 days)
    const historical = await this.getRevenueTimeline('90d');

    // Calculate average daily growth rate
    const recentRevenue = historical.slice(-30);
    const avgDailyRevenue = recentRevenue.reduce((sum, d) => sum + d.total, 0) / 30;

    // Simple linear projection (in production, use more sophisticated models)
    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);

      const projectedRevenue = avgDailyRevenue * 30 * (1 + (i * 0.05)); // 5% growth per month

      forecast.push({
        month: month.toISOString().substring(0, 7),
        projected: parseFloat(projectedRevenue.toFixed(2)),
        confidence: Math.max(100 - (i * 15), 50) // Decreasing confidence
      });
    }

    return {
      historical: {
        avgDailyRevenue: parseFloat(avgDailyRevenue.toFixed(2)),
        last30Days: parseFloat((avgDailyRevenue * 30).toFixed(2))
      },
      forecast
    };
  }

  // Get revenue metrics
  async getRevenueMetrics(period = '30d') {
    const revenue = await this.getPlatformRevenue(period);
    const timeline = await this.getRevenueTimeline(period);

    // Calculate growth
    const previousPeriod = await this.getPlatformRevenue(
      period === '7d' ? '7d' : period === '30d' ? '30d' : '90d'
    );

    const growth = previousPeriod.totalRevenue > 0
      ? ((revenue.totalRevenue - previousPeriod.totalRevenue) / previousPeriod.totalRevenue * 100).toFixed(2)
      : 0;

    // Calculate MRR (Monthly Recurring Revenue) from subscriptions
    const activeSubscriptions = await this.revenueRepository.findActiveSubscriptions();
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      const tier = this.subscriptionService.getTier(sub.tierId);
      return sum + (tier?.price || 0);
    }, 0);

    // Calculate ARPU (Average Revenue Per User)
    const totalUsers = await this.revenueRepository.getTotalUsers();
    const arpu = totalUsers > 0 ? (revenue.totalRevenue / totalUsers).toFixed(2) : 0;

    return {
      period,
      totalRevenue: revenue.totalRevenue,
      growth: parseFloat(growth),
      mrr: parseFloat(mrr.toFixed(2)),
      arpu: parseFloat(arpu),
      timeline,
      breakdown: revenue.breakdown
    };
  }

  // Export revenue report
  async exportRevenueReport(period = '30d', format = 'json') {
    const revenue = await this.getPlatformRevenue(period);
    const timeline = await this.getRevenueTimeline(period);
    const byCategory = await this.getRevenueByCategory(period);
    const topCreators = await this.getTopRevenueCreators(10, period);
    const metrics = await this.getRevenueMetrics(period);

    const report = {
      generatedAt: new Date().toISOString(),
      period,
      summary: revenue,
      metrics,
      timeline,
      byCategory,
      topCreators
    };

    if (format === 'csv') {
      return this.convertToCSV(report);
    }

    return report;
  }

  // Convert to CSV
  convertToCSV(report) {
    // Simple CSV conversion (in production, use proper library)
    const rows = ['Date,Subscriptions,Ads,Fees,Total'];

    report.timeline.forEach(day => {
      rows.push(`${day.date},${day.subscriptions},${day.ads},${day.fees},${day.total}`);
    });

    return rows.join('\n');
  }
}

export default RevenueAnalyticsService;
