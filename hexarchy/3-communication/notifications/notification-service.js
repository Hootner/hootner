/**
 * Notification Service
 * Multi-channel notification delivery
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('communication', 'notifications');

class NotificationService {
  constructor() {
    this.channels = {
      email: { enabled: true, handler: this._sendEmail.bind(this) },
      push: { enabled: true, handler: this._sendPush.bind(this) },
      inApp: { enabled: true, handler: this._sendInApp.bind(this) },
      sms: { enabled: false, handler: this._sendSMS.bind(this) }
    };
    this.userPreferences = new Map();
    this.notificationQueue = [];
    this._setupEventListeners();
  }

  _setupEventListeners() {
    eventBus.subscribe(EventTypes.NOTIFICATION_TRIGGERED, async (event) => {
      await this.send(event.payload);
    });
  }

  /**
   * Send notification through appropriate channels
   */
  async send(notification) {
    const { userId, type, title, message, priority = 'normal', channels = ['inApp'] } = notification;

    logger.info('Sending notification', { userId, type, priority });

    const userPrefs = this._getUserPreferences(userId);
    const enabledChannels = channels.filter(ch => 
      this.channels[ch]?.enabled && userPrefs.channels.includes(ch)
    );

    const results = await Promise.allSettled(
      enabledChannels.map(channel => 
        this.channels[channel].handler({
          userId,
          type,
          title,
          message,
          timestamp: Date.now()
        })
      )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    logger.info('Notification sent', {
      userId,
      sent,
      failed,
      channels: enabledChannels
    });

    return { sent, failed, channels: enabledChannels };
  }

  async _sendEmail(notification) {
    logger.debug('Sending email notification', { userId: notification.userId });
    // Would integrate with email service (SendGrid, etc.)
    return { channel: 'email', status: 'sent' };
  }

  async _sendPush(notification) {
    logger.debug('Sending push notification', { userId: notification.userId });
    // Would integrate with push service (FCM, etc.)
    return { channel: 'push', status: 'sent' };
  }

  async _sendInApp(notification) {
    logger.debug('Sending in-app notification', { userId: notification.userId });
    // Would store in database and emit event to UI
    this.notificationQueue.push({
      ...notification,
      id: crypto.randomUUID(),
      read: false
    });
    return { channel: 'inApp', status: 'sent' };
  }

  async _sendSMS(notification) {
    logger.debug('Sending SMS notification', { userId: notification.userId });
    // Would integrate with SMS service (Twilio, etc.)
    return { channel: 'sms', status: 'sent' };
  }

  _getUserPreferences(userId) {
    if (!this.userPreferences.has(userId)) {
      return {
        channels: ['inApp', 'push'],
        quietHours: { enabled: false },
        frequency: 'all'
      };
    }
    return this.userPreferences.get(userId);
  }

  /**
   * Get unread notifications for user
   */
  getUnread(userId) {
    return this.notificationQueue
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Mark notification as read
   */
  markRead(notificationId) {
    const notification = this.notificationQueue.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      logger.debug('Marked notification as read', { notificationId });
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
