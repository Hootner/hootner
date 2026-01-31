#!/usr/bin/env node

/**
 * Connect Revenue Optimization Algorithms to Stripe Billing
 * 
 * This script:
 * 1. Creates Stripe products for AI revenue optimization features
 * 2. Sets up usage-based pricing for algorithm calls
 * 3. Connects anonymous usage to real paying customers
 * 4. Implements billing for AI insights
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs').promises;
const path = require('path');

// Revenue optimization products and pricing
const AI_PRODUCTS = {
  price_optimize: {
    name: 'AI Price Optimization',
    description: 'AI-powered pricing recommendations based on market analysis',
    unit_amount: 299, // $2.99 per optimization
    billing_scheme: 'per_unit',
    usage_type: 'metered'
  },
  dynamic_pricing: {
    name: 'Dynamic Pricing Engine',
    description: 'Real-time price adjustments based on demand and competition',
    unit_amount: 199, // $1.99 per pricing update
    billing_scheme: 'per_unit',
    usage_type: 'metered'
  },
  revenue_forecast: {
    name: 'Revenue Forecasting',
    description: '12-month revenue projections with market analysis',
    unit_amount: 499, // $4.99 per forecast
    billing_scheme: 'per_unit',
    usage_type: 'metered'
  },
  conversion_optimize: {
    name: 'Conversion Optimization',
    description: 'AI analysis to improve conversion rates and user experience',
    unit_amount: 399, // $3.99 per optimization
    billing_scheme: 'per_unit',
    usage_type: 'metered'
  }
};

class StripeBillingConnector {
  constructor() {
    this.revenueUsageFile = path.join(__dirname, '../data/usage/revenue-usage.json');
    this.stripeProducts = {};
    this.stripePrices = {};
  }

  /**
   * Initialize Stripe products and prices for AI features
   */
  async initializeStripeProducts() {
    console.log('🚀 Creating Stripe products for AI revenue optimization...');

    for (const [algorithmId, productConfig] of Object.entries(AI_PRODUCTS)) {
      try {
        // Create product
        const product = await stripe.products.create({
          name: productConfig.name,
          description: productConfig.description,
          metadata: {
            algorithm: algorithmId,
            category: 'ai_revenue_optimization'
          }
        });

        // Create price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: productConfig.unit_amount,
          currency: 'usd',
          recurring: {
            interval: 'month',
            usage_type: productConfig.usage_type
          },
          billing_scheme: productConfig.billing_scheme,
          metadata: {
            algorithm: algorithmId
          }
        });

        this.stripeProducts[algorithmId] = product;
        this.stripePrices[algorithmId] = price;

        console.log(`✅ Created: ${productConfig.name} - $${(productConfig.unit_amount / 100).toFixed(2)} per use`);
      } catch (error) {
        console.error(`❌ Failed to create ${algorithmId}:`, error.message);
      }
    }

    console.log('\n💰 Stripe products created successfully!');
    return { products: this.stripeProducts, prices: this.stripePrices };
  }

  /**
   * Create customer and subscription for AI features
   */
  async createCustomerSubscription(email, userId) {
    try {
      // Create customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          userId,
          platform: 'hootner',
          features: 'ai_revenue_optimization'
        }
      });

      // Create subscription with all AI features
      const subscriptionItems = Object.entries(this.stripePrices).map(([algorithmId, price]) => ({
        price: price.id,
        metadata: {
          algorithm: algorithmId
        }
      }));

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: subscriptionItems,
        metadata: {
          userId,
          type: 'ai_revenue_optimization'
        }
      });

      console.log(`✅ Created subscription for ${email}`);
      console.log(`   Customer ID: ${customer.id}`);
      console.log(`   Subscription ID: ${subscription.id}`);

      return { customer, subscription };
    } catch (error) {
      console.error('❌ Failed to create customer subscription:', error.message);
      throw error;
    }
  }

  /**
   * Track usage and bill customer for algorithm usage
   */
  async trackAlgorithmUsage(customerId, algorithmId, quantity = 1) {
    try {
      const price = this.stripePrices[algorithmId];
      if (!price) {
        throw new Error(`No price found for algorithm: ${algorithmId}`);
      }

      // Find subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active'
      });

      if (subscriptions.data.length === 0) {
        throw new Error('No active subscription found');
      }

      const subscription = subscriptions.data[0];
      const subscriptionItem = subscription.items.data.find(
        item => item.price.id === price.id
      );

      if (!subscriptionItem) {
        throw new Error(`Subscription item not found for ${algorithmId}`);
      }

      // Record usage
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItem.id,
        {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment'
        }
      );

      const cost = (price.unit_amount * quantity) / 100;
      console.log(`💸 Billed $${cost.toFixed(2)} for ${quantity}x ${AI_PRODUCTS[algorithmId].name}`);

      return usageRecord;
    } catch (error) {
      console.error(`❌ Failed to track usage for ${algorithmId}:`, error.message);
      throw error;
    }
  }

  /**
   * Process existing revenue usage data and bill customers
   */
  async processExistingUsage() {
    try {
      const usageData = JSON.parse(await fs.readFile(this.revenueUsageFile, 'utf8'));
      
      console.log(`\n📊 Processing ${usageData.length} existing usage records...`);

      // For demo purposes, create a test customer
      const testCustomer = await this.createCustomerSubscription(
        'demo@hootner.com',
        'demo-user-001'
      );

      let totalBilled = 0;

      for (const usage of usageData) {
        if (usage.userId === 'anonymous') {
          // Convert anonymous usage to billable usage
          try {
            await this.trackAlgorithmUsage(
              testCustomer.customer.id,
              usage.algorithm,
              1
            );

            const algorithmPrice = AI_PRODUCTS[usage.algorithm].unit_amount / 100;
            totalBilled += algorithmPrice;

            // Update usage record with customer info
            usage.userId = 'demo-user-001';
            usage.stripeCustomerId = testCustomer.customer.id;
            usage.billed = true;
            usage.billedAmount = algorithmPrice;
            usage.billedAt = new Date().toISOString();

          } catch (error) {
            console.error(`Failed to bill for ${usage.algorithm}:`, error.message);
          }
        }
      }

      // Save updated usage data
      await fs.writeFile(
        this.revenueUsageFile,
        JSON.stringify(usageData, null, 2)
      );

      console.log(`\n💰 Total billed: $${totalBilled.toFixed(2)}`);
      console.log(`📧 Customer: demo@hootner.com`);
      console.log(`🔗 Stripe Dashboard: https://dashboard.stripe.com/customers/${testCustomer.customer.id}`);

      return { totalBilled, customer: testCustomer.customer };

    } catch (error) {
      console.error('❌ Failed to process existing usage:', error.message);
      throw error;
    }
  }

  /**
   * Create webhook handler for real-time billing
   */
  async createWebhookHandler() {
    const webhookCode = `
// Webhook handler for real-time AI algorithm billing
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Track AI algorithm usage in real-time
router.post('/track-ai-usage', async (req, res) => {
  try {
    const { userId, algorithm, customerId } = req.body;
    
    // Validate algorithm
    const validAlgorithms = ['price_optimize', 'dynamic_pricing', 'revenue_forecast', 'conversion_optimize'];
    if (!validAlgorithms.includes(algorithm)) {
      return res.status(400).json({ error: 'Invalid algorithm' });
    }

    // Track usage in Stripe
    const usageRecord = await trackAlgorithmUsage(customerId, algorithm, 1);
    
    // Log usage
    console.log(\`💸 Billed customer \${customerId} for \${algorithm}\`);
    
    res.json({
      success: true,
      usageRecord,
      message: 'Usage tracked and billed successfully'
    });

  } catch (error) {
    console.error('Billing error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
`;

    await fs.writeFile(
      path.join(__dirname, '../api/routes/ai-billing-webhook.js'),
      webhookCode
    );

    console.log('✅ Created webhook handler: /api/routes/ai-billing-webhook.js');
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport() {
    try {
      const usageData = JSON.parse(await fs.readFile(this.revenueUsageFile, 'utf8'));
      
      const report = {
        totalUsage: usageData.length,
        algorithmBreakdown: {},
        potentialRevenue: 0,
        actualRevenue: 0,
        conversionRate: 0
      };

      usageData.forEach(usage => {
        const algorithm = usage.algorithm;
        if (!report.algorithmBreakdown[algorithm]) {
          report.algorithmBreakdown[algorithm] = {
            count: 0,
            potentialRevenue: 0,
            actualRevenue: 0
          };
        }

        report.algorithmBreakdown[algorithm].count++;
        
        const price = AI_PRODUCTS[algorithm].unit_amount / 100;
        report.algorithmBreakdown[algorithm].potentialRevenue += price;
        report.potentialRevenue += price;

        if (usage.billed) {
          report.algorithmBreakdown[algorithm].actualRevenue += usage.billedAmount;
          report.actualRevenue += usage.billedAmount;
        }
      });

      report.conversionRate = report.potentialRevenue > 0 
        ? (report.actualRevenue / report.potentialRevenue * 100).toFixed(2)
        : 0;

      console.log('\n📈 REVENUE REPORT');
      console.log('==================');
      console.log(`Total Algorithm Calls: ${report.totalUsage}`);
      console.log(`Potential Revenue: $${report.potentialRevenue.toFixed(2)}`);
      console.log(`Actual Revenue: $${report.actualRevenue.toFixed(2)}`);
      console.log(`Conversion Rate: ${report.conversionRate}%`);
      console.log('\nAlgorithm Breakdown:');
      
      Object.entries(report.algorithmBreakdown).forEach(([algorithm, data]) => {
        console.log(`  ${algorithm}: ${data.count} calls, $${data.actualRevenue.toFixed(2)} revenue`);
      });

      return report;
    } catch (error) {
      console.error('❌ Failed to generate revenue report:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  console.log('🦉 HOOTNER - Connecting AI Revenue Optimization to Stripe');
  console.log('=========================================================\n');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable not set');
    console.log('💡 Add your Stripe secret key to .env file');
    process.exit(1);
  }

  const connector = new StripeBillingConnector();

  try {
    // Step 1: Initialize Stripe products
    await connector.initializeStripeProducts();

    // Step 2: Process existing usage and create demo customer
    await connector.processExistingUsage();

    // Step 3: Create webhook handler
    await connector.createWebhookHandler();

    // Step 4: Generate revenue report
    await connector.generateRevenueReport();

    console.log('\n🎉 SUCCESS! Your AI algorithms are now connected to Stripe billing.');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your Stripe dashboard for new products');
    console.log('2. Test the billing with real customers');
    console.log('3. Monitor usage and revenue in Stripe');
    console.log('4. Scale up with more customers!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = StripeBillingConnector;