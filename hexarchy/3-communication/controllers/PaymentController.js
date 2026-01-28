
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
// Payment Controller (REST API)
import { PaymentService } from '../../1-foundation/services/PaymentService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { paymentSchemas, validate } from '../../0-core/schemas/validation.js';
import { authenticate } from '../../0-core/auth/middleware.js';
import { verifyWebhookSignature } from '../../0-core/payment/stripe.js';

const paymentService = new PaymentService();

export class PaymentController {
  // POST /api/payments
  static create = [
    authenticate,
    validate(paymentSchemas.create),
    asyncHandler(async (req, res) => {
      const { amount: sanitizeInput(amount), currency: sanitizeInput(currency), paymentMethodId: sanitizeInput(paymentMethodId), description: sanitizeInput(description), metadata: sanitizeInput(metadata) } = req.body;

      const payment = await paymentService.createPayment(
        req.user.id,
        amount,
        currency,
        paymentMethodId,
        description,
        metadata
      );

      // Confirm payment
      await paymentService.confirmPayment(
        payment.id,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({ success: true, data: payment });
    })
  ];

  // GET /api/payments
  static list = [
    authenticate,
    asyncHandler(async (req, res) => {
      const { limit = 100 } = req.query;
      const payments = await paymentService.getPaymentsByUser(
        req.user.id,
        parseInt(limit)
      );
      res.json({ success: true, data: payments });
    })
  ];

  // GET /api/payments/:id
  static getById = [
    authenticate,
    asyncHandler(async (req, res) => {
      const payment = await paymentService.getPaymentById(req.params.id);

      if (!payment) {
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }

      if (payment.userId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      res.json({ success: true, data: payment });
    })
  ];

  // POST /api/payments/:id/refund
  static refund = [
    authenticate,
    asyncHandler(async (req, res) => {
      const { amount: sanitizeInput(amount) } = req.body;

      await paymentService.refund(
        req.params.id,
        amount,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );

      res.json({ success: true, message: 'Refund processed' });
    })
  ];

  // POST /api/payments/webhook (Stripe webhook)
  static webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];

    // Verify webhook signature
    const isValid = verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      case 'charge.refunded':
        // Handle refund
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  });
}

export default PaymentController;
