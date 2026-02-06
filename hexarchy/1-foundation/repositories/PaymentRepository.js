// Payment Repository
import { BaseRepository } from './BaseRepository.js';
import { Payment } from '../models/Payment.js';

export class PaymentRepository extends BaseRepository {
  constructor() {
    super(process.env.PAYMENTS_TABLE || 'Payments');
  }

  async create(paymentData) {
    const payment = new Payment({
      id: `pay-${Date.now()}`,
      ...paymentData
    });
    await super.create(payment);
    return payment;
  }

  async findById(id) {
    const data = await super.findById(id);
    return data ? new Payment(data) : null;
  }

  async findByUser(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId',
      { ':userId': userId },
      { IndexName: 'UserIndex', Limit: limit, ScanIndexForward: false }
    );
    return results.map(data => new Payment(data));
  }

  async findByStripeId(stripePaymentIntentId) {
    const results = await this.query(
      'stripePaymentIntentId = :stripeId',
      { ':stripeId': stripePaymentIntentId },
      { IndexName: 'StripeIndex', Limit: 1 }
    );
    return results.length > 0 ? new Payment(results[0]) : null;
  }

  async findSuccessful(userId, limit = 100) {
    const results = await this.query(
      'userId = :userId AND #status = :status',
      { ':userId': userId, ':status': 'succeeded' },
      {
        IndexName: 'UserIndex',
        Limit: limit,
        ScanIndexForward: false,
        ExpressionAttributeNames: { '#status': 'status' }
      }
    );
    return results.map(data => new Payment(data));
  }

  async getTotalRevenue(userId = null) {
    const payments = userId
      ? await this.findSuccessful(userId, 1000)
      : await this.findAll(1000);

    return payments
      .filter(p => p.isSuccessful())
      .reduce((sum, p) => sum + (p.amount - p.refundAmount), 0);
  }
}

export default PaymentRepository;
