/**
 * SIMPLIFIED PAYMENT SERVICE - Development Mode
 * Mock payment processing for immediate algorithm API testing
 */

class PaymentService {
  constructor() {
    this.isConfigured = true;
    this.prices = {
      algorithm_execution: 1, // $0.01 per execution
      pro_monthly: 1000, // $10.00 per month
      enterprise_monthly: 10000 // $100.00 per month
    };
    this.usageTracking = new Map();
    console.log('💰 Payment service initialized (development mode)');
  }

  // Process algorithm execution payment
  async processAlgorithmPayment(userId, algorithmName, tier = 'free') {
    if (tier === 'free') {
      const canExecute = await this.checkFreeLimit(userId);
      if (!canExecute) {
        return { 
          success: false, 
          error: 'Free tier limit exceeded. Upgrade to continue.',
          upgradeUrl: '/upgrade'
        };
      }
      return { success: true, cost: 0, tier: 'free' };
    }

    // Mock payment processing for development
    console.log(`💳 Processing payment: $0.01 for ${algorithmName} (${tier})`);
    
    await this.trackRevenue(0.01, 'algorithm_execution', {
      userId,
      algorithmName,
      tier
    });

    return { 
      success: true, 
      paymentIntent: 'mock_payment_' + Date.now(),
      cost: 0.01,
      tier 
    };
  }

  // Check free tier usage limits
  async checkFreeLimit(userId) {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `free_usage_${userId}_${today}`;
    
    const currentUsage = this.usageTracking.get(usageKey) || 0;
    
    if (currentUsage >= 10) { // 10 free executions per day
      return false;
    }
    
    this.usageTracking.set(usageKey, currentUsage + 1);
    return true;
  }

  // Track revenue for analytics
  async trackRevenue(amount, service, metadata = {}) {
    const revenueData = {
      amount,
      service,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      metadata
    };

    console.log(`💰 Revenue: $${amount} from ${service}`);
    return revenueData;
  }

  // Create subscription (mock)
  async createSubscription(customerId, tier, email) {
    console.log(`📋 Creating ${tier} subscription for ${email}`);
    return { 
      success: true, 
      subscription: { id: 'mock_sub_' + Date.now() },
      monthlyRevenue: tier === 'pro' ? 10 : 100
    };
  }
}

export default new PaymentService();