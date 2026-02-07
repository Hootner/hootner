export class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
    this.plans = new Map([
      ['basic', { price: 9.99, features: ['streaming', 'hd'] }],
      ['premium', { price: 19.99, features: ['streaming', '4k', 'downloads'] }],
      ['enterprise', { price: 99.99, features: ['streaming', '8k', 'api', 'analytics'] }]
    ]);
  }

  subscribe(userId, planId) {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error('Invalid plan');
    
    this.subscriptions.set(userId, {
      planId,
      startDate: Date.now(),
      status: 'active',
      ...plan
    });
    return { userId, planId, status: 'active' };
  }

  cancel(userId) {
    const sub = this.subscriptions.get(userId);
    if (sub) sub.status = 'cancelled';
  }

  getRevenue() {
    return Array.from(this.subscriptions.values())
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.price, 0);
  }
}

export default new SubscriptionManager();
