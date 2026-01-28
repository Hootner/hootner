#!/usr/bin/env node

/**
 * Quick Setup: Connect AI Algorithms to Stripe Billing
 * Run this to start making money from your AI features!
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import EnhancedRevenueTracker from '../services/enhanced-revenue-tracker.js';

async function quickSetup() {
  console.log('🦉 HOOTNER - Quick Stripe Billing Setup');
  console.log('=====================================\n');

  // Check environment
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ Missing STRIPE_SECRET_KEY in environment');
    console.log('💡 Add this to your .env file:');
    console.log('   STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  const tracker = new EnhancedRevenueTracker();

  try {
    console.log('🚀 Setting up billing for AI algorithms...\n');

    // Simulate some algorithm calls with billing
    console.log('1️⃣ Testing Price Optimization...');
    await tracker.simulateAlgorithmCall('price_optimize', 'customer1@example.com');

    console.log('\n2️⃣ Testing Dynamic Pricing...');
    await tracker.simulateAlgorithmCall('dynamic_pricing', 'customer2@example.com');

    console.log('\n3️⃣ Testing Revenue Forecasting...');
    await tracker.simulateAlgorithmCall('revenue_forecast', 'customer1@example.com');

    console.log('\n4️⃣ Testing Conversion Optimization...');
    await tracker.simulateAlgorithmCall('conversion_optimize', 'customer3@example.com');

    // Show revenue summary
    console.log('\n📊 REVENUE SUMMARY');
    console.log('==================');
    const summary = await tracker.getRevenueSummary();
    
    if (summary) {
      console.log(`Total Algorithm Calls: ${summary.totalCalls}`);
      console.log(`Billable Calls: ${summary.billableCalls}`);
      console.log(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
      console.log(`Potential Revenue: $${summary.potentialRevenue.toFixed(2)}`);
      
      console.log('\nAlgorithm Breakdown:');
      Object.entries(summary.algorithms).forEach(([algorithm, data]) => {
        console.log(`  ${algorithm}: ${data.calls} calls, $${data.revenue.toFixed(2)} revenue`);
      });
    }

    console.log('\n🎉 SUCCESS! Your AI algorithms are now billing customers!');
    console.log('\n📋 What just happened:');
    console.log('✅ Created Stripe customers for demo emails');
    console.log('✅ Set up subscriptions with usage-based pricing');
    console.log('✅ Billed customers for AI algorithm usage');
    console.log('✅ Tracked revenue and usage data');

    console.log('\n🚀 Next Steps:');
    console.log('1. Check your Stripe dashboard: https://dashboard.stripe.com');
    console.log('2. View customers and their subscriptions');
    console.log('3. Monitor usage-based billing in real-time');
    console.log('4. Scale up with real customers!');

    console.log('\n💡 Integration Points:');
    console.log('• Add tracker.trackPaidUsage() to your AI algorithm calls');
    console.log('• Use tracker.convertToPaidCustomer() for new signups');
    console.log('• Monitor revenue with tracker.getRevenueSummary()');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify STRIPE_SECRET_KEY is correct');
    console.log('2. Check Stripe account is active');
    console.log('3. Ensure you have API permissions');
    process.exit(1);
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  quickSetup();
}

export { quickSetup };