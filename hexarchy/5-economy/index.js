// Layer 5 Economy - Central Export
// Monetization, payments, and financial services

// Monetization Services
export { default as SubscriptionService } from './monetization/SubscriptionService.js';
export { default as AdRevenueService } from './monetization/AdRevenueService.js';

// Payment Services
export { default as PaymentService } from './payments/PaymentService.js';
export { default as PayoutService } from './payments/PayoutService.js';

// Revenue Services
export { default as RevenueAnalyticsService } from './revenue/RevenueAnalyticsService.js';
export { default as DynamicPricingService } from './pricing/DynamicPricingService.js';

/**
 * Layer 5 - Economy
 *
 * Purpose: Monetization, payments, and financial management
 *
 * Components:
 * - Monetization: Subscriptions, ad revenue
 * - Payments: Payment processing, refunds, customer management
 * - Payouts: Creator payouts, balance management, Stripe Connect
 * - Revenue: Analytics, forecasting, reporting
 * - Pricing: Dynamic pricing, promotions, bundles
 *
 * Layer Dependencies:
 * - Depends on: Layer 0 (Infrastructure) for logging and payments
 * - Depends on: Layer 1 (Foundation) for repositories
 * - Depends on: Layer 2 (Intelligence) for analytics
 * - Provides: Financial capabilities for Layer 3 (Communication) and Layer 4 (Interface)
 */
