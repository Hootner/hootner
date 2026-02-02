/**
 * Usage-Based Pricing Service
 * 10-Year Lifecycle Model: Price decreases to $0 at shutdown
 *
 * Revenue Goal: AWS costs + $250,000/year developer salary
 * Platform Launch: January 2026
 * Platform Shutdown: January 2036 (120 months)
 */

const { DynamoDB } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocument } = require('@aws-sdk/lib-dynamodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ddb = DynamoDBDocument.wrap(new DynamoDB({}));
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * PLATFORM LIFECYCLE
 */
const PLATFORM_LAUNCH_DATE = new Date('2026-01-26'); // Today
const PLATFORM_LIFETIME_MONTHS = 120; // 10 years
const DEVELOPER_SALARY_PER_MONTH = 20833.33; // $250K/year ÷ 12
const ESTIMATED_AWS_COST_PER_1K_USERS = 150; // ~$150/month per 1K users

/**
 * PRICING TIERS - Lifecycle-based (decreases as platform ages)
 * Early adopters pay more, late joiners pay less, year 10 = FREE
 */
const BASE_PRICING_TIERS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    basePrice: 49.99,              // Higher initial price
    includedUsers: 100,
    includedVideos: 50,
    includedStorage: 10,
    perUserPrice: 0.60,
    perVideoPrice: 0.25,
    perGBPrice: 0.12,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    basePrice: 149.99,
    includedUsers: 500,
    includedVideos: 200,
    includedStorage: 50,
    perUserPrice: 0.50,
    perVideoPrice: 0.20,
    perGBPrice: 0.10,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    basePrice: 399.99,
    includedUsers: 2000,
    includedVideos: 1000,
    includedStorage: 200,
    perUserPrice: 0.40,
    perVideoPrice: 0.15,
    perGBPrice: 0.08,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    basePrice: 1299.99,
    includedUsers: 10000,
    includedVideos: 5000,
    includedStorage: 1000,
    perUserPrice: 0.30,
    perVideoPrice: 0.08,
    perGBPrice: 0.05,
  }
};

/**
 * LIFECYCLE DECAY - Price decreases as platform approaches shutdown
 * Year 1-2: 100% price (fund development)
 * Year 3-5: 75% price (recoup investment)
 * Year 6-8: 50% price (maintenance mode)
 * Year 9-10: 25% → 0% (graceful sunset)
 */
function getLifecycleMultiplier() {
  const now = new Date();
  const monthsSinceLaunch = Math.floor(
    (now - PLATFORM_LAUNCH_DATE) / (1000 * 60 * 60 * 24 * 30.44)
  );
  const remainingMonths = PLATFORM_LIFETIME_MONTHS - monthsSinceLaunch;

  if (remainingMonths <= 0) {
    return 0; // Platform shutdown - FREE
  }

  if (monthsSinceLaunch <= 24) {
    // Year 1-2: Full price (100%)
    return 1.0;
  } else if (monthsSinceLaunch <= 60) {
    // Year 3-5: 75% price
    return 0.75;
  } else if (monthsSinceLaunch <= 96) {
    // Year 6-8: 50% price
    return 0.50;
  } else {
    // Year 9-10: Linear decay to 0%
    const decayMonths = monthsSinceLaunch - 96;
    const decayPeriod = 24; // 24 months to reach 0
    return Math.max(0, 0.25 * (1 - decayMonths / decayPeriod));
  }
}

/**
 * VOLUME DISCOUNTS - Still apply on top of lifecycle pricing
 */
const VOLUME_DISCOUNTS = [
  { threshold: 1000, discount: 0.05, label: '5% off at 1K users' },
  { threshold: 5000, discount: 0.10, label: '10% off at 5K users' },
  { threshold: 10000, discount: 0.15, label: '15% off at 10K users' },
  { threshold: 50000, discount: 0.20, label: '20% off at 50K users' },
  { threshold: 100000, discount: 0.25, label: '25% off at 100K users' },
];

class UsagePricingService {
  /**
   * Check if platform has shut down
   */
  isPlatformActive() {
    const now = new Date();
    const monthsSinceLaunch = Math.floor(
      (now - PLATFORM_LAUNCH_DATE) / (1000 * 60 * 60 * 24 * 30.44)
    );
    return monthsSinceLaunch < PLATFORM_LIFETIME_MONTHS;
  }

  /**
   * Get platform status
   */
  getPlatformStatus() {
    const now = new Date();
    const monthsSinceLaunch = Math.floor(
      (now - PLATFORM_LAUNCH_DATE) / (1000 * 60 * 60 * 24 * 30.44)
    );
    const remainingMonths = PLATFORM_LIFETIME_MONTHS - monthsSinceLaunch;
    const shutdownDate = new Date(PLATFORM_LAUNCH_DATE);
    shutdownDate.setMonth(shutdownDate.getMonth() + PLATFORM_LIFETIME_MONTHS);

    return {
      launchDate: PLATFORM_LAUNCH_DATE.toISOString().slice(0, 10),
      shutdownDate: shutdownDate.toISOString().slice(0, 10),
      monthsSinceLaunch,
      remainingMonths: Math.max(0, remainingMonths),
      isActive: remainingMonths > 0,
      lifecyclePhase: this.getLifecyclePhase(monthsSinceLaunch),
      currentMultiplier: getLifecycleMultiplier(),
    };
  }

