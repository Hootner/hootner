// Subscription Domain Model
export class Subscription {
  constructor({
    id,
    userId,
    tenantId,
    plan,
    status = 'active',
    stripeSubscriptionId,
    stripeCustomerId,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd = false,
    trialEnd = null,
    metadata = {},
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.plan = plan;
    this.status = status;
    this.stripeSubscriptionId = stripeSubscriptionId;
    this.stripeCustomerId = stripeCustomerId;
    this.currentPeriodStart = currentPeriodStart;
    this.currentPeriodEnd = currentPeriodEnd;
    this.cancelAtPeriodEnd = cancelAtPeriodEnd;
    this.trialEnd = trialEnd;
    this.metadata = metadata;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Business methods
  isActive() {
    return this.status === 'active';
  }

  isTrialing() {
    return this.status === 'trialing' && this.trialEnd && new Date(this.trialEnd) > new Date();
  }

  isCanceled() {
    return this.status === 'canceled';
  }

  isPastDue() {
    return this.status === 'past_due';
  }

  hasAccess() {
    return ['active', 'trialing'].includes(this.status);
  }

  daysUntilRenewal() {
    if (!this.currentPeriodEnd) return null;
    const now = new Date();
    const end = new Date(this.currentPeriodEnd);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  cancel() {
    this.cancelAtPeriodEnd = true;
    this.updatedAt = new Date().toISOString();
  }

  reactivate() {
    this.cancelAtPeriodEnd = false;
    this.status = 'active';
    this.updatedAt = new Date().toISOString();
  }

  expire() {
    this.status = 'canceled';
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return { ...this };
  }
}

export default Subscription;
