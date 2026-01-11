
/**
 * STRIPE PAYMENT SERVICE - Revenue Generation Ready
 * Handles all payment processing for algorithm API and services
 */

import Stripe from 'stripe';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development');
    this.prices = {
      algorithm_execution: 1, // $0.01 per execution
      pro_monthly: 1000, // $10.00 per month
      enterprise_monthly: 10000 // $100.00 per month
    };
  }

  // Process algorithm execution payment
  async processAlgorithmPayment(userId, algorithmName, tier = 'free') {
    if (tier === 'free') return { success: true, cost: 0 };
    
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: this.prices.algorithm_execution,
        currency: 'usd',
        metadata: {
          userId,
          algorithmName,
          tier,
          service: 'algorithm_api'
        }
      });
      
      return { success: true, paymentIntent, cost: 0.01 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create subscription for pro/enterprise tiers
  async createSubscription(userId, tier) {
    const priceId = tier === 'pro' ? 'price_pro_monthly' : 'price_enterprise_monthly';
    
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: userId,
        items: [{ price: priceId }],
        metadata: { tier, service: 'algorithm_platform' }
      });
      
      return { success: true, subscription };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Setup enterprise tier
  async setupEnterprise(userId, companyName) {
    try {
      const customer = await this.stripe.customers.create({
        metadata: { userId, tier: 'enterprise', companyName }
      });
      
      const subscription = await this.createSubscription(customer.id, 'enterprise');
      console.log('🏢 Enterprise setup complete:', { userId, companyName });
      return { success: true, customer, subscription };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Track revenue for analytics
  async trackRevenue(amount, service, metadata = {}) {
    const revenueData = {
      amount,
      service,
      timestamp: Date.now(),
      metadata
    };
    
    console.log('💰 Revenue tracked:', revenueData);
    return revenueData;
  }
}

export default new PaymentService();
