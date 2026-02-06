/**
 * Dynamic Pricing Engine
 * Adaptive pricing for marketplace and subscriptions
 */

import { createLogger } from '../../0-core/utils/logger.js';

const logger = createLogger('economy', 'pricing');

class PricingEngine {
  constructor() {
    this.basePrices = {
      'subscription.basic': 9.99,
      'subscription.premium': 29.99,
      'subscription.enterprise': 99.99,
      'marketplace.lesson': 5.00,
      'marketplace.course': 49.99,
      'tutoring.session': 25.00
    };
    this.discountRules = [];
    this.surgeRules = [];
  }

  /**
   * Calculate price with all modifiers
   */
  calculatePrice(itemType, context = {}) {
    const basePrice = this.basePrices[itemType];
    if (!basePrice) {
      throw new Error(`Unknown item type: ${itemType}`);
    }

    let finalPrice = basePrice;
    const modifiers = [];

    // Apply discounts
    const discounts = this._getApplicableDiscounts(itemType, context);
    discounts.forEach(discount => {
      const discountAmount = finalPrice * discount.percentage;
      finalPrice -= discountAmount;
      modifiers.push({
        type: 'discount',
        name: discount.name,
        amount: -discountAmount
      });
    });

    // Apply surge pricing
    const surge = this._getSurgePricing(itemType, context);
    if (surge) {
      const surgeAmount = finalPrice * surge.multiplier - finalPrice;
      finalPrice *= surge.multiplier;
      modifiers.push({
        type: 'surge',
        reason: surge.reason,
        amount: surgeAmount
      });
    }

    // Apply regional pricing
    if (context.region) {
      const regional = this._getRegionalAdjustment(context.region);
      finalPrice *= regional.multiplier;
      modifiers.push({
        type: 'regional',
        region: context.region,
        amount: finalPrice * (regional.multiplier - 1)
      });
    }

    logger.debug('Price calculated', {
      itemType,
      basePrice,
      finalPrice: finalPrice.toFixed(2),
      modifiers
    });

    return {
      basePrice,
      finalPrice: Math.max(0, parseFloat(finalPrice.toFixed(2))),
      currency: context.currency || 'USD',
      modifiers
    };
  }

  _getApplicableDiscounts(itemType, context) {
    const applicable = [];

    // Student discount
    if (context.userType === 'student') {
      applicable.push({ name: 'Student Discount', percentage: 0.20 });
    }

    // Early bird
    if (context.isEarlyBird) {
      applicable.push({ name: 'Early Bird', percentage: 0.15 });
    }

    // Bulk purchase
    if (context.quantity >= 5) {
      applicable.push({ name: 'Bulk Purchase', percentage: 0.10 * (context.quantity / 10) });
    }

    // Loyalty program
    if (context.loyaltyTier === 'gold') {
      applicable.push({ name: 'Gold Member', percentage: 0.15 });
    }

    return applicable;
  }

  _getSurgePricing(itemType, context) {
    // Peak hours surge (e.g., for tutoring)
    if (itemType.includes('tutoring')) {
      const hour = new Date().getHours();
      if ((hour >= 17 && hour <= 21)) { // Peak hours 5-9 PM
        return {
          multiplier: 1.3,
          reason: 'Peak hours demand'
        };
      }
    }

    // High demand surge
    if (context.demand === 'high') {
      return {
        multiplier: 1.5,
        reason: 'High demand'
      };
    }

    return null;
  }

  _getRegionalAdjustment(region) {
    const adjustments = {
      'US': { multiplier: 1.0 },
      'EU': { multiplier: 1.1 },
      'UK': { multiplier: 1.05 },
      'IN': { multiplier: 0.3 },
      'CN': { multiplier: 0.4 },
      'BR': { multiplier: 0.5 }
    };

    return adjustments[region] || { multiplier: 1.0 };
  }

  /**
   * Generate pricing tiers for subscription
   */
  generateSubscriptionTiers(userProfile = {}) {
    const tiers = [
      {
        name: 'Basic',
        features: ['5 sessions/month', 'Basic content', 'Community support'],
        price: this.calculatePrice('subscription.basic', userProfile)
      },
      {
        name: 'Premium',
        features: ['Unlimited sessions', 'All content', 'Priority support', 'Advanced analytics'],
        price: this.calculatePrice('subscription.premium', userProfile),
        recommended: true
      },
      {
        name: 'Enterprise',
        features: ['Everything in Premium', 'Custom AI models', 'Dedicated support', 'API access'],
        price: this.calculatePrice('subscription.enterprise', userProfile)
      }
    ];

    return tiers;
  }

  /**
   * Calculate revenue share for marketplace
   */
  calculateRevenueShare(salePrice, creatorTier = 'standard') {
    const shareTiers = {
      'standard': { creator: 0.70, platform: 0.30 },
      'verified': { creator: 0.80, platform: 0.20 },
      'partner': { creator: 0.85, platform: 0.15 }
    };

    const shares = shareTiers[creatorTier];
    
    return {
      totalSale: salePrice,
      creatorShare: (salePrice * shares.creator).toFixed(2),
      platformShare: (salePrice * shares.platform).toFixed(2),
      creatorPercentage: shares.creator * 100,
      platformPercentage: shares.platform * 100
    };
  }
}

export const pricingEngine = new PricingEngine();
export default pricingEngine;
