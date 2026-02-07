// Notification Repository
import { BaseRepository } from './BaseRepository.js';
import { Notification } from '../models/Notification.js';

export class NotificationRepository extends BaseRepository {
  constructor() {
    super(process.env.NOTIFICATIONS_TABLE || 'Notifications');
  }

  async create(notificationData) {
    const notification = new Notification({
      id: `notif-${Date.now()}`,
      ...notificationData
    });
    await super.create(notification);
    return notification;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Notification(data) : null;
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Notification(data));
  }

  async findUnread(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId AND isRead = :isRead',
      { ':userId': userId, ':isRead': false },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Notification(data));
  }

  async markAsRead(id) {
    return await this.update(id, {
      isRead: true,
      readAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async markAllAsRead(userId) {
    const unread = await this.findUnread(userId, 1000);
    await Promise.all(unread.map(n => this.markAsRead(n.id)));
    return unread.length;
  }

  async getUnreadCount(userId) {
    const unread = await this.findUnread(userId, 1000);
    return unread.length;
  }
}

export default NotificationRepository;
