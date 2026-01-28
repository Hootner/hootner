#!/usr/bin/env node

/**
 * Minimal RAM Revenue Check
 * Uses existing .env secrets, no heavy dependencies
 */

import LightweightRevenueTracker from '../services/lightweight-revenue-tracker.js';

async function checkRevenue() {
  console.log('🦉 HOOTNER - Revenue Status Check');
  console.log('=================================\n');

  const tracker = new LightweightRevenueTracker();
  
  // Check configuration
  const config = tracker.getConfigStatus();
  console.log('📋 Configuration Status:');
  console.log(`   Stripe: ${config.stripeConfigured ? '✅ Configured' : '❌ Needs real key'}`);
  console.log(`   JWT Secret: ${config.jwtSecret ? '✅ Set' : '❌ Default'}`);
  console.log(`   API Keys: ${config.apiKeys ? '✅ Set' : '❌ Default'}`);
  console.log(`   Environment: ${config.environment}\n`);

  // Get revenue summary
  const summary = await tracker.getRevenueSummary();
  
  if (summary.error) {
    console.log('❌ Error reading revenue data:', summary.error);
    return;
  }

  console.log('💰 Revenue Summary:');
  console.log(`   Total Calls: ${summary.totalCalls}`);
  console.log(`   Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
  console.log(`   Active Customers: ${summary.customers}`);
  
  console.log('\n📊 Algorithm Breakdown:');
  Object.entries(summary.algorithms).forEach(([algorithm, data]) => {
    console.log(`   ${algorithm}: ${data.calls} calls, $${data.revenue.toFixed(2)}`);
  });

  console.log('\n🚀 Next Steps:');
  if (!config.stripeConfigured) {
    console.log('1. Add your real Stripe secret key to .env');
    console.log('2. Replace placeholder keys with production keys');
  } else {
    console.log('1. Your algorithms are ready to bill customers!');
    console.log('2. Monitor usage in Stripe dashboard');
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  console.log(`\n💾 Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
}

checkRevenue().catch(console.error);