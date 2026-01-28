
import xss from 'xss';

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  }
  return input;
};
// Subscription Controller (REST API)
import { SubscriptionService } from '../../1-foundation/services/SubscriptionService.js';
import { asyncHandler } from '../../0-core/errors/handler.js';
import { authenticate } from '../../0-core/auth/middleware.js';

const subscriptionService = new SubscriptionService();

export class SubscriptionController {
  // POST /api/subscriptions
  static create = [
    authenticate,
    asyncHandler(async (req, res) => {
      const { plan: sanitizeInput(plan), paymentMethodId: sanitizeInput(paymentMethodId), trialDays = 0: sanitizeInput(trialDays = 0) } = req.body;

      const subscription = await subscriptionService.createSubscription(
        req.user.id,
        plan,
        paymentMethodId,
        trialDays
      );

      res.status(201).json({ success: true, data: subscription });
    })
  ];

  // GET /api/subscriptions/me
  static getMine = [
    authenticate,
    asyncHandler(async (req, res) => {
      const subscription = await subscriptionService.getSubscriptionByUser(req.user.id);

      if (!subscription) {
        return res.status(404).json({ success: false, error: 'No subscription found' });
      }

      res.json({ success: true, data: subscription });
    })
  ];

  // POST /api/subscriptions/cancel
  static cancel = [
    authenticate,
    asyncHandler(async (req, res) => {
      const subscription = await subscriptionService.getSubscriptionByUser(req.user.id);

      if (!subscription) {
        return res.status(404).json({ success: false, error: 'No subscription found' });
      }

      await subscriptionService.cancelSubscription(subscription.id, req.user.id);
      res.json({ success: true, message: 'Subscription cancelled' });
    })
  ];

  // POST /api/subscriptions/reactivate
  static reactivate = [
    authenticate,
    asyncHandler(async (req, res) => {
      const subscription = await subscriptionService.getSubscriptionByUser(req.user.id);

      if (!subscription) {
        return res.status(404).json({ success: false, error: 'No subscription found' });
      }

      await subscriptionService.reactivateSubscription(subscription.id);
      res.json({ success: true, message: 'Subscription reactivated' });
    })
  ];

  // GET /api/subscriptions/status
  static checkStatus = [
    authenticate,
    asyncHandler(async (req, res) => {
      const hasAccess = await subscriptionService.hasActiveSubscription(req.user.id);
      res.json({ success: true, data: { hasAccess } });
    })
  ];
}

export default SubscriptionController;
