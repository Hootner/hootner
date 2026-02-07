// User Behavior Analytics
import { logger } from '../../0-core/logging/logger.js';

export class UserBehaviorAnalytics {
  constructor(analyticsRepository) {
    this.analyticsRepository = analyticsRepository;
  }

  // Analyze user behavior patterns
  async analyzeUserBehavior(userId, period = '30d') {
    const activities = await this.analyticsRepository.findByUserId(userId, period);

    return {
      userId,
      period,
      activitySummary: this.getActivitySummary(activities),
      watchPatterns: this.analyzeWatchPatterns(activities),
      engagementLevel: this.calculateEngagementLevel(activities),
      preferences: this.extractPreferences(activities),
      sessionMetrics: this.analyzeSessionMetrics(activities)
    };
  }

  // Get activity summary
  getActivitySummary(activities) {
    return {
      totalActivities: activities.length,
      videoViews: activities.filter(a => a.eventType === 'view').length,
      likes: activities.filter(a => a.eventType === 'like').length,
      comments: activities.filter(a => a.eventType === 'comment').length,
      shares: activities.filter(a => a.eventType === 'share').length,
      uploads: activities.filter(a => a.eventType === 'upload').length
    };
  }

  // Analyze watch patterns
  analyzeWatchPatterns(activities) {
    const views = activities.filter(a => a.eventType === 'view');

    // Time of day distribution
    const hourlyDistribution = new Array(24).fill(0);
    views.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourlyDistribution[hour]++;
    });

    // Day of week distribution
    const dayDistribution = new Array(7).fill(0);
    views.forEach(view => {
      const day = new Date(view.timestamp).getDay();
      dayDistribution[day]++;
    });

    // Peak viewing hours
    const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      dayDistribution.indexOf(Math.max(...dayDistribution))
    ];

    return {
      hourlyDistribution,
      dayDistribution,
      peakHour,
      peakDay,
      averageSessionLength: this.calculateAvgSessionLength(activities)
    };
  }

  // Calculate engagement level
  calculateEngagementLevel(activities) {
    const views = activities.filter(a => a.eventType === 'view').length;
    const interactions = activities.filter(a =>
      ['like', 'comment', 'share', 'subscribe'].includes(a.eventType)
    ).length;

    const engagementRate = views > 0 ? (interactions / views) * 100 : 0;

    let level = 'Low';
    if (engagementRate > 20) level = 'High';
    else if (engagementRate > 10) level = 'Medium';

    return {
      level,
      rate: engagementRate,
      totalInteractions: interactions
    };
  }

  // Extract user preferences
  extractPreferences(activities) {
    const categoryCount = {};
    const authorCount = {};

    activities.forEach(activity => {
      if (activity.metadata?.category) {
        categoryCount[activity.metadata.category] = (categoryCount[activity.metadata.category] || 0) + 1;
      }
      if (activity.metadata?.authorId) {
        authorCount[activity.metadata.authorId] = (authorCount[activity.metadata.authorId] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    const topAuthors = Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([authorId, count]) => ({ authorId, count }));

    return {
      topCategories,
      topAuthors
    };
  }

  // Analyze session metrics
  analyzeSessionMetrics(activities) {
    // Group activities into sessions (gap > 30 min = new session)
    const sessions = [];
    let currentSession = [];

    activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    activities.forEach((activity, index) => {
      if (index === 0) {
        currentSession.push(activity);
      } else {
        const prevTime = new Date(activities[index - 1].timestamp);
        const currTime = new Date(activity.timestamp);
        const gap = (currTime - prevTime) / (1000 * 60); // minutes

        if (gap > 30) {
          sessions.push(currentSession);
          currentSession = [activity];
        } else {
          currentSession.push(activity);
        }
      }
    });

    if (currentSession.length > 0) {
      sessions.push(currentSession);
    }

    const avgSessionLength = sessions.reduce((sum, session) => {
      const start = new Date(session[0].timestamp);
      const end = new Date(session[session.length - 1].timestamp);
      return sum + ((end - start) / (1000 * 60)); // minutes
    }, 0) / sessions.length;

    return {
      totalSessions: sessions.length,
      avgSessionLength: avgSessionLength || 0,
      avgActivitiesPerSession: activities.length / sessions.length
    };
  }

  // Calculate average session length
  calculateAvgSessionLength(activities) {
    if (activities.length === 0) return 0;

    const sessions = this.analyzeSessionMetrics(activities);
    return sessions.avgSessionLength;
  }

  // Get user cohort analysis
  async getCohortAnalysis(cohortStartDate, cohortEndDate) {
    // Users who joined in the cohort period
    const cohortUsers = await this.analyticsRepository.getUsersByJoinDate(cohortStartDate, cohortEndDate);

    const analysis = {
      cohortSize: cohortUsers.length,
      retention: {},
      engagement: {}
    };

    // Calculate retention for each week
    for (let week = 0; week < 12; week++) {
      const weekStart = new Date(cohortEndDate);
      weekStart.setDate(weekStart.getDate() + (week * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const activeUsers = await this.analyticsRepository.getActiveUsersInPeriod(
        cohortUsers.map(u => u.id),
        weekStart.toISOString(),
        weekEnd.toISOString()
      );

      analysis.retention[`week${week}`] = {
        activeUsers: activeUsers.length,
        retentionRate: (activeUsers.length / cohortUsers.length) * 100
      };
    }

    return analysis;
  }
}

export default UserBehaviorAnalytics;
