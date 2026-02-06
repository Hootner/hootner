# Stripe Webhook Handler

Comprehensive Stripe webhook handler for subscription management with proper error handling, logging, and event processing.

## Features

✅ **Subscription Events**

- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled
- `customer.subscription.trial_will_end` - Trial ending soon

✅ **Payment Events**

- `invoice.paid` - Successful payment
- `invoice.payment_failed` - Payment failure
- `payment_intent.succeeded` - One-time payment success
- `payment_intent.payment_failed` - Payment failure

✅ **Customer Events**

- `customer.created` - New customer
- `customer.updated` - Customer info changed
- `customer.deleted` - Customer removed

## Setup

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://hootner.com
```

### Express Integration

```javascript
const express = require('express')
const webhookRoutes = require('./api/graphql/webhooks/routes')

const app = express()

// IMPORTANT: Stripe webhooks need raw body
app.use('/webhooks', webhookRoutes)

// Other middleware (JSON parser) comes after webhook routes
app.use(express.json())
```

### Stripe Dashboard Configuration

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/webhooks/stripe`
4. Select events to listen for
5. Copy the **Signing secret** to your `.env`

## Event Handlers

### Subscription Created

Triggered when a customer subscribes:

- Updates database with subscription info
- Sends welcome email
- Tracks analytics event

```javascript
await handleSubscriptionCreated(subscription, event)
```

### Subscription Updated

Handles subscription changes:

- Plan upgrades/downgrades
- Cancellation scheduling
- Status changes (active, paused, etc.)

### Subscription Deleted

Revokes access when subscription ends:

- Updates user status
- Revokes premium features
- Sends cancellation confirmation

### Invoice Paid

Successful payment processing:

- Records payment in database
- Extends subscription access
- Sends receipt email (for renewals)

### Invoice Payment Failed

Handles failed payments:

- Notifies customer
- Tracks retry attempts
- Suspends access after final failure

## Security

### Webhook Signature Verification

All webhooks are verified using Stripe's signature:

```javascript
event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
```

### Error Handling

- Returns `200` for successful processing
- Returns `400` for invalid signatures
- Returns `500` for processing errors (Stripe retries)

## Logging

Structured logging with metadata:

```javascript
logger.info('Subscription created', {
  subscriptionId: id,
  customerId: customer,
  status,
  trialEnd: trial_end,
})

logger.error('Payment failed', {
  invoiceId: id,
  attemptCount: attempt_count,
  error: last_payment_error?.message,
})
```

## Testing

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:4000/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

### Test Events

```bash
# Successful subscription
curl -X POST http://localhost:4000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d @test-subscription-created.json

# Failed payment
curl -X POST http://localhost:4000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d @test-invoice-failed.json
```

## Database Integration

Implement these methods with your database:

```javascript
// Update subscription in database
async updateUserSubscription(data) {
  await db.subscriptions.upsert({
    where: { customerId: data.customerId },
    update: data,
    create: data,
  });
}

// Record payment
async recordPayment(data) {
  await db.payments.create({ data });
}

// Revoke access
async revokePremiumAccess(customerId) {
  await db.users.update({
    where: { stripeCustomerId: customerId },
    data: { subscriptionStatus: 'inactive' },
  });
}
```

## Email Notifications

Email types sent:

- **welcome** - New subscription
- **cancellation_scheduled** - Scheduled cancellation
- **canceled** - Subscription ended
- **trial_ending** - Trial expiring soon
- **payment_received** - Payment successful
- **payment_failed** - Payment failure
- **subscription_suspended** - Access suspended

## Analytics Tracking

Events tracked:

- `subscription_created`
- `subscription_updated`
- `subscription_deleted`
- `trial_ending`
- `invoice_paid`
- `invoice_payment_failed`
- `payment_succeeded`
- `payment_failed`
- `customer_created`
- `customer_deleted`

## Monitoring

### Health Check

```bash
curl http://localhost:4000/webhooks/stripe/health
```

Response:

```json
{
  "status": "ok",
  "service": "stripe-webhooks",
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

### Logs

Check logs in:

- `logs/info.log` - All webhook events
- `logs/error.log` - Errors and failures
- `logs/debug.log` - Detailed debugging (dev only)

## Production Checklist

- [ ] Set `STRIPE_SECRET_KEY` (live key)
- [ ] Set `STRIPE_WEBHOOK_SECRET` (from Stripe dashboard)
- [ ] Configure webhook URL in Stripe dashboard
- [ ] Test signature verification
- [ ] Implement database methods
- [ ] Configure email service
- [ ] Set up monitoring alerts
- [ ] Test retry logic
- [ ] Enable webhook logging
- [ ] Configure backup webhook endpoint

## Webhook Retry Logic

Stripe automatically retries failed webhooks:

- Attempts over 3 days
- Exponential backoff
- Up to 72 hours of retries

Return `500` to trigger retry:

```javascript
return res.status(500).json({
  error: 'Webhook processing failed',
  eventId: event.id,
})
```

## Best Practices

1. **Always verify signatures** - Prevents replay attacks
2. **Use raw body** - Required for signature verification
3. **Idempotency** - Handle duplicate events gracefully
4. **Async processing** - Return 200 quickly, process in background
5. **Logging** - Log all events with metadata
6. **Error handling** - Catch and log errors, return appropriate status
7. **Testing** - Test all event types before production

## Troubleshooting

### Signature Verification Failed

- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure using raw body parser
- Verify endpoint URL matches Stripe dashboard

### Events Not Received

- Check webhook URL is accessible
- Verify firewall/security rules
- Check Stripe dashboard for delivery status

### Duplicate Events

- Implement idempotency keys
- Check for existing records before creating

## Files

- `stripeWebhookHandler.js` - Main webhook handler (579 lines)
- `routes.js` - Express routes
- `logger.js` - Logging utility
- `README.md` - Documentation

## Next Steps

1. Implement database methods
2. Configure email service
3. Set up monitoring
4. Add more event handlers
5. Implement retry queue
6. Add webhook analytics
7. Create admin dashboard
