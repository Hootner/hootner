# 🔗 Stripe Account Connection - Visual Flow

## Complete Infrastructure Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR STRIPE ACCOUNT                         │
│  https://dashboard.stripe.com                                       │
│                                                                     │
│  • Secret Key: sk_live_xxxxx                                       │
│  • Webhook Secret: whsec_xxxxx                                     │
│  • Products & Pricing                                              │
│  • Customer Database                                               │
│  • Payment Methods                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls (charges, subscriptions)
                              │ Webhook Events (payments, updates)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS INFRASTRUCTURE                          │
│  template-enhanced.yaml (120 PIPES)                                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 94: Secrets Manager                                    │  │
│  │ ┌────────────────────────────────────────────────────────┐  │  │
│  │ │ STRIPE_SECRET_KEY                                      │  │  │
│  │ │ Value: sk_live_xxxxx (encrypted at rest)              │  │  │
│  │ └────────────────────────────────────────────────────────┘  │  │
│  │ ┌────────────────────────────────────────────────────────┐  │  │
│  │ │ STRIPE_WEBHOOK_SECRET (PIPE 110)                      │  │  │
│  │ │ Value: whsec_xxxxx (for signature verification)       │  │  │
│  │ └────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              │ Retrieved by Lambda                  │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 106: StripeWebhookFunction (Lambda)                   │  │
│  │                                                            │  │
│  │  • Receives: Stripe webhook events                        │  │
│  │  • Verifies: Webhook signature                            │  │
│  │  • Processes: subscription.*, invoice.*                   │  │
│  │  • Updates: DynamoDB subscription records                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              ▲                                      │
│                              │ POST /webhooks/stripe                │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 107: API Gateway Route                                │  │
│  │ https://YOUR_API.execute-api.region.amazonaws.com          │  │
│  │ /webhooks/stripe                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 111: UsageTrackingFunction (Lambda)                   │  │
│  │                                                            │  │
│  │  • Tracks: Active users, videos, storage                  │  │
│  │  • Triggers: S3 uploads, user activity                    │  │
│  │  • Stores: Monthly usage in DynamoDB                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              │ Stores usage data                    │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ DynamoDB: HootnerActivities Table                          │  │
│  │                                                            │  │
│  │  PK: USER#user123        SK: USAGE#2024-01                │  │
│  │  ├─ activeUsers: 150                                      │  │
│  │  ├─ totalVideos: 75                                       │  │
│  │  └─ storageGB: 15                                         │  │
│  │                                                            │  │
│  │  PK: USER#user123        SK: SUBSCRIPTION                 │  │
│  │  ├─ stripeCustomerId: cus_xxxxx                           │  │
│  │  ├─ stripeSubscriptionId: sub_xxxxx                       │  │
│  │  ├─ tier: starter                                         │  │
│  │  └─ status: active                                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              │ Reads usage data                     │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 112: PricingCalculatorFunction (Lambda)               │  │
│  │ Runs monthly via EventBridge (PIPE 113)                   │  │
│  │                                                            │  │
│  │  1. Reads monthly usage from DynamoDB                     │  │
│  │  2. Gets tier config from SSM (PIPE 116)                  │  │
│  │  3. Calculates:                                           │  │
│  │     Base Price: $29.99                                    │  │
│  │     + User overage: 50 × $0.50 = $25.00                  │  │
│  │     + Video overage: 25 × $0.20 = $5.00                  │  │
│  │     + Storage overage: 5 × $0.10 = $0.50                 │  │
│  │     = Subtotal: $60.49                                    │  │
│  │     - Volume discount: $0 (under 1K threshold)            │  │
│  │     = Total: $60.49                                       │  │
│  │  4. Sends invoice to Stripe                               │  │
│  │  5. Stripe charges customer                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 116-117: SSM Parameters                               │  │
│  │                                                            │  │
│  │  /hootner/pricing/tiers                                   │  │
│  │  ├─ starter: $29.99 base + $0.50/user                     │  │
│  │  ├─ growth: $99.99 base + $0.40/user                      │  │
│  │  ├─ scale: $299.99 base + $0.30/user                      │  │
│  │  └─ enterprise: $999.99 base + $0.20/user                 │  │
│  │                                                            │  │
│  │  /hootner/pricing/volume-discounts                        │  │
│  │  ├─ 1,000 users → 5% off                                  │  │
│  │  ├─ 5,000 users → 10% off                                 │  │
│  │  ├─ 10,000 users → 15% off                                │  │
│  │  ├─ 50,000 users → 20% off                                │  │
│  │  └─ 100,000+ users → 25% off                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 115: CloudWatch Dashboard                             │  │
│  │ hootner-usage-pricing                                      │  │
│  │                                                            │  │
│  │  📊 Metrics:                                               │  │
│  │  • Active Users (drives pricing)                          │  │
│  │  • Total Videos                                           │  │
│  │  • Storage GB                                             │  │
│  │  • Stripe Webhook Invocations                            │  │
│  │  • Billing Calculation Runs                               │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ PIPE 118: High Usage Alarm                                 │  │
│  │                                                            │  │
│  │  Triggers when: activeUsers > 5,000                       │  │
│  │  Action: SNS notification                                  │  │
│  │  Message: "Your platform is growing! Consider upgrade"    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Your application code
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION CODE                            │
│  services/usage-pricing-service.js                                 │
│                                                                     │
│  class UsagePricingService {                                       │
│    async createSubscription(userId, email, tier) {                 │
│      // Uses STRIPE_SECRET_KEY from Secrets Manager                │
│      const customer = await stripe.customers.create({...})         │
│      const subscription = await stripe.subscriptions.create({...}) │
│      // Saves to DynamoDB                                          │
│    }                                                               │
│                                                                     │
│    async trackUsage(userId, eventType, data) {                     │
│      // Increments activeUsers, totalVideos, storageGB             │
│      // Stores in DynamoDB for monthly billing                     │
│    }                                                               │
│                                                                     │
│    async calculateMonthlyBill(userId, tier) {                      │
│      const usage = await this.getMonthlyUsage(userId)              │
│      let total = tierConfig.basePrice                              │
│      total += overages * tierConfig.perUnitPrice                   │
│      total -= volumeDiscount(usage.activeUsers)                    │
│      return total // Gets cheaper with scale!                      │
│    }                                                               │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Usage Flow Example

### Month 1: New Customer (50 users)
```
Day 1: User signs up
  → usage-pricing-service.createSubscription()
  → Stripe creates customer + subscription
  → Saves to DynamoDB: tier=starter, status=active

Day 1-30: Platform usage
  → Video uploaded → UsageTrackingFunction → totalVideos++
  → User signs in → UsageTrackingFunction → activeUsers++
  → Storage tracked automatically

Day 31: Billing time
  → EventBridge triggers PricingCalculatorFunction
  → Reads: 50 users, 30 videos, 8 GB
  → Calculates: $29.99 (all within included limits)
  → Stripe charges: $29.99
  → Customer receives invoice
```

### Month 3: Growing (200 users)
```
Day 1-30: More usage
  → 200 active users
  → 120 videos uploaded
  → 35 GB storage used

Day 31: Billing time
  → PricingCalculatorFunction runs
  → Calculates:
    Base: $29.99
    Users: 100 over × $0.50 = $50.00
    Videos: 70 over × $0.20 = $14.00
    Storage: 25 GB over × $0.10 = $2.50
    Subtotal: $96.49
    Volume discount: $0 (under 1K)
    Total: $96.49
  → Stripe charges: $96.49
  → Customer receives detailed invoice
```

### Month 12: Scaled Up (1,500 users)
```
Day 1-30: Platform thriving
  → 1,500 active users
  → 800 videos uploaded
  → 180 GB storage used

Day 31: Billing time
  → PricingCalculatorFunction recommends tier upgrade
  → Customer upgrades to Growth tier ($99.99 base)
  → Calculates:
    Base: $99.99
    Users: 1,000 over × $0.40 = $400.00 (cheaper per user!)
    Videos: 600 over × $0.15 = $90.00
    Storage: 130 GB over × $0.08 = $10.40
    Subtotal: $600.39
    Volume discount: 5% = $30.02 (passed 1K threshold!)
    Total: $570.37
  → Stripe charges: $570.37
  → **Cheaper per user than Starter tier!**
```

## Key Benefits

### 1. Automatic Scaling
- Start small, pay small
- No manual intervention needed
- Pricing adjusts automatically

### 2. Gets Cheaper with Growth
- Higher tiers = lower per-unit costs
- Volume discounts kick in automatically
- Reward for platform success

### 3. Fully Transparent
- Real-time usage tracking
- CloudWatch dashboard
- Detailed invoices via Stripe

### 4. Secure & Compliant
- API keys encrypted in Secrets Manager
- Webhook signature verification
- PCI DSS compliant (handled by Stripe)

## Quick Setup

1. **Get Stripe keys:**
   ```
   Dashboard → API Keys → Copy secret key
   Dashboard → Webhooks → Create endpoint → Copy signing secret
   ```

2. **Update AWS Secrets:**
   ```bash
   aws secretsmanager update-secret \
     --secret-id hootner-stripe-secret-key \
     --secret-string '{"apiKey":"sk_live_xxxxx"}'
   ```

3. **Configure webhook:**
   ```
   Stripe Dashboard → Webhooks → Add endpoint
   URL: https://YOUR_API_GATEWAY/webhooks/stripe
   Events: subscription.*, invoice.*
   ```

4. **Deploy:**
   ```bash
   sam build
   sam deploy
   ```

5. **Test:**
   ```bash
   # Send test webhook from Stripe Dashboard
   # Or use Stripe CLI: stripe trigger customer.subscription.created
   ```

## Monitoring

- **CloudWatch Dashboard:** `hootner-usage-pricing`
- **DynamoDB Table:** `HootnerActivities`
- **Lambda Logs:** `StripeWebhookFunction`, `PricingCalculatorFunction`
- **Stripe Dashboard:** Customers, Subscriptions, Invoices

---

**✅ Your Stripe account is fully integrated and visible in the infrastructure!**

See [STRIPE_USAGE_PRICING_GUIDE.md](STRIPE_USAGE_PRICING_GUIDE.md) for complete setup instructions and pricing examples.
