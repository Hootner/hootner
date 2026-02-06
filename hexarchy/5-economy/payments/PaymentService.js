// Payment Processing Service
import { logger } from '../../0-core/logging/logger.js';

export class PaymentService {
  constructor(paymentRepository, stripeClient) {
    this.paymentRepository = paymentRepository;
    this.stripeClient = stripeClient;
  }

  // Create payment intent
  async createPaymentIntent(paymentData) {
    try {
      const {
        amount,
        currency = 'usd',
        paymentMethodId,
        customerId,
        metadata = {}
      } = paymentData;

      // Validate amount
      if (amount < 50) {
        throw new Error('Amount must be at least $0.50');
      }

      // Create Stripe payment intent
      const intent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency,
        payment_method: paymentMethodId,
        customer: customerId,
        confirm: true,
        metadata
      });

      // Store payment record
      const payment = await this.paymentRepository.create({
        stripePaymentIntentId: intent.id,
        amount: amount / 100, // Store in dollars
        currency,
        status: intent.status,
        customerId,
        metadata,
        createdAt: new Date().toISOString()
      });

      logger.info('Payment intent created', { paymentId: payment.id, amount });
      return { ...payment, stripeIntent: intent };
    } catch (error) {
      logger.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  // Process refund
  async processRefund(paymentId, amount = null, reason = 'requested_by_customer') {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Create Stripe refund
      const refund = await this.stripeClient.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
        reason
      });

      // Update payment record
      payment.refunded = true;
      payment.refundAmount = refund.amount / 100;
      payment.refundDate = new Date().toISOString();
      payment.refundReason = reason;

      await this.paymentRepository.update(paymentId, payment);

      logger.info('Refund processed', { paymentId, refundAmount: refund.amount / 100 });
      return payment;
    } catch (error) {
      logger.error('Failed to process refund:', error);
      throw error;
    }
  }

  // Get payment details
  async getPayment(paymentId) {
    return await this.paymentRepository.findById(paymentId);
  }

  // Get customer payments
  async getCustomerPayments(customerId, limit = 50) {
    return await this.paymentRepository.findByCustomerId(customerId, limit);
  }

  // Create customer
  async createCustomer(customerData) {
    try {
      const { email, name, metadata = {} } = customerData;

      const customer = await this.stripeClient.customers.create({
        email,
        name,
        metadata
      });

      logger.info('Customer created', { customerId: customer.id, email });
      return customer;
    } catch (error) {
      logger.error('Failed to create customer:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(customerId, paymentMethodId) {
    try {
      await this.stripeClient.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default
      await this.stripeClient.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      logger.info('Payment method added', { customerId, paymentMethodId });
      return true;
    } catch (error) {
      logger.error('Failed to add payment method:', error);
      throw error;
    }
  }

  // Process tip/donation
  async processTip(fromUserId, toUserId, amount, message = '') {
    try {
      if (amount < 1) {
        throw new Error('Tip must be at least $1.00');
      }

      // Platform takes 10% fee
      const platformFee = amount * 0.10;
      const creatorAmount = amount - platformFee;

      // Create payment
      const payment = await this.createPaymentIntent({
        amount: amount * 100,
        currency: 'usd',
        customerId: fromUserId,
        metadata: {
          type: 'tip',
          fromUserId,
          toUserId,
          message,
          platformFee,
          creatorAmount
        }
      });

      logger.info('Tip processed', { fromUserId, toUserId, amount, creatorAmount });
      return payment;
    } catch (error) {
      logger.error('Failed to process tip:', error);
      throw error;
    }
  }

  // Calculate fees
  calculateFees(amount, feeType = 'standard') {
    const fees = {
      standard: 0.029, // 2.9% + $0.30
      international: 0.039, // 3.9% + $0.30
      premium: 0.025 // 2.5% + $0.30
    };

    const rate = fees[feeType] || fees.standard;
    const percentageFee = amount * rate;
    const fixedFee = 0.30;
    const totalFee = percentageFee + fixedFee;

    return {
      amount,
      percentageFee: parseFloat(percentageFee.toFixed(2)),
      fixedFee,
      totalFee: parseFloat(totalFee.toFixed(2)),
      netAmount: parseFloat((amount - totalFee).toFixed(2))
    };
  }

  // Get payment statistics
  async getPaymentStatistics(customerId, period = '30d') {
    const payments = await this.paymentRepository.findByCustomerId(customerId);

    const successful = payments.filter(p => p.status === 'succeeded');
    const failed = payments.filter(p => p.status === 'failed');
    const refunded = payments.filter(p => p.refunded);

    const totalAmount = successful.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunded = refunded.reduce((sum, p) => sum + (p.refundAmount || 0), 0);

    return {
      customerId,
      period,
      totalPayments: payments.length,
      successfulPayments: successful.length,
      failedPayments: failed.length,
      refundedPayments: refunded.length,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalRefunded: parseFloat(totalRefunded.toFixed(2)),
      netAmount: parseFloat((totalAmount - totalRefunded).toFixed(2)),
      successRate: payments.length > 0 ? ((successful.length / payments.length) * 100).toFixed(2) : 0
    };
  }
}

export default PaymentService;
