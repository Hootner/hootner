/**
 * Data Analytics Engine
 * Tracks KPIs, user metrics, and business intelligence
 */

import { EventEmitter } from 'events';

export class AnalyticsEngine extends EventEmitter {
  constructor(db, redis) {
    super();
    this.db = db;
    this.redis = redis;
    this.metrics = new Map();
  }

  // Core KPIs
  async getKPIs(timeRange = '24h') {
    const startTime = this.getStartTime(timeRange);
    
    const [
      activeUsers,
      totalVideos,
      videoViews,
      revenue,
      storageUsed,
      apiRequests
    ] = await Promise.all([
      this.getActiveUsers(startTime),
      this.getTotalVideos(startTime),
      this.getVideoViews(startTime),
      this.getRevenue(startTime),
      this.getStorageUsed(),
      this.getAPIRequests(startTime)
    ]);

    return {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: {
        activeUsers,
        totalVideos,
        videoViews,
        revenue,
        storageUsed,
        apiRequests,
        avgVideoLength: await this.getAvgVideoLength(),
        conversionRate: await this.getConversionRate(startTime),
        churnRate: await this.getChurnRate(startTime)
      }
    };
  }

  // User Metrics
  async getActiveUsers(startTime) {
    const dau = await this.db.collection('activity_logs').distinct('userId', {
      timestamp: { $gte: startTime }
    });
    
    const mau = await this.db.collection('activity_logs').distinct('userId', {
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    return {
      dau: dau.length,
      mau: mau.length,
      dauMauRatio: (dau.length / mau.length * 100).toFixed(2)
    };
  }

  // Video Metrics
  async getTotalVideos(startTime) {
    const total = await this.db.collection('videos').countDocuments();
    const newVideos = await this.db.collection('videos').countDocuments({
      createdAt: { $gte: startTime }
    });

    return { total, new: newVideos };
  }

  async getVideoViews(startTime) {
    const views = await this.db.collection('video_views').aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: {
        _id: null,
        totalViews: { $sum: 1 },
        uniqueViewers: { $addToSet: '$userId' },
        totalWatchTime: { $sum: '$watchTime' }
      }}
    ]).toArray();

    const result = views[0] || { totalViews: 0, uniqueViewers: [], totalWatchTime: 0 };
    
    return {
      total: result.totalViews,
      unique: result.uniqueViewers.length,
      avgWatchTime: result.totalViews > 0 ? (result.totalWatchTime / result.totalViews).toFixed(2) : 0
    };
  }

  // Revenue Metrics
  async getRevenue(startTime) {
    const payments = await this.db.collection('payments').aggregate([
      { $match: { 
        createdAt: { $gte: startTime },
        status: 'succeeded'
      }},
      { $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgTransaction: { $avg: '$amount' }
      }}
    ]).toArray();

    const result = payments[0] || { total: 0, count: 0, avgTransaction: 0 };
    
    return {
      total: result.total / 100, // Convert from cents
      transactions: result.count,
      avgTransaction: (result.avgTransaction / 100).toFixed(2),
      mrr: await this.getMRR()
    };
  }

  async getMRR() {
    const subscriptions = await this.db.collection('subscriptions').aggregate([
      { $match: { status: 'active' } },
      { $group: {
        _id: null,
        total: { $sum: '$amount' }
      }}
    ]).toArray();

    return subscriptions[0]?.total / 100 || 0;
  }

  // Storage Metrics
  async getStorageUsed() {
    const storage = await this.db.collection('videos').aggregate([
      { $group: {
        _id: null,
        totalBytes: { $sum: '$fileSize' },
        totalVideos: { $sum: 1 }
      }}
    ]).toArray();

    const result = storage[0] || { totalBytes: 0, totalVideos: 0 };
    
    return {
      totalGB: (result.totalBytes / (1024 ** 3)).toFixed(2),
      totalVideos: result.totalVideos,
      avgVideoSize: result.totalVideos > 0 ? 
        (result.totalBytes / result.totalVideos / (1024 ** 2)).toFixed(2) : 0
    };
  }

  // API Metrics
  async getAPIRequests(startTime) {
    const cached = await this.redis.get(`api_requests:${startTime.getTime()}`);
    if (cached) return JSON.parse(cached);

    const requests = await this.db.collection('api_logs').aggregate([
      { $match: { timestamp: { $gte: startTime } } },
      { $group: {
        _id: '$endpoint',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
        errors: { $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] } }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    const result = {
      topEndpoints: requests,
      totalRequests: requests.reduce((sum, r) => sum + r.count, 0),
      errorRate: requests.reduce((sum, r) => sum + r.errors, 0) / 
                 requests.reduce((sum, r) => sum + r.count, 1) * 100
    };

    await this.redis.setex(`api_requests:${startTime.getTime()}`, 300, JSON.stringify(result));
    
    return result;
  }

  // Business Metrics
  async getConversionRate(startTime) {
    const signups = await this.db.collection('users').countDocuments({
      createdAt: { $gte: startTime }
    });
    
    const conversions = await this.db.collection('subscriptions').countDocuments({
      createdAt: { $gte: startTime }
    });

    return signups > 0 ? ((conversions / signups) * 100).toFixed(2) : 0;
  }

  async getChurnRate(startTime) {
    const startOfMonth = new Date(startTime.getFullYear(), startTime.getMonth(), 1);
    const endOfMonth = new Date(startTime.getFullYear(), startTime.getMonth() + 1, 0);

    const activeStart = await this.db.collection('subscriptions').countDocuments({
      createdAt: { $lt: startOfMonth },
      status: 'active'
    });

    const cancelled = await this.db.collection('subscriptions').countDocuments({
      cancelledAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    return activeStart > 0 ? ((cancelled / activeStart) * 100).toFixed(2) : 0;
  }

  async getAvgVideoLength() {
    const result = await this.db.collection('videos').aggregate([
      { $group: {
        _id: null,
        avgDuration: { $avg: '$duration' }
      }}
    ]).toArray();

    return result[0]?.avgDuration?.toFixed(2) || 0;
  }

  // Real-time metrics tracking
  trackEvent(event, data) {
    const metric = {
      event,
      data,
      timestamp: new Date()
    };

    this.emit('metric', metric);
    
    // Store in Redis for real-time access
    this.redis.lpush('metrics:realtime', JSON.stringify(metric));
    this.redis.ltrim('metrics:realtime', 0, 999); // Keep last 1000 events
    
    // Store in MongoDB for historical analysis
    this.db.collection('metrics').insertOne(metric);
  }

  // Generate analytics report
  async generateReport(startDate, endDate) {
    const kpis = await this.getKPIs('custom');
    
    return {
      reportId: `report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      summary: kpis,
      recommendations: this.generateRecommendations(kpis)
    };
  }

  generateRecommendations(kpis) {
    const recommendations = [];

    if (kpis.metrics.churnRate > 5) {
      recommendations.push({
        priority: 'high',
        category: 'retention',
        message: 'Churn rate exceeds 5%. Consider user engagement campaigns.'
      });
    }

    if (kpis.metrics.conversionRate < 2) {
      recommendations.push({
        priority: 'medium',
        category: 'conversion',
        message: 'Low conversion rate. Review onboarding flow and pricing.'
      });
    }

    if (kpis.metrics.activeUsers.dauMauRatio < 20) {
      recommendations.push({
        priority: 'medium',
        category: 'engagement',
        message: 'DAU/MAU ratio below 20%. Improve daily engagement features.'
      });
    }

    return recommendations;
  }

  getStartTime(timeRange) {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    return new Date(now - (ranges[timeRange] || ranges['24h']));
  }
}
