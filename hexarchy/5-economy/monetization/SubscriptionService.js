// Subscription Management Service
import { logger } from '../../0-core/logging/logger.js';

export class SubscriptionService {
  constructor(subscriptionRepository, paymentService) {
    this.subscriptionRepository = subscriptionRepository;
    this.paymentService = paymentService;

    // Subscription tiers
    this.tiers = {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: {
          videoUploads: 5,
          maxVideoSize: 100 * 1024 * 1024, // 100MB
          ads: true,
          analytics: false,
          customThumbnails: false,
          liveStreaming: false
        }
      },
      basic: {
        id: 'basic',
        name: 'Basic',
        price: 4.99,
        interval: 'month',
        features: {
          videoUploads: 50,
          maxVideoSize: 500 * 1024 * 1024, // 500MB
          ads: false,
          analytics: true,
          customThumbnails: true,
          liveStreaming: false
        }
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        interval: 'month',
        features: {
          videoUploads: 200,
          maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB
          ads: false,
          analytics: true,
          customThumbnails: true,
          liveStreaming: true,
          prioritySupport: true
        }
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        interval: 'month',
        features: {
          videoUploads: 'unlimited',
          maxVideoSize: 10 * 1024 * 1024 * 1024, // 10GB
          ads: false,
          analytics: true,
          customThumbnails: true,
          liveStreaming: true,
          prioritySupport: true,
          teamCollaboration: true,
          whiteLabel: true
        }
      }
    };
  }

  // Get all subscription tiers
  getAvailableTiers() {
    return Object.values(this.tiers);
  }

  // Get tier details
  getTier(tierId) {
    return this.tiers[tierId] || null;
  }

  // Create subscription
  async createSubscription(userId, tierId, paymentMethodId) {
    try {
      const tier = this.getTier(tierId);
      if (!tier) {
        throw new Error('Invalid subscription tier');
      }

      // Create payment intent if not free
      let paymentIntentId = null;
      if (tier.price > 0) {
        const payment = await this.paymentService.createPaymentIntent({
          amount: tier.price * 100, // Convert to cents
          currency: 'usd',
          paymentMethodId,
          customerId: userId,
          metadata: { tierId, type: 'subscription' }
        });
        paymentIntentId = payment.id;
      }

      // Create subscription record
      const subscription = await this.subscriptionRepository.create({
        userId,
        tierId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: this.calculatePeriodEnd(tier.interval),
        paymentIntentId,
        createdAt: new Date().toISOString()
      });

      logger.info('Subscription created', { userId, tierId, subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription:', error);
      throw error;
    }
  }

  // Calculate period end date
  calculatePeriodEnd(interval) {
    const now = new Date();
    if (interval === 'month') {
      now.setMonth(now.getMonth() + 1);
    } else if (interval === 'year') {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
  }

  // Get user subscription
  async getUserSubscription(userId) {
    const subscription = await this.subscriptionRepository.findByUserId(userId);
    if (!subscription) {
      // Return free tier as default
      return {
        userId,
        tierId: 'free',
        status: 'active',
        ...this.tiers.free
      };
    }

    // Add tier details
    const tier = this.getTier(subscription.tierId);
    return { ...subscription, ...tier };
  }

  // Update subscription
  async updateSubscription(subscriptionId, newTierId) {
    try {
      const subscription = await this.subscriptionRepository.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const newTier = this.getTier(newTierId);
      if (!newTier) {
        throw new Error('Invalid tier');
      }

      // Handle payment for upgrade
      if (newTier.price > 0 && subscription.tierId !== newTierId) {
        await this.handleUpgrade(subscription, newTier);
      }

      // Update subscription
      subscription.tierId = newTierId;
      subscription.updatedAt = new Date().toISOString();

      await this.subscriptionRepository.update(subscriptionId, subscription);

      logger.info('Subscription updated', { subscriptionId, newTierId });
      return subscription;
    } catch (error) {
      logger.error('Failed to update subscription:', error);
      throw error;
    }
  }

  // Handle subscription upgrade
  async handleUpgrade(subscription, newTier) {
    const oldTier = this.getTier(subscription.tierId);
    const priceDiff = newTier.price - oldTier.price;

    if (priceDiff > 0) {
      // Prorate remaining time
      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);
      const remainingDays = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
      const proratedAmount = (priceDiff / 30) * remainingDays;

      // Charge prorated amount
      await this.paymentService.createPaymentIntent({
        amount: Math.round(proratedAmount * 100),
        currency: 'usd',
        customerId: subscription.userId,
        metadata: { type: 'upgrade', subscriptionId: subscription.id }
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.subscriptionRepository.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.status = 'canceled';
      subscription.canceledAt = new Date().toISOString();

      await this.subscriptionRepository.update(subscriptionId, subscription);

      logger.info('Subscription canceled', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Renew subscription
  async renewSubscription(subscriptionId) {
    try {
      const subscription = await this.subscriptionRepository.findById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const tier = this.getTier(subscription.tierId);

      // Process payment
      if (tier.price > 0) {
        await this.paymentService.createPaymentIntent({
          amount: tier.price * 100,
          currency: 'usd',
          customerId: subscription.userId,
          metadata: { type: 'renewal', subscriptionId }
        });
      }

      // Update period
      subscription.currentPeriodStart = new Date().toISOString();
      subscription.currentPeriodEnd = this.calculatePeriodEnd(tier.interval);
      subscription.status = 'active';

      await this.subscriptionRepository.update(subscriptionId, subscription);

      logger.info('Subscription renewed', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Failed to renew subscription:', error);
      subscription.status = 'past_due';
      await this.subscriptionRepository.update(subscriptionId, subscription);
      throw error;
    }
  }

  // Check feature access
  hasFeatureAccess(subscription, feature) {
    const tier = this.getTier(subscription.tierId);
    return tier?.features?.[feature] || false;
  }

  // Get usage statistics
  async getUsageStats(userId) {
    const subscription = await this.getUserSubscription(userId);
    const tier = this.getTier(subscription.tierId);

    // Get actual usage (would come from analytics)
    const usage = {
      videoUploads: 0, // Placeholder
      storageUsed: 0
    };

    return {
      tier: tier.name,
      limits: tier.features,
      usage,
      remaining: {
        videoUploads: tier.features.videoUploads === 'unlimited'
          ? 'unlimited'
          : tier.features.videoUploads - usage.videoUploads
      }
    };
  }
}

export default SubscriptionService;
