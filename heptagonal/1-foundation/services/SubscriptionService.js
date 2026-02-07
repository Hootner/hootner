// Subscription Service
import SubscriptionRepository from '../repositories/SubscriptionRepository.js';
import { createSubscription, cancelSubscription, updateSubscription } from '../../0-core/payment/stripe.js';
import { sendWebhook, WEBHOOK_EVENTS } from '../../0-core/webhooks/sender.js';

export class SubscriptionService {
  constructor() {
    this.repository = new SubscriptionRepository();
  }

  async createSubscription(userId, plan, paymentMethodId, trialDays = 0) {
    // Create Stripe subscription
    const stripeSubscription = await createSubscription(userId, plan, paymentMethodId, trialDays);

    // Create subscription record
    const subscription = await this.repository.create({
      userId,
      plan,
      status: stripeSubscription.status,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null
    });

    // Webhook
    await sendWebhook(WEBHOOK_EVENTS.SUBSCRIPTION_CREATED, {
      subscriptionId: subscription.id,
      userId,
      plan
    });

    return subscription;
  }

  async getSubscriptionByUser(userId) {
    return await this.repository.findByUser(userId);
  }

  async cancelSubscription(subscriptionId, userId) {
    const subscription = await this.repository.findById(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Cancel with Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update subscription
    await this.repository.cancel(subscriptionId);

    // Webhook
    await sendWebhook(WEBHOOK_EVENTS.SUBSCRIPTION_CANCELLED, {
      subscriptionId,
      userId
    });

    return subscription;
  }

  async reactivateSubscription(subscriptionId) {
    const subscription = await this.repository.findById(subscriptionId);

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Reactivate with Stripe
    await updateSubscription(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update subscription
    await this.repository.reactivate(subscriptionId);

    return subscription;
  }

  async hasActiveSubscription(userId) {
    const subscription = await this.repository.findByUser(userId);
    return subscription?.hasAccess() || false;
  }
}

export default SubscriptionService;
