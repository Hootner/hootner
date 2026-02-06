// Notification Domain Model
export class Notification {
  constructor({
    id,
    userId,
    tenantId,
    type,
    title,
    message,
    data = {},
    isRead = false,
    readAt = null,
    priority = 'normal',
    actionUrl = null,
    expiresAt = null,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.type = type;
    this.title = title;
    this.message = message;
    this.data = data;
    this.isRead = isRead;
    this.readAt = readAt;
    this.priority = priority;
    this.actionUrl = actionUrl;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Business methods
  markAsRead() {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date().toISOString();
      this.updatedAt = new Date().toISOString();
    }
  }

  markAsUnread() {
    this.isRead = false;
    this.readAt = null;
    this.updatedAt = new Date().toISOString();
  }

  isExpired() {
    if (!this.expiresAt) return false;
    return new Date(this.expiresAt) < new Date();
  }

  isHighPriority() {
    return this.priority === 'high' || this.priority === 'urgent';
  }

  toJSON() {
    return { ...this };
  }
}

export default Notification;
