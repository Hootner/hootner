// Activity Domain Model
export class Activity {
  constructor({
    id,
    userId,
    tenantId,
    type,
    action,
    resourceType,
    resourceId,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    createdAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.type = type;
    this.action = action;
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    this.metadata = metadata;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.createdAt = createdAt || new Date().toISOString();
  }

  // Business methods
  isVideoActivity() {
    return this.resourceType === 'video';
  }

  isUserActivity() {
    return this.resourceType === 'user';
  }

  getActivityDescription() {
    const actions = {
      'video.viewed': 'watched a video',
      'video.liked': 'liked a video',
      'video.commented': 'commented on a video',
      'video.shared': 'shared a video',
      'user.followed': 'followed a user',
      'playlist.created': 'created a playlist',
      'subscription.purchased': 'purchased a subscription'
    };
    return actions[this.action] || this.action;
  }

  toJSON() {
    return { ...this };
  }
}

export default Activity;
