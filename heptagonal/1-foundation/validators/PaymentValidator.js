// Payment Validator
import { Money } from '../value-objects/Money.js';

export class PaymentValidator {
  static MIN_AMOUNT = 50; // $0.50 in cents
  static MAX_AMOUNT = 100000000; // $1,000,000 in cents
  static ALLOWED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  static validatePayment(paymentData) {
    const errors = [];

    // Amount
    if (!paymentData.amount || typeof paymentData.amount !== 'number') {
      errors.push('Amount is required and must be a number');
    }

    if (paymentData.amount < this.MIN_AMOUNT) {
      errors.push(`Minimum amount is ${this.MIN_AMOUNT / 100} ${paymentData.currency || 'USD'}`);
    }

    if (paymentData.amount > this.MAX_AMOUNT) {
      errors.push(`Maximum amount is ${this.MAX_AMOUNT / 100} ${paymentData.currency || 'USD'}`);
    }

    // Currency
    const currency = (paymentData.currency || 'USD').toUpperCase();
    if (!this.ALLOWED_CURRENCIES.includes(currency)) {
      errors.push(`Invalid currency. Allowed: ${this.ALLOWED_CURRENCIES.join(', ')}`);
    }

    // Payment method
    if (!paymentData.paymentMethodId) {
      errors.push('Payment method is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRefund(payment, refundAmount) {
    const errors = [];

    if (refundAmount <= 0) {
      errors.push('Refund amount must be positive');
    }

    if (refundAmount > (payment.amount - payment.refundAmount)) {
      errors.push('Refund amount exceeds available refund balance');
    }

    if (!payment.isSuccessful()) {
      errors.push('Can only refund successful payments');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default PaymentValidator;
