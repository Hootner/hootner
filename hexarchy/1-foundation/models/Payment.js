// Payment Domain Model
export class Payment {
  constructor({
    id,
    userId,
    tenantId,
    amount,
    currency = 'usd',
    status = 'pending',
    paymentMethod,
    stripePaymentIntentId,
    stripeChargeId,
    description,
    metadata = {},
    refundAmount = 0,
    failureReason = null,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.tenantId = tenantId;
    this.amount = amount;
    this.currency = currency;
    this.status = status;
    this.paymentMethod = paymentMethod;
    this.stripePaymentIntentId = stripePaymentIntentId;
    this.stripeChargeId = stripeChargeId;
    this.description = description;
    this.metadata = metadata;
    this.refundAmount = refundAmount;
    this.failureReason = failureReason;
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // Business methods
  isSuccessful() {
    return this.status === 'succeeded';
  }

  isPending() {
    return this.status === 'pending';
  }

  isFailed() {
    return this.status === 'failed';
  }

  isRefunded() {
    return this.refundAmount >= this.amount;
  }

  isPartiallyRefunded() {
    return this.refundAmount > 0 && this.refundAmount < this.amount;
  }

  getAmountInDollars() {
    return (this.amount / 100).toFixed(2);
  }

  succeed() {
    this.status = 'succeeded';
    this.updatedAt = new Date().toISOString();
  }

  fail(reason) {
    this.status = 'failed';
    this.failureReason = reason;
    this.updatedAt = new Date().toISOString();
  }

  refund(amount) {
    this.refundAmount += amount;
    if (this.refundAmount >= this.amount) {
      this.status = 'refunded';
    }
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return { ...this };
  }
}

export default Payment;
