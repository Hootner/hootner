// Payment Domain Events
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

export const PAYMENT_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription.expired'
};

export const emitPaymentSucceeded = (payment) => {
  eventEmitter.emit(PAYMENT_EVENTS.PAYMENT_SUCCEEDED, {
    paymentId: payment.id,
    userId: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    timestamp: new Date().toISOString()
  });
};

export const emitPaymentFailed = (payment, reason) => {
  eventEmitter.emit(PAYMENT_EVENTS.PAYMENT_FAILED, {
    paymentId: payment.id,
    userId: payment.userId,
    reason,
    timestamp: new Date().toISOString()
  });
};

export const emitSubscriptionCreated = (subscription) => {
  eventEmitter.emit(PAYMENT_EVENTS.SUBSCRIPTION_CREATED, {
    subscriptionId: subscription.id,
    userId: subscription.userId,
    plan: subscription.plan,
    timestamp: new Date().toISOString()
  });
};

export const emitSubscriptionCancelled = (subscription) => {
  eventEmitter.emit(PAYMENT_EVENTS.SUBSCRIPTION_CANCELLED, {
    subscriptionId: subscription.id,
    userId: subscription.userId,
    timestamp: new Date().toISOString()
  });
};

export const onPaymentEvent = (event, handler) => {
  eventEmitter.on(event, handler);
};

export default {
  PAYMENT_EVENTS,
  emitPaymentSucceeded,
  emitPaymentFailed,
  emitSubscriptionCreated,
  emitSubscriptionCancelled,
  onPaymentEvent
};
