# Layer 5 - Economy

Monetization, payments, and financial management for the Hootner video platform.

## 📁 Structure

```
5-economy/
├── monetization/              # Monetization Services
│   ├── SubscriptionService.js         # Subscription management
│   └── AdRevenueService.js            # Ad revenue tracking
├── payments/                  # Payment Services
│   ├── PaymentService.js              # Payment processing
│   └── PayoutService.js               # Creator payouts
├── revenue/                   # Revenue Services
│   └── RevenueAnalyticsService.js     # Revenue analytics
├── pricing/                   # Pricing Services
│   └── DynamicPricingService.js       # Dynamic pricing
├── index.js                   # Central export
└── README.md                  # This file
```

## 🎯 Purpose

Layer 5 provides financial and monetization capabilities:
- **Monetization**: Subscriptions, ad revenue
- **Payments**: Payment processing, refunds, tips
- **Payouts**: Creator earnings, balance management
- **Revenue Analytics**: Tracking, forecasting, reporting
- **Pricing**: Dynamic pricing, promotions, bundles

## 💳 Monetization Services

### SubscriptionService
Subscription tier management:

**Subscription Tiers:**
- **Free**: $0/month - 5 uploads, 100MB max, ads, no analytics
- **Basic**: $4.99/month - 50 uploads, 500MB max, no ads, analytics, custom thumbnails
- **Pro**: $9.99/month - 200 uploads, 2GB max, all Basic features + live streaming, priority support
- **Premium**: $19.99/month - Unlimited uploads, 10GB max, all Pro features + team collaboration, white label

**Methods:**
- `getAvailableTiers()` - List all subscription tiers
- `getTier(tierId)` - Get tier details
- `createSubscription(userId, tierId, paymentMethodId)` - Create subscription with payment
- `getUserSubscription(userId)` - Get user's active subscription
- `updateSubscription(subscriptionId, newTierId)` - Upgrade/downgrade with proration
- `cancelSubscription(subscriptionId)` - Cancel subscription
- `renewSubscription(subscriptionId)` - Renew subscription with payment
- `hasFeatureAccess(subscription, feature)` - Check feature availability
- `getUsageStats(userId)` - Usage vs limits

**Proration:** Upgrades calculate prorated charges based on remaining days in billing period.

### AdRevenueService
Ad revenue tracking and management:

**CPM Rates (per 1000 impressions):**
- Pre-roll: $2.50 (before video)
- Mid-roll: $3.00 (during video)
- Post-roll: $1.50 (after video)
- Display: $0.50 (banner ads)
- Overlay: $1.00 (video overlay)

**Methods:**
- `trackImpression(videoId, adType, userId, metadata)` - Track ad view
- `trackClick(impressionId, videoId, adType)` - Track ad click
- `calculateRevenue(impressions, adType)` - Calculate earnings from impressions
- `getVideoRevenue(videoId, period)` - Video ad revenue breakdown (by type, CTR, total)
- `getCreatorRevenue(userId, period)` - Creator earnings with 55/45 revenue share
- `getRevenueAnalytics(userId, period)` - Revenue timeline and projections
- `estimateEarnings(videoViews, engagementRate)` - Estimate potential earnings
- `getTopEarningVideos(userId, limit, period)` - Top performing videos

**Revenue Split:** Creators receive 55%, platform keeps 45%.

## 💰 Payment Services

### PaymentService
Stripe payment processing:

**Methods:**
- `createPaymentIntent(paymentData)` - Process payment (minimum $0.50)
  - Creates Stripe payment intent
  - Stores payment record
  - Returns payment and Stripe intent
- `processRefund(paymentId, amount, reason)` - Full or partial refund
- `getPayment(paymentId)` - Get payment details
- `getCustomerPayments(customerId, limit)` - Payment history
- `createCustomer(customerData)` - Create Stripe customer
- `addPaymentMethod(customerId, paymentMethodId)` - Attach payment method
- `processTip(fromUserId, toUserId, amount, message)` - Send tip (10% platform fee, $1 minimum)
- `calculateFees(amount, feeType)` - Calculate transaction fees
  - Standard: 2.9% + $0.30
  - International: 3.9% + $0.30
  - Premium: 2.5% + $0.30
- `getPaymentStatistics(customerId, period)` - Payment stats (success rate, totals, refunds)

### PayoutService
Creator payout management:

**Settings:**
- Minimum payout: $50.00
- Schedule: Monthly (configurable to weekly or manual)
- Integration: Stripe Connect Express accounts

**Methods:**
- `requestPayout(userId, amount)` - Request creator payout (validates balance and minimum)
- `processPayout(payoutId)` - Execute payout via Stripe transfer
- `getAvailableBalance(userId)` - Get available balance
  - Returns: total earnings, completed payouts, pending payouts, available balance
