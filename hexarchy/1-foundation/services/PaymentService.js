// Payment Service
import PaymentRepository from '../repositories/PaymentRepository.js';
import { createPaymentIntent, confirmPayment, refundPayment } from '../../0-core/payment/stripe.js';
import { sendWebhook, WEBHOOK_EVENTS } from '../../0-core/webhooks/sender.js';
import { auditLog, AUDIT_EVENTS } from '../../0-core/audit/logger.js';

export class PaymentService {
  constructor() {
    this.repository = new PaymentRepository();
  }

  async createPayment(userId, amount, currency, paymentMethodId, description, metadata) {
    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, paymentMethodId, metadata);

    // Create payment record
    const payment = await this.repository.create({
      userId,
      amount,
      currency,
      status: 'pending',
      paymentMethod: paymentMethodId,
      stripePaymentIntentId: paymentIntent.id,
      description,
      metadata
    });

    return payment;
  }

  async confirmPayment(paymentId, userId, ipAddress, userAgent) {
    const payment = await this.repository.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Confirm with Stripe
    const confirmed = await confirmPayment(payment.stripePaymentIntentId);

    // Update payment status
    await this.repository.update(paymentId, {
      status: 'succeeded',
      stripeChargeId: confirmed.charges.data[0]?.id,
      updatedAt: new Date().toISOString()
    });

    // Audit log
    await auditLog({
      event: AUDIT_EVENTS.PAYMENT_PROCESSED,
      userId,
      resourceType: 'payment',
      resourceId: paymentId,
      action: 'payment_success',
      ipAddress,
      userAgent,
      metadata: { amount: payment.amount, currency: payment.currency }
    });

    // Webhook
    await sendWebhook(WEBHOOK_EVENTS.PAYMENT_SUCCESS, {
      paymentId,
      userId,
      amount: payment.amount,
      currency: payment.currency
    });

    return payment;
  }

  async refund(paymentId, amount, userId, ipAddress, userAgent) {
    const payment = await this.repository.findById(paymentId);

    if (!payment || !payment.isSuccessful()) {
      throw new Error('Cannot refund this payment');
    }

    // Refund with Stripe
    await refundPayment(payment.stripeChargeId, amount);

    // Update payment record
    await this.repository.update(paymentId, {
      refundAmount: payment.refundAmount + amount,
      status: (payment.refundAmount + amount >= payment.amount) ? 'refunded' : 'succeeded',
      updatedAt: new Date().toISOString()
    });

    // Audit log
    await auditLog({
      event: AUDIT_EVENTS.PAYMENT_REFUNDED,
      userId,
      resourceType: 'payment',
      resourceId: paymentId,
      action: 'refund',
      ipAddress,
      userAgent,
      metadata: { refundAmount: amount }
    });

    return payment;
  }

  async getPaymentById(id) {
    return await this.repository.findById(id);
  }

  async getPaymentsByUser(userId, limit = 100) {
    return await this.repository.findByUser(userId, limit);
  }

  async getTotalRevenue(userId = null) {
    return await this.repository.getTotalRevenue(userId);
  }
}

export default PaymentService;
