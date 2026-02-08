#!/usr/bin/env node

/**
 * AWS Setup for HOOTNER Extension Monetization
 * Sets up: Cognito, API Gateway, Lambda, DynamoDB, Stripe integration
 */

console.log('🦉 HOOTNER Extension - AWS Monetization Setup\n');

const services = {
  cognito: {
    name: 'Amazon Cognito',
    purpose: 'User authentication & license management',
    cost: 'Free tier: 50K MAU'
  },
  apiGateway: {
    name: 'API Gateway',
    purpose: 'Extension API endpoints',
    cost: 'Free tier: 1M requests/month'
  },
  lambda: {
    name: 'AWS Lambda',
    purpose: 'Agent routing & billing logic',
    cost: 'Free tier: 1M requests/month'
  },
  dynamodb: {
    name: 'DynamoDB',
    purpose: 'User subscriptions & usage tracking',
    cost: 'Free tier: 25GB storage'
  },
  stripe: {
    name: 'Stripe (via Lambda)',
    purpose: 'Payment processing',
    cost: '2.9% + $0.30 per transaction'
  }
};

console.log('📋 Required AWS Services:\n');
Object.entries(services).forEach(([key, service]) => {
  console.log(`✅ ${service.name}`);
  console.log(`   Purpose: ${service.purpose}`);
  console.log(`   Cost: ${service.cost}\n`);
});

console.log('🚀 Setup Steps:\n');
console.log('1. Run: npm run aws:onboard');
console.log('2. Run: node scripts/setup-extension-backend.js');
console.log('3. Configure Stripe: node scripts/stripe:setup');
console.log('4. Deploy: npm run aws:deploy');
console.log('\n💰 Estimated Monthly Cost: $0-5 (with free tier)');
console.log('📈 Revenue Potential: $29-99/user/month\n');