  /**
   * Get current lifecycle phase
   */
  getLifecyclePhase(monthsSinceLaunch) {
    if (monthsSinceLaunch >= 120) return 'SHUTDOWN';
    if (monthsSinceLaunch >= 96) return 'SUNSET (Year 9-10)';
    if (monthsSinceLaunch >= 60) return 'MAINTENANCE (Year 6-8)';
    if (monthsSinceLaunch >= 24) return 'MATURE (Year 3-5)';
    return 'GROWTH (Year 1-2)';
  }

  /**
   * Calculate monthly bill with lifecycle pricing
   * Includes: AWS costs + $250K/year development salary
   */
  async calculateMonthlyBill(userId, tier = 'starter') {
    // Check if platform is still active
    if (!this.isPlatformActive()) {
      return {
        total: 0,
        message: 'Platform has reached end of life. Service is now FREE until final shutdown.',
        platformStatus: this.getPlatformStatus(),
      };
    }

    // Get usage for current month
    const usage = await this.getMonthlyUsage(userId);
    const baseTierConfig = BASE_PRICING_TIERS[tier];

    if (!baseTierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    // Apply lifecycle multiplier to base prices
    const lifecycleMultiplier = getLifecycleMultiplier();
    const tierConfig = {
      ...baseTierConfig,
      basePrice: baseTierConfig.basePrice * lifecycleMultiplier,
      perUserPrice: baseTierConfig.perUserPrice * lifecycleMultiplier,
      perVideoPrice: baseTierConfig.perVideoPrice * lifecycleMultiplier,
      perGBPrice: baseTierConfig.perGBPrice * lifecycleMultiplier,
    };

    // Start with lifecycle-adjusted base price
    let total = tierConfig.basePrice;
    const breakdown = {
      platformStatus: this.getPlatformStatus(),
      lifecycleMultiplier: lifecycleMultiplier,
      originalBasePrice: baseTierConfig.basePrice,
      adjustedBasePrice: tierConfig.basePrice,
      usageCharges: {},
      volumeDiscount: 0,
      subtotal: 0,
      total: 0,
      revenueBreakdown: {
        forAWS: 0,
        forDeveloper: 0,
      },
    };

    // Calculate overages
    const userOverage = Math.max(0, usage.activeUsers - tierConfig.includedUsers);
    const videoOverage = Math.max(0, usage.totalVideos - tierConfig.includedVideos);
    const storageOverage = Math.max(0, usage.storageGB - tierConfig.includedStorage);

    // Add overage charges
    if (userOverage > 0) {
      const userCharge = userOverage * tierConfig.perUserPrice;
      breakdown.usageCharges.users = {
        overage: userOverage,
        rate: tierConfig.perUserPrice,
        charge: userCharge,
      };
      total += userCharge;
    }

    if (videoOverage > 0) {
      const videoCharge = videoOverage * tierConfig.perVideoPrice;
      breakdown.usageCharges.videos = {
        overage: videoOverage,
        rate: tierConfig.perVideoPrice,
        charge: videoCharge,
      };
      total += videoCharge;
    }

    if (storageOverage > 0) {
      const storageCharge = storageOverage * tierConfig.perGBPrice;
      breakdown.usageCharges.storage = {
        overage: storageOverage,
        rate: tierConfig.perGBPrice,
        charge: storageCharge,
      };
      total += storageCharge;
    }

    breakdown.subtotal = total;

    // Apply volume discount (gets cheaper at scale!)
    const discount = this.getVolumeDiscount(usage.activeUsers);
    if (discount > 0) {
      breakdown.volumeDiscount = total * discount;
      breakdown.volumeDiscountPercent = (discount * 100).toFixed(0) + '%';
      total -= breakdown.volumeDiscount;
    }

    breakdown.total = total;
    breakdown.usage = usage;
    breakdown.tier = tierConfig;

    // Calculate revenue allocation
    // Estimate: 60% AWS costs, 40% developer salary
    breakdown.revenueBreakdown.forAWS = total * 0.60;
    breakdown.revenueBreakdown.forDeveloper = total * 0.40;
    breakdown.revenueBreakdown.note =
      `Based on estimated split: 60% AWS infrastructure, 40% development ($${DEVELOPER_SALARY_PER_MONTH.toFixed(2)}/month target)`;

    return breakdown;
  }

  /**
   * Get volume discount based on user count
   * More users = bigger discount
   */
  getVolumeDiscount(userCount) {
    let discount = 0;
    for (const tier of VOLUME_DISCOUNTS) {
      if (userCount >= tier.threshold) {
        discount = tier.discount;
      }
    }
    return discount;
  }

  /**
   * Get current month usage from DynamoDB
   */
  async getMonthlyUsage(userId) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = monthStart.toISOString().slice(0, 7); // YYYY-MM

    try {
      // Get usage record
      const result = await ddb.get({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `USAGE#${monthKey}`,
        },
      });

      if (result.Item) {
        return {
          activeUsers: result.Item.activeUsers || 0,
          totalVideos: result.Item.totalVideos || 0,
          storageGB: result.Item.storageGB || 0,
          videoViews: result.Item.videoViews || 0,
        };
      }

      // No usage yet this month
      return {
        activeUsers: 0,
        totalVideos: 0,
        storageGB: 0,
        videoViews: 0,
      };
    } catch (error) {
      console.error('Error fetching usage:', error);
      throw error;
    }
  }

  /**
   * Track usage event (called by Lambda functions)
   */
  async trackUsage(userId, eventType, data) {
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7);

    const updates = {
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `USAGE#${monthKey}`,
      },
      UpdateExpression: '',
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    // Update based on event type
    switch (eventType) {
      case 'video_uploaded':
        updates.UpdateExpression = 'ADD totalVideos :one, storageGB :size';
        updates.ExpressionAttributeValues = {
          ':one': 1,
          ':size': data.sizeGB || 0,
        };
        break;

      case 'user_active':
        updates.UpdateExpression = 'SET activeUsers = if_not_exists(activeUsers, :zero) + :one';
        updates.ExpressionAttributeValues = {
          ':zero': 0,
          ':one': 1,
        };
        break;

      case 'video_viewed':
        updates.UpdateExpression = 'ADD videoViews :one';
        updates.ExpressionAttributeValues = {
          ':one': 1,
        };
        break;

      default:
        console.warn(`Unknown event type: ${eventType}`);
        return;
    }

    await ddb.update(updates);
  }

  /**
   * Create Stripe subscription with usage-based pricing
   */
  async createSubscription(userId, email, tier = 'starter') {
    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          platform: 'hootner',
        },
      });

      // Create subscription with base price
      const baseTierConfig = BASE_PRICING_TIERS[tier];
      const lifecycleMultiplier = getLifecycleMultiplier();
      const tierConfig = {
        ...baseTierConfig,
        basePrice: baseTierConfig.basePrice * lifecycleMultiplier,
      };
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${tierConfig.name} Plan`,
                description: `Base: ${tierConfig.includedUsers} users, ${tierConfig.includedVideos} videos, ${tierConfig.includedStorage}GB storage`,
              },
              recurring: {
                interval: 'month',
              },
              unit_amount: Math.round(tierConfig.basePrice * 100), // Convert to cents
            },
          },
        ],
        metadata: {
          userId,
          tier,
        },
      });

      // Save to DynamoDB
      await ddb.put({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: 'SUBSCRIPTION',
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          tier,
          status: subscription.status,
          createdAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        customer,
        subscription,
        message: `${tierConfig.name} plan activated. You'll be charged based on usage above included limits.`,
      };
    } catch (error) {
      console.error('Subscription creation failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get pricing estimate based on projected usage
   */
  async getPricingEstimate(projectedUsers, projectedVideos, projectedStorageGB) {
    const estimates = {};
    const lifecycleMultiplier = getLifecycleMultiplier();

    for (const [tierKey, baseTierConfig] of Object.entries(BASE_PRICING_TIERS)) {
      const tierConfig = {
        ...baseTierConfig,
        basePrice: baseTierConfig.basePrice * lifecycleMultiplier,
        perUserPrice: baseTierConfig.perUserPrice * lifecycleMultiplier,
        perVideoPrice: baseTierConfig.perVideoPrice * lifecycleMultiplier,
        perGBPrice: baseTierConfig.perGBPrice * lifecycleMultiplier,
      };
      
      let cost = tierConfig.basePrice;

      // Calculate overages
      const userOverage = Math.max(0, projectedUsers - tierConfig.includedUsers);
      const videoOverage = Math.max(0, projectedVideos - tierConfig.includedVideos);
      const storageOverage = Math.max(0, projectedStorageGB - tierConfig.includedStorage);

      cost += userOverage * tierConfig.perUserPrice;
      cost += videoOverage * tierConfig.perVideoPrice;
      cost += storageOverage * tierConfig.perGBPrice;

      // Apply volume discount
      const discount = this.getVolumeDiscount(projectedUsers);
      const discountAmount = cost * discount;
      cost -= discountAmount;

      estimates[tierKey] = {
        tier: tierConfig.name,
        basePrice: tierConfig.basePrice,
        estimatedTotal: cost.toFixed(2),
        savings: discountAmount.toFixed(2),
        discountPercent: discount > 0 ? `${(discount * 100).toFixed(0)}%` : '0%',
        included: {
          users: tierConfig.includedUsers,
          videos: tierConfig.includedVideos,
          storage: tierConfig.includedStorage,
        },
        overages: {
          users: userOverage,
          videos: videoOverage,
          storage: storageOverage,
        },
      };
    }

    return estimates;
  }
}

module.exports = new UsagePricingService();
