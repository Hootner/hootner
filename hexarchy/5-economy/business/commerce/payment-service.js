/**
 * HOOTNER Payment Service - Enterprise Revenue Processing
 * Handles Stripe payments, subscriptions, and fraud detection
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');
const EventEmitter = require('events');

class PaymentService extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      totalTransactions: 0,
      successfulPayments: 0,
      failedPayments: 0,
      totalRevenue: 0,
      fraudDetected: 0
    };
    
    this.pricing = {
      algorithm_execution: 100, // $1.00 per execution
      pro_monthly: 1999, // $19.99 per month
      enterprise_monthly: 9999, // $99.99 per month
      video_processing: 299 // $2.99 per video
    };
  }

  // Process one-time payment
  async processPayment(paymentData) {
    const { amount, currency = 'usd', customerId, description, metadata = {} } = paymentData;
    
    try {
      this.metrics.totalTransactions++;
      
      // Fraud detection
      const fraudCheck = await this.detectFraud(paymentData);
      if (fraudCheck.isFraud) {
        this.metrics.fraudDetected++;
        throw new Error(`Payment blocked: ${fraudCheck.reason}`);
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        description,
        metadata: {
          ...metadata,
          service: 'hootner',
          timestamp: Date.now()
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      this.metrics.successfulPayments++;
      this.metrics.totalRevenue += amount;
      
      this.emit('paymentProcessed', {
        paymentIntentId: paymentIntent.id,
        amount,
        customerId,
        timestamp: Date.now()
      });

      console.log(`💰 Payment processed: $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`);
      
      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      this.metrics.failedPayments++;
      console.error('❌ Payment failed:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create subscription
  async createSubscription(subscriptionData) {
    const { customerId, priceId, tier } = subscriptionData;
    
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          tier,
          service: 'hootner',
          created: Date.now()
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      console.log(`📋 Subscription created: ${tier} tier for customer ${customerId}`);
      
      return {
        success: true,
        subscription,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('❌ Subscription creation failed:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Algorithm execution payment
  async processAlgorithmPayment(userId, algorithmName, tier = 'free') {
    if (tier === 'free') {
      return { success: true, cost: 0, message: 'Free tier execution' };
    }
    
    const amount = this.pricing.algorithm_execution;
    
    return await this.processPayment({
      amount,
      customerId: userId,
      description: `Algorithm execution: ${algorithmName}`,
      metadata: {
        algorithmName,
        tier,
        type: 'algorithm_execution'
      }
    });
  }

  // Video processing payment
  async processVideoPayment(userId, videoTitle) {
    const amount = this.pricing.video_processing;
    
    return await this.processPayment({
      amount,
      customerId: userId,
      description: `Video processing: ${videoTitle}`,
      metadata: {
        videoTitle,
        type: 'video_processing'
      }
    });
  }

  // Fraud detection
  async detectFraud(paymentData) {
    const { amount, customerId, metadata = {} } = paymentData;
    
    // Simple fraud detection rules
    const fraudChecks = [
      {
        condition: amount > 100000, // $1000+
        reason: 'High amount transaction'
      },
      {
        condition: metadata.suspicious === 'true',
        reason: 'Flagged as suspicious'
      }
    ];

    for (const check of fraudChecks) {
      if (check.condition) {
        return {
          isFraud: true,
          reason: check.reason,
          riskScore: 0.9
        };
      }
    }

    return {
      isFraud: false,
      riskScore: 0.1
    };
  }

  // Create customer
  async createCustomer(customerData) {
    const { email, name, metadata = {} } = customerData;
    
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          service: 'hootner',
          created: Date.now()
        }
      });

      console.log(`👤 Customer created: ${email}`);
      
      return {
        success: true,
        customer
      };
    } catch (error) {
      console.error('❌ Customer creation failed:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment metrics
  getMetrics() {
    return {
      ...this.metrics,
      successRate: ((this.metrics.successfulPayments / this.metrics.totalTransactions) * 100).toFixed(2) + '%',
      averageTransactionValue: (this.metrics.totalRevenue / this.metrics.successfulPayments / 100).toFixed(2),
      fraudRate: ((this.metrics.fraudDetected / this.metrics.totalTransactions) * 100).toFixed(2) + '%'
    };
  }

  // Start payment service
  async start() {
    console.log('💳 Starting HOOTNER Payment Service...');
    
    // Test Stripe connection
    try {
      await stripe.balance.retrieve();
      console.log('✅ Stripe connection established');
    } catch (error) {
      console.warn('⚠️  Stripe connection failed (using test mode)');
    }

    // Start metrics logging
    setInterval(() => {
      const metrics = this.getMetrics();
      if (metrics.totalTransactions > 0) {
        console.log('📈 Payment Metrics:', {
          transactions: metrics.totalTransactions,
          revenue: `$${(metrics.totalRevenue / 100).toFixed(2)}`,
          successRate: metrics.successRate
        });
      }
    }, 300000); // Every 5 minutes

    return {
      status: 'running',
      pricing: this.pricing,
      metrics: this.getMetrics()
    };
  }

  // Health check
  healthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      metrics: this.getMetrics()
    };
  }
}

// Create and export service instance
const paymentService = new PaymentService();

// Auto-start if run directly
if (require.main === module) {
  paymentService.start().catch(console.error);
  
  // Keep process alive
  process.stdin.resume();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Payment Service...');
    process.exit(0);
  });
}

module.exports = paymentService;