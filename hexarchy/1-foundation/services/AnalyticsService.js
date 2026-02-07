// Analytics Service
import ActivityRepository from '../repositories/ActivityRepository.js';
import { Activity } from '../models/Activity.js';

export class AnalyticsService {
  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async trackActivity(activityData) {
    return await this.activityRepository.create(activityData);
  }

  async trackVideoView(userId, videoId, ipAddress, userAgent) {
    return await this.trackActivity({
      userId,
      type: 'video',
      action: 'video.viewed',
      resourceType: 'video',
      resourceId: videoId,
      ipAddress,
      userAgent
    });
  }

  async trackVideoLike(userId, videoId, ipAddress, userAgent) {
    return await this.trackActivity({
      userId,
      type: 'video',
      action: 'video.liked',
      resourceType: 'video',
      resourceId: videoId,
      ipAddress,
      userAgent
    });
  }

  async trackUserLogin(userId, ipAddress, userAgent) {
    return await this.trackActivity({
      userId,
      type: 'user',
      action: 'user.login',
      resourceType: 'user',
      resourceId: userId,
      ipAddress,
      userAgent
    });
  }

  async trackSubscriptionPurchase(userId, subscriptionId, metadata) {
    return await this.trackActivity({
      userId,
      type: 'subscription',
      action: 'subscription.purchased',
      resourceType: 'subscription',
      resourceId: subscriptionId,
      metadata
    });
  }

  async getUserActivity(userId, limit = 100) {
    return await this.activityRepository.findByUser(userId, limit);
  }

  async getVideoActivity(videoId, limit = 100) {
    return await this.activityRepository.findByResource('video', videoId, limit);
  }

  async getActivityByType(type, limit = 100) {
    return await this.activityRepository.findByType(type, limit);
  }

  async getRecentActivity(userId, limit = 50) {
    return await this.activityRepository.getRecentActivity(userId, limit);
  }
}

export default AnalyticsService;
