// Analytics Domain Model
export class Analytics {
  constructor({
    id,
    userId,
    tenantId,
    videoId = null,
    metricType,
    value,
    dimensions = {},
    timestamp,
    createdAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.videoId = videoId;
    this.metricType = metricType;
    this.value = value;
    this.dimensions = dimensions;
    this.timestamp = timestamp || Date.now();
    this.createdAt = createdAt || new Date().toISOString();
  }

  // Business methods
  isVideoMetric() {
    return this.videoId !== null;
  }

  isUserMetric() {
    return ['user.login', 'user.signup', 'user.subscription'].includes(this.metricType);
  }

  isRevenueMetric() {
    return ['revenue.payment', 'revenue.subscription'].includes(this.metricType);
  }

  toJSON() {
    return { ...this };
  }
}

export default Analytics;
