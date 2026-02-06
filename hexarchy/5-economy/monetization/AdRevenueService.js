// Ad Revenue Management Service
import { logger } from '../../0-core/logging/logger.js';

export class AdRevenueService {
  constructor(revenueRepository, analyticsService) {
    this.revenueRepository = revenueRepository;
    this.analyticsService = analyticsService;

    // Revenue rates (per 1000 impressions)
    this.cpmRates = {
      preRoll: 2.50,    // Before video starts
      midRoll: 3.00,    // During video
      postRoll: 1.50,   // After video ends
      display: 0.50,    // Banner ads
      overlay: 1.00     // Video overlay
    };
  }

  // Track ad impression
  async trackImpression(videoId, adType, userId, metadata = {}) {
    try {
      const impression = await this.revenueRepository.create({
        videoId,
        adType,
        userId,
        impressionDate: new Date().toISOString(),
        metadata: {
          country: metadata.country,
          device: metadata.device,
          campaign: metadata.campaign
        }
      });

      logger.info('Ad impression tracked', { videoId, adType, impressionId: impression.id });
      return impression;
    } catch (error) {
      logger.error('Failed to track impression:', error);
      throw error;
    }
  }

  // Track ad click
  async trackClick(impressionId, videoId, adType) {
    try {
      await this.revenueRepository.update(impressionId, {
        clicked: true,
        clickDate: new Date().toISOString()
      });

      logger.info('Ad click tracked', { impressionId, videoId, adType });
    } catch (error) {
      logger.error('Failed to track click:', error);
    }
  }

  // Calculate revenue for impressions
  calculateRevenue(impressions, adType) {
    const rate = this.cpmRates[adType] || 1.0;
    const revenue = (impressions / 1000) * rate;
    return parseFloat(revenue.toFixed(2));
  }

  // Get video revenue
  async getVideoRevenue(videoId, period = '30d') {
    const impressions = await this.revenueRepository.findByVideoId(videoId, period);

    const revenueByType = {};
    const clicksByType = {};

    impressions.forEach(imp => {
      if (!revenueByType[imp.adType]) {
        revenueByType[imp.adType] = 0;
        clicksByType[imp.adType] = 0;
      }
      revenueByType[imp.adType]++;
      if (imp.clicked) {
        clicksByType[imp.adType]++;
      }
    });

    const revenue = Object.entries(revenueByType).map(([adType, count]) => ({
      adType,
      impressions: count,
      clicks: clicksByType[adType] || 0,
      ctr: count > 0 ? ((clicksByType[adType] || 0) / count * 100).toFixed(2) : 0,
      revenue: this.calculateRevenue(count, adType)
    }));

    const totalRevenue = revenue.reduce((sum, r) => sum + r.revenue, 0);
    const totalImpressions = impressions.length;
    const totalClicks = Object.values(clicksByType).reduce((sum, c) => sum + c, 0);

    return {
      videoId,
      period,
      totalRevenue,
      totalImpressions,
      totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      byType: revenue
    };
  }

  // Get creator revenue
  async getCreatorRevenue(userId, period = '30d') {
    const videos = await this.analyticsService.getUserVideos(userId);
    const videoIds = videos.map(v => v.id);

    const allRevenue = await Promise.all(
      videoIds.map(videoId => this.getVideoRevenue(videoId, period))
    );

    const totalRevenue = allRevenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalImpressions = allRevenue.reduce((sum, r) => sum + r.totalImpressions, 0);
    const totalClicks = allRevenue.reduce((sum, r) => sum + r.totalClicks, 0);

    // Revenue share (creator gets 55%, platform gets 45%)
    const creatorShare = totalRevenue * 0.55;
    const platformShare = totalRevenue * 0.45;

    return {
      userId,
      period,
      totalRevenue,
      creatorShare: parseFloat(creatorShare.toFixed(2)),
      platformShare: parseFloat(platformShare.toFixed(2)),
      totalImpressions,
      totalClicks,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0,
      videoCount: videoIds.length,
      avgRevenuePerVideo: videoIds.length > 0 ? (totalRevenue / videoIds.length).toFixed(2) : 0
    };
  }

  // Get revenue analytics
  async getRevenueAnalytics(userId, period = '30d') {
    const revenue = await this.getCreatorRevenue(userId, period);

    // Generate timeline
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const timeline = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Get impressions for that day
      const dayImpressions = await this.revenueRepository.findByDate(userId, dateStr);
      const dayRevenue = dayImpressions.reduce((sum, imp) => {
        return sum + this.calculateRevenue(1, imp.adType);
      }, 0);

      timeline.push({
        date: dateStr,
        impressions: dayImpressions.length,
        revenue: parseFloat(dayRevenue.toFixed(2))
      });
    }

    return {
      ...revenue,
      timeline,
      projectedMonthly: parseFloat((revenue.creatorShare * (30 / days)).toFixed(2))
    };
  }

  // Estimate earnings potential
  async estimateEarnings(videoViews, engagementRate = 0.7) {
    // Assume average of 2 ads per video view
    const avgAdsPerView = 2;
    const totalImpressions = videoViews * avgAdsPerView * engagementRate;

    // Mix of ad types (weighted average)
    const avgCPM = (
      this.cpmRates.preRoll * 0.4 +
      this.cpmRates.midRoll * 0.3 +
      this.cpmRates.postRoll * 0.2 +
      this.cpmRates.display * 0.1
    );

    const estimatedRevenue = (totalImpressions / 1000) * avgCPM;
    const creatorShare = estimatedRevenue * 0.55;

    return {
      videoViews,
      estimatedImpressions: Math.round(totalImpressions),
      estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
      creatorEarnings: parseFloat(creatorShare.toFixed(2)),
      avgCPM: parseFloat(avgCPM.toFixed(2))
    };
  }

  // Get top earning videos
  async getTopEarningVideos(userId, limit = 10, period = '30d') {
    const videos = await this.analyticsService.getUserVideos(userId);

    const revenues = await Promise.all(
      videos.map(async video => {
        const revenue = await this.getVideoRevenue(video.id, period);
        return {
          videoId: video.id,
          title: video.title,
          revenue: revenue.totalRevenue,
          impressions: revenue.totalImpressions,
          ctr: revenue.ctr
        };
      })
    );

    return revenues
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }
}

export default AdRevenueService;