- `getPayoutHistory(userId, limit)` - Payout history
- `setupStripeConnect(userId, accountData)` - Create Stripe Connect account
  - Returns account ID and onboarding URL
  - Express account type for quick setup
- `getUserStripeAccount(userId)` - Get linked Stripe account
- `processScheduledPayouts()` - Batch process eligible payouts
- `getPayoutStatistics(userId)` - Payout stats and eligibility

**Flow:**
1. Creator earns revenue from ads/tips
2. Balance accumulates until >= $50
3. Creator requests payout or automatic monthly payout
4. Funds transferred to Stripe Connect account
5. Creator receives funds in bank account

## 📊 Revenue Services

### RevenueAnalyticsService
Platform revenue tracking and forecasting:

**Methods:**
- `getPlatformRevenue(period)` - Total revenue breakdown
  - Subscription revenue
  - Ad revenue (platform's 45% share)
  - Transaction fees
  - Percentage breakdown
- `getRevenueByCategory(period)` - Revenue by video category
- `getRevenueTimeline(period)` - Daily revenue data (subscriptions, ads, fees)
- `getTopRevenueCreators(limit, period)` - Highest earning creators
- `getRevenueForecast(months)` - Revenue projection
  - Historical analysis (90 days)
  - Linear projection with 5% monthly growth
  - Confidence levels
- `getRevenueMetrics(period)` - Key metrics
  - Total revenue and growth
  - MRR (Monthly Recurring Revenue)
  - ARPU (Average Revenue Per User)
- `exportRevenueReport(period, format)` - Export report (JSON or CSV)

**Revenue Sources:**
1. Subscriptions (recurring)
2. Ad revenue (platform share)
3. Transaction fees (tips, payments)

## 💵 Pricing Services

### DynamicPricingService
Regional and promotional pricing:

**Regional Pricing Multipliers:**
- US: 1.0x (base)
- EU: 1.1x
- UK: 1.05x
- Canada: 0.95x
- Australia: 1.1x
- India: 0.3x
- Brazil: 0.4x
- Mexico: 0.5x

**Methods:**
- `calculateOptimalPrice(tierId, region)` - Calculate region-specific pricing
  - Applies regional multiplier
  - Adjusts for market demand
  - Rounds to .99
- `calculateDiscount(originalPrice, discountType, value)` - Apply discount
  - Types: percentage, fixed, trial (free)
  - Minimum price: $0.99
- `createPromotion(promotionData)` - Create promo code
  - Code, tier, discount type/value
  - Max uses, expiration, minimum purchase
- `validatePromotion(code, tierId, purchaseAmount)` - Validate promo
- `applyPromotion(code, originalPrice)` - Apply promo discount
- `calculateBundlePrice(items)` - Multi-item bundle pricing
  - 2+ items: 10% off
  - 3+ items: 15% off
  - 5+ items: 25% off
- `getPriceRecommendations(tierId)` - Regional price suggestions

**Demand-Based Pricing:**
- High demand (>80% conversion): +10%
- Low demand (<30% conversion): -10%

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 0 (Infrastructure) - Logging, Stripe integration
- Layer 1 (Foundation) - Repositories, domain services
- Layer 2 (Intelligence) - Analytics for demand/forecasting

**Provides:**
- Financial capabilities for Layer 3 (Communication)
- Monetization features for Layer 4 (Interface)

## 📚 Usage Examples

### Subscriptions
```javascript
import { SubscriptionService } from './hexarchy/5-economy/index.js';

const subscriptionService = new SubscriptionService(repository, paymentService);

// Get available tiers
const tiers = subscriptionService.getAvailableTiers();

// Create subscription
const subscription = await subscriptionService.createSubscription(
  userId,
  'pro',
  paymentMethodId
);

// Get user subscription
const userSub = await subscriptionService.getUserSubscription(userId);
console.log('Tier:', userSub.name);
console.log('Features:', userSub.features);

// Check feature access
const canStream = subscriptionService.hasFeatureAccess(userSub, 'liveStreaming');

// Get usage
const usage = await subscriptionService.getUsageStats(userId);
console.log('Used:', usage.usage.videoUploads);
console.log('Remaining:', usage.remaining.videoUploads);

// Upgrade
await subscriptionService.updateSubscription(subscription.id, 'premium');
```

### Ad Revenue
```javascript
import { AdRevenueService } from './hexarchy/5-economy/index.js';

const adService = new AdRevenueService(repository, analyticsService);

// Track impression
await adService.trackImpression(videoId, 'preRoll', userId, {
  country: 'US',
  device: 'mobile'
});

// Track click
await adService.trackClick(impressionId, videoId, 'preRoll');

// Get video revenue
const videoRevenue = await adService.getVideoRevenue(videoId, '30d');
console.log('Total revenue:', videoRevenue.totalRevenue);
console.log('Impressions:', videoRevenue.totalImpressions);
console.log('CTR:', videoRevenue.ctr + '%');

// Get creator revenue
const creatorRevenue = await adService.getCreatorRevenue(userId, '30d');
console.log('Creator share:', creatorRevenue.creatorShare);
console.log('Platform share:', creatorRevenue.platformShare);

// Estimate earnings
const estimate = await adService.estimateEarnings(10000); // 10k views
console.log('Estimated earnings:', estimate.creatorEarnings);
```

### Payments
```javascript
import { PaymentService, PayoutService } from './hexarchy/5-economy/index.js';

const paymentService = new PaymentService(repository, stripeClient);
const payoutService = new PayoutService(repository, stripeClient);

// Process payment
const payment = await paymentService.createPaymentIntent({
  amount: 999, // $9.99 in cents
  currency: 'usd',
  paymentMethodId,
  customerId: userId
});

// Process tip
await paymentService.processTip(fromUserId, toUserId, 5.00, 'Great video!');

// Get balance
const balance = await payoutService.getAvailableBalance(userId);
console.log('Available:', balance.availableBalance);

// Request payout
if (balance.availableBalance >= 50) {
  const payout = await payoutService.requestPayout(userId, balance.availableBalance);
  await payoutService.processPayout(payout.id);
}

// Setup Stripe Connect
const connect = await payoutService.setupStripeConnect(userId, {
  email: 'creator@example.com',
  country: 'US'
});
console.log('Onboarding URL:', connect.onboardingUrl);
```

### Revenue Analytics
```javascript
import { RevenueAnalyticsService } from './hexarchy/5-economy/index.js';

const revenueService = new RevenueAnalyticsService(
  repository,
  subscriptionService,
  adRevenueService
);

// Get platform revenue
const revenue = await revenueService.getPlatformRevenue('30d');
console.log('Total revenue:', revenue.totalRevenue);
console.log('Subscriptions:', revenue.subscriptionRevenue);
console.log('Ads:', revenue.adRevenue);

// Get revenue timeline
const timeline = await revenueService.getRevenueTimeline('30d');
timeline.forEach(day => {
  console.log(`${day.date}: $${day.total}`);
});

// Get top creators
const topCreators = await revenueService.getTopRevenueCreators(10, '30d');

// Revenue forecast
const forecast = await revenueService.getRevenueForecast(3);
console.log('Projected 3-month revenue:', forecast.forecast);

// Export report
const report = await revenueService.exportRevenueReport('30d', 'json');
```

### Dynamic Pricing
```javascript
import { DynamicPricingService } from './hexarchy/5-economy/index.js';

const pricingService = new DynamicPricingService(analyticsService);

// Calculate regional price
const pricing = await pricingService.calculateOptimalPrice('pro', 'EU');
console.log('Optimal price:', pricing.finalPrice, pricing.currency);

// Create promotion
const promo = await pricingService.createPromotion({
  code: 'LAUNCH50',
  tierId: 'pro',
  discountType: 'percentage',
  discountValue: 50,
  maxUses: 100,
  expiresAt: '2026-12-31'
});

// Apply promotion
const discount = await pricingService.applyPromotion('LAUNCH50', 9.99);
console.log('Original:', discount.originalPrice);
console.log('Discounted:', discount.discountedPrice);
console.log('Savings:', discount.savings);

// Calculate bundle
const bundle = pricingService.calculateBundlePrice([
  { price: 4.99 },
  { price: 9.99 },
  { price: 19.99 }
]);
console.log('Bundle price:', bundle.bundlePrice);
console.log('Savings:', bundle.discount);
```

## ✅ Complete

Layer 5 (Economy) is **100% complete** with:
- ✅ 2 monetization services (subscriptions, ad revenue)
- ✅ 2 payment services (payments, payouts)
- ✅ 1 revenue analytics service
- ✅ 1 dynamic pricing service
- ✅ Central export file

**Total: 7 files** providing comprehensive financial and monetization capabilities for the Hootner video platform.

**Key Features:**
- 4-tier subscription system ($0-$19.99)
- Ad revenue with 55/45 creator split
- Stripe payment processing and Connect payouts
- Regional pricing (8 regions)
- Promotional discounts and bundles
- Revenue analytics and forecasting
- $50 minimum payout threshold
- Automatic monthly payouts
