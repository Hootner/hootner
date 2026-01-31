#!/usr/bin/env node

import 'dotenv/config';

console.log('🔍 STRIPE KEY DETECTION\n');

const stripeKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

console.log('📋 CURRENT STRIPE CONFIGURATION:');
console.log('='.repeat(50));

if (stripeKey) {
  const isReal = stripeKey.startsWith('sk_test_') && !stripeKey.includes('placeholder');
  const keyPreview = stripeKey.substring(0, 20) + '...';

  console.log(`Secret Key: ${keyPreview}`);
  console.log(`Status: ${isReal ? '✅ REAL KEY' : '❌ PLACEHOLDER'}`);

  if (isReal) {
    console.log('🎉 Real Stripe key detected!');
    console.log('💰 Revenue tracking will work with real payments');
  } else {
    console.log('⚠️  Still using placeholder key');
    console.log('💡 Update STRIPE_SECRET_KEY in .env file');
  }
} else {
  console.log('❌ No Stripe secret key found');
}

console.log(`\nWebhook Secret: ${webhookSecret ? webhookSecret.substring(0, 15) + '...' : 'Not set'}`);
console.log(`Publishable Key: ${publishableKey ? publishableKey.substring(0, 20) + '...' : 'Not set'}`);

console.log('\n🔧 TO USE YOUR REAL KEYS:');
console.log('1. Remove duplicate STRIPE_SECRET_KEY entries from .env');
console.log('2. Keep only your real key');
console.log('3. Restart the server: npm run start:all');
console.log('4. Test with real Stripe dashboard');

console.log('\n📍 KEYS SHOULD LOOK LIKE:');
console.log('STRIPE_SECRET_KEY=sk_test_51ABC123...');
console.log('STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...');
console.log('STRIPE_WEBHOOK_SECRET=whsec_ABC123...');
