/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe
 */

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required')
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { logger } = require('../utils/logger')

class StripeWebhookHandler {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    this.eventHandlers = {
      'customer.subscription.created': this.handleSubscriptionCreated.bind(this),
      'customer.subscription.updated': this.handleSubscriptionUpdated.bind(this),
      'customer.subscription.deleted': this.handleSubscriptionDeleted.bind(this),
      'customer.subscription.trial_will_end': this.handleTrialWillEnd.bind(this),
      'invoice.paid': this.handleInvoicePaid.bind(this),
      'invoice.payment_failed': this.handleInvoicePaymentFailed.bind(this),
      'payment_intent.succeeded': this.handlePaymentSucceeded.bind(this),
      'payment_intent.payment_failed': this.handlePaymentFailed.bind(this),
      'customer.created': this.handleCustomerCreated.bind(this),
      'customer.updated': this.handleCustomerUpdated.bind(this),
      'customer.deleted': this.handleCustomerDeleted.bind(this),
    }
  }

  /**
   * Verify and process webhook event
   */
  async handleWebhook(req, res) {
    const signature = req.headers['stripe-signature']

    if (!signature) {
      logger.error('Missing Stripe signature header')
      return res.status(400).json({ error: 'Missing signature' })
    }

    let event

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, signature, this.webhookSecret)

      logger.info('Webhook verified', {
        eventId: event.id,
        eventType: event.type,
        timestamp: new Date(event.created * 1000).toISOString(),
      })
    } catch (err) {
      logger.error('Webhook signature verification failed', {
        error: err.message,
        signature: signature.substring(0, 20) + '...',
      })
      return res.status(400).json({ error: 'Invalid signature' })
    }

    try {
      // Route to appropriate handler
      const handler = this.eventHandlers[event.type]

      if (handler) {
        await handler(event.data.object, event)
        logger.info('Webhook processed successfully', {
          eventId: event.id,
          eventType: event.type,
        })
      } else {
        logger.warn('Unhandled webhook event type', {
          eventId: event.id,
          eventType: event.type,
        })
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).json({ received: true, eventId: event.id })
    } catch (error) {
      logger.error('Webhook processing error', {
        eventId: event.id,
        eventType: event.type,
        error: error.message,
        stack: error.stack,
      })

      // Return 500 so Stripe retries the webhook
      return res.status(500).json({
        error: 'Webhook processing failed',
        eventId: event.id,
      })
    }
  }

  /**
   * Handle subscription created event
   */
  async handleSubscriptionCreated(subscription) {
    const { customer, id, status, items, current_period_end, trial_end } = subscription

    logger.info('Subscription created', {
      subscriptionId: id,
      customerId: customer,
      status,
      trialEnd: trial_end ? new Date(trial_end * 1000).toISOString() : null,
    })

    try {
      // Update database with subscription info
      await this.updateUserSubscription({
        customerId: customer,
        subscriptionId: id,
        status,
        planId: items.data[0]?.price.id,
        currentPeriodEnd: new Date(current_period_end * 1000),
        trialEnd: trial_end ? new Date(trial_end * 1000) : null,
      })

      // Send welcome email
      await this.sendSubscriptionEmail(customer, 'welcome', {
        subscriptionId: id,
        planName: items.data[0]?.price.nickname || 'Premium Plan',
      })

      // Track analytics
      await this.trackEvent('subscription_created', {
        subscriptionId: id,
        customerId: customer,
        planId: items.data[0]?.price.id,
      })
    } catch (error) {
      logger.error('Error processing subscription created', {
        subscriptionId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle subscription updated event
   */
  async handleSubscriptionUpdated(subscription) {
    const { customer, id, status, cancel_at_period_end, items, current_period_end } =
      subscription

    logger.info('Subscription updated', {
      subscriptionId: id,
      customerId: customer,
      status,
      cancelAtPeriodEnd: cancel_at_period_end,
    })

    try {
      // Update database
      await this.updateUserSubscription({
        customerId: customer,
        subscriptionId: id,
        status,
        planId: items.data[0]?.price.id,
        currentPeriodEnd: new Date(current_period_end * 1000),
        cancelAtPeriodEnd: cancel_at_period_end,
      })

      // Notify user if subscription is set to cancel
      if (cancel_at_period_end) {
        await this.sendSubscriptionEmail(customer, 'cancellation_scheduled', {
          subscriptionId: id,
          endDate: new Date(current_period_end * 1000).toLocaleDateString(),
        })
      }

      // Track analytics
      await this.trackEvent('subscription_updated', {
        subscriptionId: id,
        customerId: customer,
        status,
      })
    } catch (error) {
      logger.error('Error processing subscription updated', {
        subscriptionId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle subscription deleted/canceled event
   */
  async handleSubscriptionDeleted(subscription) {
    const { customer, id, status } = subscription

    logger.info('Subscription deleted', {
      subscriptionId: id,
      customerId: customer,
      status,
    })

    try {
      // Update database - revoke access
      await this.updateUserSubscription({
        customerId: customer,
        subscriptionId: id,
        status: 'canceled',
        canceledAt: new Date(),
      })

      // Revoke premium features
      await this.revokePremiumAccess(customer)

      // Send cancellation confirmation
      await this.sendSubscriptionEmail(customer, 'canceled', {
        subscriptionId: id,
      })

      // Track analytics
      await this.trackEvent('subscription_deleted', {
        subscriptionId: id,
        customerId: customer,
      })
    } catch (error) {
      logger.error('Error processing subscription deleted', {
        subscriptionId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle trial ending soon
   */
  async handleTrialWillEnd(subscription) {
    const { customer, id, trial_end } = subscription

    logger.info('Trial will end', {
      subscriptionId: id,
      customerId: customer,
      trialEnd: new Date(trial_end * 1000).toISOString(),
    })

    try {
      // Send reminder email
      await this.sendSubscriptionEmail(customer, 'trial_ending', {
        subscriptionId: id,
        trialEndDate: new Date(trial_end * 1000).toLocaleDateString(),
        daysRemaining: Math.ceil(
          (trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      })

      // Track analytics
      await this.trackEvent('trial_ending', {
        subscriptionId: id,
        customerId: customer,
      })
    } catch (error) {
      logger.error('Error processing trial ending', {
        subscriptionId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle successful invoice payment
   */
  async handleInvoicePaid(invoice) {
    const { customer, subscription, id, amount_paid, billing_reason } = invoice

    logger.info('Invoice paid', {
      invoiceId: id,
      customerId: customer,
      subscriptionId: subscription,
      amount: amount_paid / 100,
      billingReason: billing_reason,
    })

    try {
      // Record payment in database
      await this.recordPayment({
        customerId: customer,
        subscriptionId: subscription,
        invoiceId: id,
        amount: amount_paid / 100,
        currency: invoice.currency,
        billingReason: billing_reason,
        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      })

      // Extend subscription access
      if (subscription) {
        await this.extendSubscriptionAccess(customer, subscription)
      }

      // Send receipt email (only for subscription renewals, not initial)
      if (billing_reason === 'subscription_cycle') {
        await this.sendSubscriptionEmail(customer, 'payment_received', {
          invoiceId: id,
          amount: amount_paid / 100,
          receiptUrl: invoice.hosted_invoice_url,
        })
      }

      // Track analytics
      await this.trackEvent('invoice_paid', {
        invoiceId: id,
        customerId: customer,
        amount: amount_paid / 100,
      })
    } catch (error) {
      logger.error('Error processing invoice paid', {
        invoiceId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle failed invoice payment
   */
  async handleInvoicePaymentFailed(invoice) {
    const { customer, subscription, id, attempt_count, next_payment_attempt } = invoice

    logger.error('Invoice payment failed', {
      invoiceId: id,
      customerId: customer,
      subscriptionId: subscription,
      attemptCount: attempt_count,
      nextAttempt: next_payment_attempt
        ? new Date(next_payment_attempt * 1000).toISOString()
        : null,
    })

    try {
      // Update payment status
      await this.recordPaymentFailure({
        customerId: customer,
        subscriptionId: subscription,
        invoiceId: id,
        attemptCount: attempt_count,
        failedAt: new Date(),
      })

      // Send payment failure notification
      await this.sendSubscriptionEmail(customer, 'payment_failed', {
        invoiceId: id,
        attemptCount: attempt_count,
        updatePaymentUrl: `${process.env.FRONTEND_URL}/account/billing`,
      })

      // If final attempt failed, suspend access
      if (!next_payment_attempt) {
        await this.suspendSubscriptionAccess(customer, subscription)

        await this.sendSubscriptionEmail(customer, 'subscription_suspended', {
          subscriptionId: subscription,
        })
      }

      // Track analytics
      await this.trackEvent('invoice_payment_failed', {
        invoiceId: id,
        customerId: customer,
        attemptCount: attempt_count,
      })
    } catch (error) {
      logger.error('Error processing payment failure', {
        invoiceId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSucceeded(paymentIntent) {
    const { id, customer, amount, currency } = paymentIntent

    logger.info('Payment succeeded', {
      paymentIntentId: id,
      customerId: customer,
      amount: amount / 100,
      currency,
    })

    try {
      // Track successful payment
      await this.trackEvent('payment_succeeded', {
        paymentIntentId: id,
        customerId: customer,
        amount: amount / 100,
      })
    } catch (error) {
      logger.error('Error processing payment succeeded', {
        paymentIntentId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(paymentIntent) {
    const { id, customer, amount, last_payment_error } = paymentIntent

    logger.error('Payment failed', {
      paymentIntentId: id,
      customerId: customer,
      amount: amount / 100,
      error: last_payment_error?.message,
    })

    try {
      // Track failed payment
      await this.trackEvent('payment_failed', {
        paymentIntentId: id,
        customerId: customer,
        amount: amount / 100,
        errorMessage: last_payment_error?.message,
      })
    } catch (error) {
      logger.error('Error processing payment failed', {
        paymentIntentId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle customer created
   */
  async handleCustomerCreated(customer) {
    const { id, email, name } = customer

    logger.info('Customer created', {
      customerId: id,
      email,
      name,
    })

    try {
      // Link Stripe customer to user account
      await this.linkStripeCustomer({
        customerId: id,
        email,
        name,
      })

      // Track analytics
      await this.trackEvent('customer_created', {
        customerId: id,
      })
    } catch (error) {
      logger.error('Error processing customer created', {
        customerId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle customer updated
   */
  async handleCustomerUpdated(customer) {
    const { id, email, name } = customer

    logger.info('Customer updated', {
      customerId: id,
      email,
    })

    try {
      // Update customer info in database
      await this.updateStripeCustomer({
        customerId: id,
        email,
        name,
      })
    } catch (error) {
      logger.error('Error processing customer updated', {
        customerId: id,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Handle customer deleted
   */
  async handleCustomerDeleted(customer) {
    const { id } = customer

    logger.info('Customer deleted', {
      customerId: id,
    })

    try {
      // Remove Stripe customer link
      await this.unlinkStripeCustomer(id)

      // Track analytics
      await this.trackEvent('customer_deleted', {
        customerId: id,
      })
    } catch (error) {
      logger.error('Error processing customer deleted', {
        customerId: id,
        error: error.message,
      })
      throw error
    }
  }

  // Database helper methods (implement with your ORM/database)
  async updateUserSubscription(data) {
    // TODO: Implement database update
    logger.debug('Update user subscription', data)
  }

  async recordPayment(data) {
    // TODO: Implement payment recording
    logger.debug('Record payment', data)
  }

  async recordPaymentFailure(data) {
    // TODO: Implement payment failure recording
    logger.debug('Record payment failure', data)
  }

  async linkStripeCustomer(data) {
    // TODO: Implement customer linking
    logger.debug('Link Stripe customer', data)
  }

  async updateStripeCustomer(data) {
    // TODO: Implement customer update
    logger.debug('Update Stripe customer', data)
  }

  async unlinkStripeCustomer(customerId) {
    // TODO: Implement customer unlinking
    logger.debug('Unlink Stripe customer', { customerId })
  }

  async revokePremiumAccess(customerId) {
    // TODO: Implement access revocation
    logger.debug('Revoke premium access', { customerId })
  }

  async extendSubscriptionAccess(customerId, subscriptionId) {
    // TODO: Implement access extension
    logger.debug('Extend subscription access', { customerId, subscriptionId })
  }

  async suspendSubscriptionAccess(customerId, subscriptionId) {
    // TODO: Implement access suspension
    logger.debug('Suspend subscription access', { customerId, subscriptionId })
  }

  async sendSubscriptionEmail(customerId, type, data) {
    // TODO: Implement email sending
    logger.debug('Send subscription email', { customerId, type, data })
  }

  async trackEvent(eventName, data) {
    // TODO: Implement analytics tracking
    logger.debug('Track event', { eventName, data })
  }
}

module.exports = new StripeWebhookHandler()
