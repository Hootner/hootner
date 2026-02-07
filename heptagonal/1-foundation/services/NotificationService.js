// Notification Service
import NotificationRepository from '../repositories/NotificationRepository.js';
import { sendEmail } from '../../0-core/notifications/email.js';
import { sendPush } from '../../0-core/notifications/push.js';

export class NotificationService {
  constructor() {
    this.repository = new NotificationRepository();
  }

  async createNotification(notificationData) {
    const notification = await this.repository.create(notificationData);

    // Send push notification if high priority
    if (notification.isHighPriority()) {
      await sendPush(notification.userId, notification.title, notification.message);
    }

    return notification;
  }

  async getNotificationsByUser(userId, limit = 100) {
    return await this.repository.findByUser(userId, limit);
  }

  async getUnreadNotifications(userId, limit = 100) {
    return await this.repository.findUnread(userId, limit);
  }

  async getUnreadCount(userId) {
    return await this.repository.getUnreadCount(userId);
  }

  async markAsRead(id) {
    return await this.repository.markAsRead(id);
  }

  async markAllAsRead(userId) {
    return await this.repository.markAllAsRead(userId);
  }

  // Notification templates
  async notifyVideoProcessed(userId, videoTitle) {
    return await this.createNotification({
      userId,
      type: 'video_processed',
      title: 'Video Processing Complete',
      message: `Your video "${videoTitle}" has been processed and is now live!`,
      priority: 'normal'
    });
  }

  async notifyNewComment(userId, videoTitle, commenterName) {
    return await this.createNotification({
      userId,
      type: 'new_comment',
      title: 'New Comment',
      message: `${commenterName} commented on "${videoTitle}"`,
      priority: 'normal'
    });
  }

  async notifyPaymentSuccess(userId, amount, currency) {
    return await this.createNotification({
      userId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your payment of ${currency.toUpperCase()} ${(amount / 100).toFixed(2)} was successful`,
      priority: 'high'
    });
  }

  async notifySubscriptionExpiring(userId, daysLeft) {
    return await this.createNotification({
      userId,
      type: 'subscription_expiring',
      title: 'Subscription Expiring Soon',
      message: `Your subscription will expire in ${daysLeft} days`,
      priority: 'high'
    });
  }
}

export default NotificationService;
