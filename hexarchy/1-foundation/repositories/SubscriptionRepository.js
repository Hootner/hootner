// Subscription Repository
import { BaseRepository } from './BaseRepository.js';
import { Subscription } from '../models/Subscription.js';

export class SubscriptionRepository extends BaseRepository {
  constructor() {
    super(process.env.SUBSCRIPTIONS_TABLE || 'Subscriptions');
  }

  async create(subscriptionData) {
    const subscription = new Subscription({
      id: `sub-${Date.now()}`,
      ...subscriptionData
    });
    await super.create(subscription);
    return subscription;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Subscription(data) : null;
  }

  async findByUser(userId) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: 1, ScanIndexForward: false }
    );
    return results.length > 0 ? new Subscription(results[0]) : null;
  }

  async findByStripeId(stripeSubscriptionId) {
    const results = await this.query(
      'stripeSubscriptionId = :stripeId',
      { ':stripeId': stripeSubscriptionId },
      { IndexName: 'StripeIndex', Limit: 1 }
    );
    return results.length > 0 ? new Subscription(results[0]) : null;
  }

  async findActiveSubscriptions(limit = 100) {
    const results = await this.query(
      '#status = :status',
      { ':status': 'active' },
      {
        IndexName: 'StatusIndex',
        Limit: limit,
        ExpressionAttributeNames: { '#status': 'status' }
      }
    );
    return results.map(data => new Subscription(data));
  }

  async cancel(id) {
    return await this.update(id, {
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString()
    });
  }

  async reactivate(id) {
    return await this.update(id, {
      cancelAtPeriodEnd: false,
      status: 'active',
      updatedAt: new Date().toISOString()
    });
  }
}

export default SubscriptionRepository;
