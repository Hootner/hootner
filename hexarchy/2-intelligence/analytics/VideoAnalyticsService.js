// Video Analytics Service
import { logger } from '../../0-core/logging/logger.js';

export class VideoAnalyticsService {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  // Track video view
  async trackView(videoId, userId, metadata = {}) {
    try {
      await this.analyticsRepository.create({
        videoId,
        userId,
        eventType: 'view',
        timestamp: new Date().toISOString(),
        metadata: {
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          referrer: metadata.referrer
        }
      });

      logger.info('Video view tracked', { videoId, userId });
    } catch (error) {
      logger.error('Failed to track video view:', error);
    }
  }

  // Track video engagement (watch time, completion)
  async trackEngagement(videoId, userId, data) {
    try {
      const { watchTime, completed, percentWatched } = data;

      await this.analyticsRepository.create({
        videoId,
        userId,
        eventType: 'engagement',
        timestamp: new Date().toISOString(),
        metadata: {
          watchTime,
          completed,
          percentWatched
        }
      });

      logger.info('Video engagement tracked', { videoId, userId, percentWatched });
    } catch (error) {
      logger.error('Failed to track engagement:', error);
    }
  }

  // Get video analytics
  async getVideoAnalytics(videoId, period = '30d') {
    const analytics = await this.analyticsRepository.findByVideoId(videoId, period);

    return {
      videoId,
      period,
      totalViews: this.calculateTotalViews(analytics),
      uniqueViews: this.calculateUniqueViews(analytics),
      avgWatchTime: this.calculateAvgWatchTime(analytics),
      completionRate: this.calculateCompletionRate(analytics),
      engagement: this.calculateEngagement(analytics),
      demographics: this.calculateDemographics(analytics),
      timeline: this.generateTimeline(analytics, period)
    };
  }

  // Calculate total views
  calculateTotalViews(analytics) {
    return analytics.filter(a => a.eventType === 'view').length;
  }

  // Calculate unique views
  calculateUniqueViews(analytics) {
    const uniqueUsers = new Set(
      analytics
        .filter(a => a.eventType === 'view')
        .map(a => a.userId)
    );
    return uniqueUsers.size;
  }

  // Calculate average watch time
  calculateAvgWatchTime(analytics) {
    const engagements = analytics.filter(a => a.eventType === 'engagement');
    if (engagements.length === 0) return 0;

    const totalWatchTime = engagements.reduce((sum, a) => sum + (a.metadata.watchTime || 0), 0);
    return totalWatchTime / engagements.length;
  }

  // Calculate completion rate
  calculateCompletionRate(analytics) {
    const engagements = analytics.filter(a => a.eventType === 'engagement');
    if (engagements.length === 0) return 0;

    const completed = engagements.filter(a => a.metadata.completed).length;
    return (completed / engagements.length) * 100;
  }

  // Calculate engagement score
  calculateEngagement(analytics) {
    const views = this.calculateTotalViews(analytics);
    const likes = analytics.filter(a => a.eventType === 'like').length;
    const comments = analytics.filter(a => a.eventType === 'comment').length;
    const shares = analytics.filter(a => a.eventType === 'share').length;

    return {
      views,
      likes,
      comments,
      shares,
      engagementRate: views > 0 ? ((likes + comments + shares) / views) * 100 : 0
    };
  }

  // Calculate demographics
  calculateDemographics(analytics) {
    // This would require user profile data
    return {
      topCountries: [],
      ageGroups: {},
      devices: {}
    };
  }

  // Generate timeline data
  generateTimeline(analytics, period) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const timeline = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayAnalytics = analytics.filter(a =>
        a.timestamp.startsWith(dateStr)
      );

      timeline.push({
        date: dateStr,
        views: dayAnalytics.filter(a => a.eventType === 'view').length,
        likes: dayAnalytics.filter(a => a.eventType === 'like').length,
        comments: dayAnalytics.filter(a => a.eventType === 'comment').length
      });
    }

    return timeline;
  }

  // Get user watch history
  async getUserWatchHistory(userId, limit = 50) {
    const analytics = await this.analyticsRepository.findByUserId(userId);

    const views = analytics
      .filter(a => a.eventType === 'view')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return views;
  }

  // Get trending videos
  async getTrendingVideos(limit = 10, period = '7d') {
    const analytics = await this.analyticsRepository.findRecent(period);

    const videoStats = {};

    analytics.forEach(a => {
      if (!videoStats[a.videoId]) {
        videoStats[a.videoId] = { views: 0, likes: 0, comments: 0, shares: 0 };
      }

      if (a.eventType === 'view') videoStats[a.videoId].views++;
      else if (a.eventType === 'like') videoStats[a.videoId].likes++;
      else if (a.eventType === 'comment') videoStats[a.videoId].comments++;
      else if (a.eventType === 'share') videoStats[a.videoId].shares++;
    });

    // Calculate trend score
    const trending = Object.entries(videoStats)
      .map(([videoId, stats]) => ({
        videoId,
        trendScore: stats.views + (stats.likes * 10) + (stats.comments * 5) + (stats.shares * 15)
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, limit);

    return trending;
  }

  // Track user activity
  async trackActivity(userId, activityType, metadata = {}) {
    try {
      await this.analyticsRepository.create({
        userId,
        eventType: activityType,
        timestamp: new Date().toISOString(),
        metadata
      });

      logger.info('User activity tracked', { userId, activityType });
    } catch (error) {
      logger.error('Failed to track activity:', error);
    }
  }
}

export default VideoAnalyticsService;
