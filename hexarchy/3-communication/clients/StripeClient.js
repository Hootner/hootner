// Stripe Client
import Stripe from 'stripe';
import { logger } from '../../0-core/logging/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeClient {
  // Create customer
  static async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });

      logger.info('Stripe customer created', { customerId: customer.id });
      return customer;
    } catch (error) {
      logger.error('Stripe customer creation failed:', error);
      throw error;
    }
  }

  // Create payment intent
  static async createPaymentIntent(amount, currency, customerId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      logger.info('Payment intent created', { paymentIntentId: paymentIntent.id });
      return paymentIntent;
    } catch (error) {
      logger.error('Payment intent creation failed:', error);
      throw error;
    }
  }

  // Create subscription
  static async createSubscription(customerId, priceId, trialDays = 0) {
    try {
      const params = {
        customer: customerId,
        items: [{ price: priceId }]
      };

      if (trialDays > 0) {
        params.trial_period_days = trialDays;
      }

      const subscription = await stripe.subscriptions.create(params);

      logger.info('Subscription created', { subscriptionId: subscription.id });
      return subscription;
    } catch (error) {
      logger.error('Subscription creation failed:', error);
      throw error;
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      logger.info('Subscription cancelled', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Subscription cancellation failed:', error);
      throw error;
    }
  }

  // Create refund
  static async createRefund(chargeId, amount) {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount
      });

      logger.info('Refund created', { refundId: refund.id });
      return refund;
    } catch (error) {
      logger.error('Refund creation failed:', error);
      throw error;
    }
  }

  // Get customer
  static async getCustomer(customerId) {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      logger.error('Get customer failed:', error);
      throw error;
    }
  }

  // List payment methods
  static async listPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('List payment methods failed:', error);
      throw error;
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(payload, signature, secret) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, secret);
      return event;
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      return null;
    }
  }
}

export default StripeClient;
