/**
 * Enhanced Revenue Tracking Service with Stripe Integration
 * Connects AI algorithms to paying customers
 */

import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class EnhancedRevenueTracker {
  constructor() {
    this.usageFile = path.join(__dirname, '../data/usage/revenue-usage.json');
    this.customerFile = path.join(__dirname, '../data/usage/customer-billing.json');
  }

  /**
   * Track algorithm usage for a paying customer
   */
  async trackPaidUsage(userId, algorithm, params = {}, customerId = null) {
    const timestamp = Date.now();
    const algorithmPricing = {
      price_optimize: { price: 2.99, impact: '+$10,000+/month' },
      dynamic_pricing: { price: 1.99, impact: '+$5,000+/month' },
      revenue_forecast: { price: 4.99, impact: '+$1,000+/month' },
      conversion_optimize: { price: 3.99, impact: '+$2,000+/month' }
    };

    const pricing = algorithmPricing[algorithm];
    if (!pricing) {
      throw new Error(`Unknown algorithm: ${algorithm}`);
    }

    // Create usage record
    const usageRecord = {
      userId,
      customerId,
      algorithm,
      timestamp,
      params,
      billableAmount: pricing.price,
      revenueImpact: pricing.impact,
      status: customerId ? 'billable' : 'demo',
      billedAt: null
    };

    // Save to usage file
    await this.saveUsageRecord(usageRecord);

    // If customer ID provided, bill them immediately
    if (customerId) {
      await this.billCustomer(customerId, algorithm, 1);
      usageRecord.billedAt = new Date().toISOString();
      usageRecord.status = 'billed';
    }

    return usageRecord;
  }

  /**
   * Bill customer for algorithm usage
   */
  async billCustomer(customerId, algorithm, quantity = 1) {
    try {
      // Find customer's subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });

      if (subscriptions.data.length === 0) {
        throw new Error('No active subscription found');
      }

      const subscription = subscriptions.data[0];
      
      // Find the subscription item for this algorithm
      const algorithmItem = subscription.items.data.find(item => 
        item.price.metadata.algorithm === algorithm
      );

      if (!algorithmItem) {
        throw new Error(`No subscription item found for ${algorithm}`);
      }

      // Record usage
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        algorithmItem.id,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      );

      console.log(`💸 Billed customer ${customerId} for ${algorithm} usage`);
      return usageRecord;

    } catch (error) {
      console.error(`Billing failed for ${customerId}:`, error.message);
      throw error;
    }
  }

  /**
   * Save usage record to file
   */
  async saveUsageRecord(record) {
    try {
      let existingData = [];
      try {
        const data = await fs.readFile(this.usageFile, 'utf8');
        existingData = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }

      existingData.push(record);
      await fs.writeFile(this.usageFile, JSON.stringify(existingData, null, 2));
    } catch (error) {
      console.error('Failed to save usage record:', error);
    }
  }

  /**
   * Convert anonymous user to paying customer
   */
  async convertToPaidCustomer(email, userId = null) {
    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId: userId || `user_${Date.now()}`,
          platform: 'hootner',
          convertedAt: new Date().toISOString()
        }
      });

      // Create subscription with AI algorithm pricing
      const subscription = await this.createAISubscription(customer.id);

      // Save customer info
      await this.saveCustomerInfo({
        customerId: customer.id,
        subscriptionId: subscription.id,
        email,
        userId: userId || customer.metadata.userId,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      console.log(`✅ Converted ${email} to paying customer`);
      console.log(`   Customer ID: ${customer.id}`);
      console.log(`   Subscription ID: ${subscription.id}`);

      return { customer, subscription };

    } catch (error) {
      console.error('Failed to convert to paid customer:', error.message);
      throw error;
    }
  }

  /**
   * Create AI algorithm subscription
   */
  async createAISubscription(customerId) {
    // Get or create AI algorithm prices
    const algorithmPrices = await this.getOrCreateAlgorithmPrices();

    const subscriptionItems = Object.values(algorithmPrices).map(price => ({
      price: price.id
    }));

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: subscriptionItems,
      metadata: {
        type: 'ai_revenue_optimization',
        features: 'price_optimize,dynamic_pricing,revenue_forecast,conversion_optimize'
      }
    });

    return subscription;
  }

  /**
   * Get or create Stripe prices for algorithms
   */
  async getOrCreateAlgorithmPrices() {
    const algorithms = {
      price_optimize: { name: 'AI Price Optimization', amount: 299 },
      dynamic_pricing: { name: 'Dynamic Pricing Engine', amount: 199 },
      revenue_forecast: { name: 'Revenue Forecasting', amount: 499 },
      conversion_optimize: { name: 'Conversion Optimization', amount: 399 }
    };

    const prices = {};

    for (const [algorithmId, config] of Object.entries(algorithms)) {
      try {
        // Try to find existing price
        const existingPrices = await stripe.prices.list({
          limit: 100,
          expand: ['data.product']
        });

        let price = existingPrices.data.find(p => 
          p.metadata.algorithm === algorithmId
        );

        if (!price) {
          // Create product
          const product = await stripe.products.create({
            name: config.name,
            description: `AI-powered ${config.name.toLowerCase()} service`,
            metadata: { algorithm: algorithmId }
          });

          // Create price
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: config.amount,
            currency: 'usd',
            recurring: {
              interval: 'month',
              usage_type: 'metered'
            },
            billing_scheme: 'per_unit',
            metadata: { algorithm: algorithmId }
          });
        }

        prices[algorithmId] = price;
      } catch (error) {
        console.error(`Failed to create price for ${algorithmId}:`, error.message);
      }
    }

    return prices;
  }

  /**
   * Save customer info to file
   */
  async saveCustomerInfo(customerInfo) {
    try {
      let existingData = [];
      try {
        const data = await fs.readFile(this.customerFile, 'utf8');
        existingData = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }

      existingData.push(customerInfo);
      await fs.writeFile(this.customerFile, JSON.stringify(existingData, null, 2));
    } catch (error) {
      console.error('Failed to save customer info:', error);
    }
  }

  /**
   * Get revenue summary
   */
  async getRevenueSummary() {
    try {
      const usageData = JSON.parse(await fs.readFile(this.usageFile, 'utf8'));
      
      const summary = {
        totalCalls: usageData.length,
        billableCalls: usageData.filter(u => u.status === 'billed').length,
        demoCalls: usageData.filter(u => u.status === 'demo').length,
        totalRevenue: 0,
        potentialRevenue: 0,
        algorithms: {}
      };

      usageData.forEach(usage => {
        const algorithm = usage.algorithm;
        if (!summary.algorithms[algorithm]) {
          summary.algorithms[algorithm] = {
            calls: 0,
            revenue: 0,
            potential: 0
          };
        }

        summary.algorithms[algorithm].calls++;
        summary.algorithms[algorithm].potential += usage.billableAmount;
        summary.potentialRevenue += usage.billableAmount;

        if (usage.status === 'billed') {
          summary.algorithms[algorithm].revenue += usage.billableAmount;
          summary.totalRevenue += usage.billableAmount;
        }
      });

      return summary;
    } catch (error) {
      console.error('Failed to get revenue summary:', error);
      return null;
    }
  }

  /**
   * Simulate algorithm call with billing
   */
  async simulateAlgorithmCall(algorithm, email = 'demo@hootner.com') {
    console.log(`🤖 Simulating ${algorithm} call...`);

    // Convert to paying customer if needed
    let customerInfo;
    try {
      const customerData = await fs.readFile(this.customerFile, 'utf8');
      const customers = JSON.parse(customerData);
      customerInfo = customers.find(c => c.email === email);
    } catch (error) {
      // No customers yet
    }

    if (!customerInfo) {
      console.log(`👤 Converting ${email} to paying customer...`);
      const result = await this.convertToPaidCustomer(email);
      customerInfo = {
        customerId: result.customer.id,
        email: email,
        userId: result.customer.metadata.userId
      };
    }

    // Track paid usage
    const usage = await this.trackPaidUsage(
      customerInfo.userId,
      algorithm,
      { demo: true },
      customerInfo.customerId
    );

    console.log(`✅ Algorithm call billed: $${usage.billableAmount}`);
    console.log(`💰 Revenue impact: ${usage.revenueImpact}`);

    return usage;
  }
}

export default EnhancedRevenueTracker;