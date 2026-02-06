# 💰 HOOTNER Usage-Based Pricing Guide

## Overview

Your Stripe account is now fully integrated with **usage-based pricing** that automatically gets cheaper as you scale. Users start at a base price and the per-unit cost decreases with volume.

## 🎯 How It Works

### 1. User Subscribes
- User selects a tier (Starter, Growth, Scale, Enterprise)
- Stripe creates subscription with base monthly price
- Subscription stored in DynamoDB

### 2. Automatic Usage Tracking
- **Users:** Tracked when they authenticate
- **Videos:** Tracked when uploaded to S3
- **Storage:** Calculated from video file sizes
- All metrics stored monthly in DynamoDB

### 3. Monthly Billing
- Runs automatically on 1st of each month
- Calculates: `Base Price + Overages - Volume Discount`
- Stripe automatically charges the customer
- Customer receives detailed invoice

## 💵 Pricing Tiers

### Starter - $29.99/month
**Best for:** Small teams, side projects, testing

**Included:**
- 100 users
- 50 videos
- 10 GB storage

**Overages:**
- $0.50 per additional user
- $0.20 per additional video
- $0.10 per additional GB

**Example:** 150 users, 75 videos, 15 GB
```
Base:    $29.99
Users:   50 × $0.50 = $25.00
Videos:  25 × $0.20 = $5.00
Storage: 5 × $0.10  = $0.50
───────────────────────
Total:   $60.49/month
```

---

### Growth - $99.99/month
**Best for:** Growing startups, active communities

**Included:**
- 500 users
- 200 videos
- 50 GB storage

**Overages (20% cheaper per unit):**
- $0.40 per additional user
- $0.15 per additional video
- $0.08 per additional GB

**Example:** 750 users, 300 videos, 75 GB
```
Base:    $99.99
Users:   250 × $0.40 = $100.00
Videos:  100 × $0.15 = $15.00
Storage: 25 × $0.08  = $2.00
───────────────────────
Subtotal: $216.99
Volume discount (5%): -$10.85
───────────────────────
Total:   $206.14/month ← Cheaper than 2 Starter plans!
```

---

### Scale - $299.99/month
**Best for:** Established businesses, large communities

**Included:**
- 2,000 users
- 1,000 videos
- 200 GB storage

**Overages (40% cheaper per unit):**
- $0.30 per additional user
- $0.10 per additional video
- $0.06 per additional GB

**Example:** 3,500 users, 1,500 videos, 350 GB
```
Base:    $299.99
Users:   1,500 × $0.30 = $450.00
Videos:  500 × $0.10   = $50.00
Storage: 150 × $0.06   = $9.00
───────────────────────
Subtotal: $808.99
Volume discount (5%): -$40.45
───────────────────────
Total:   $768.54/month
```

---

### Enterprise - $999.99/month
**Best for:** Large platforms, enterprise deployments

**Included:**
- 10,000 users
- 5,000 videos
- 1 TB (1,000 GB) storage

**Overages (60% cheaper per unit):**
- $0.20 per additional user
- $0.05 per additional video
- $0.04 per additional GB

**Example:** 50,000 users, 10,000 videos, 2 TB
```
Base:    $999.99
Users:   40,000 × $0.20 = $8,000.00
Videos:  5,000 × $0.05   = $250.00
Storage: 1,000 × $0.04   = $40.00
───────────────────────
Subtotal: $9,289.99
Volume discount (20%): -$1,858.00
───────────────────────
Total:   $7,431.99/month ← 80% cheaper per user than Starter!
```

## 📈 Volume Discounts (Automatic)

Your price gets cheaper as your platform grows:

| Total Users | Discount | Example Savings |
|------------|----------|-----------------|
| 1,000      | 5% off   | Save $25-50/mo  |
| 5,000      | 10% off  | Save $100-200/mo|
| 10,000     | 15% off  | Save $300-500/mo|
| 50,000     | 20% off  | Save $1.5K-2K/mo|
| 100,000+   | 25% off  | Save $5K+/mo    |

**The more users you get, the cheaper it becomes!** 🎉

## 🔧 Setup Instructions

### 1. Get Your Stripe Keys

**Production Keys:**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Secret key** (starts with `sk_live_...`)
3. Go to: https://dashboard.stripe.com/webhooks
4. Create webhook endpoint
5. Copy **Signing secret** (starts with `whsec_...`)

**Test Keys (for development):**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy **Test mode secret key** (starts with `sk_test_...`)
3. Use test webhook secret: `whsec_test_...`

### 2. Update AWS Secrets Manager

```bash
# Option 1: AWS Console
# 1. Navigate to: AWS Console → Secrets Manager
# 2. Find: hootner-stripe-secret-key
# 3. Click "Retrieve secret value" → "Edit"
# 4. Update with: sk_live_YOUR_KEY_HERE
# 5. Save

# 2. Find: hootner-stripe-webhook-secret
# 3. Update with: whsec_YOUR_WEBHOOK_SECRET_HERE
# 4. Save

# Option 2: AWS CLI
aws secretsmanager update-secret \
  --secret-id hootner-stripe-secret-key \
  --secret-string '{"apiKey":"sk_live_YOUR_KEY_HERE"}'

aws secretsmanager update-secret \
  --secret-id hootner-stripe-webhook-secret \
  --secret-string '{"webhookSecret":"whsec_YOUR_WEBHOOK_SECRET_HERE"}'
```

### 3. Configure Stripe Webhook

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   ```
   https://YOUR_API_GATEWAY_URL/webhooks/stripe
   ```
   (Find your URL in CloudFormation outputs or `npm run aws:status`)

4. Select events to send:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.created`

5. Click **Add endpoint**
6. Copy the **Signing secret** and update Secrets Manager (step 2)

### 4. Deploy Infrastructure

```bash
# Build and deploy
npm run deploy

# Or use SAM directly
sam build
sam deploy --guided
```

### 5. Test the Integration

```bash
# Test webhook endpoint
curl -X POST https://YOUR_API_GATEWAY_URL/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'

# Expected response: 200 OK

# Test pricing calculator
node -e "
const pricing = require('./services/usage-pricing-service');
pricing.getPricingEstimate(150, 75, 15).then(console.log);
"
```

## 📊 Monitoring Usage & Billing

### View Current Usage

```bash
# Get usage for a user
node scripts/get-usage.js USER_ID

# Or query DynamoDB directly
aws dynamodb query \
  --table-name HootnerActivities \
  --key-condition-expression "PK = :pk AND begins_with(SK, :sk)" \
  --expression-attribute-values '{
    ":pk": {"S": "USER#user123"},
    ":sk": {"S": "USAGE#"}
  }'
```

### CloudWatch Dashboard

Navigate to: **CloudWatch** → **Dashboards** → **hootner-usage-pricing**

Shows:
- Active users (last 30 days)
- Total videos uploaded
- Storage used (GB)
- Stripe webhook health
- Billing calculation runs

### Billing History

Check DynamoDB for billing records:
```bash
aws dynamodb query \
  --table-name HootnerActivities \
  --key-condition-expression "PK = :pk AND begins_with(SK, :sk)" \
  --expression-attribute-values '{
    ":pk": {"S": "USER#user123"},
    ":sk": {"S": "BILLING#"}
  }'
```

## 🚨 Alerts & Notifications

### High Usage Alert

Triggers when user count exceeds 5,000:
- SNS notification sent to `AlarmNotificationTopic`
- Check CloudWatch Alarms: `hootner-high-usage`

### Billing Failures

If Stripe payment fails:
- Webhook received: `invoice.payment_failed`
- User notified via email (configured in Stripe)
- Subscription status updated in DynamoDB

## 🔐 Security

### Webhook Verification

All Stripe webhooks are verified using the webhook signing secret:

```javascript
// Automatically handled in stripeWebhookHandler.js
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
// Only proceeds if signature is valid
```

### API Keys Protection

- Stripe keys stored in **AWS Secrets Manager** (encrypted at rest)
- Only accessible by Lambda functions with IAM permissions
- Never exposed to frontend or logs
- Rotated via AWS Secrets Manager rotation

## 💡 Best Practices

### 1. Start with Test Mode
- Use `sk_test_...` keys during development
- Switch to `sk_live_...` only when ready for production
- Stripe test mode is completely free

### 2. Monitor Usage Closely
- Set up CloudWatch alarms for unexpected spikes
- Review usage dashboard weekly
- Track cost per user to optimize pricing

### 3. Communicate with Users
- Show current usage in user dashboard
- Send warnings before exceeding tier limits
- Display projected costs before month-end

### 4. Optimize Costs
- Encourage tier upgrades (better per-unit pricing)
- Implement storage cleanup (delete old videos)
- Cache frequently accessed data

## 🤝 Support

### Common Issues

**Webhook not receiving events:**
1. Check API Gateway logs in CloudWatch
2. Verify webhook URL in Stripe Dashboard
3. Test with Stripe CLI: `stripe trigger customer.subscription.created`

**Incorrect billing calculations:**
1. Check DynamoDB usage records
2. Review `PricingCalculatorFunction` logs
3. Manually trigger: `aws lambda invoke ...`

**Stripe authentication failed:**
1. Verify Secrets Manager has correct keys
2. Check Lambda function has `SecretsManagerReadWrite` policy
3. Test keys: `stripe customers list --api-key sk_live_...`

### Need Help?

- 📧 Email: support@hootner.com
- 💬 Slack: #billing-support
- 📚 Docs: [docs/STRIPE_INTEGRATION.md](docs/STRIPE_INTEGRATION.md)
- 🐛 Issues: [GitHub Issues](https://github.com/hootner/issues)

## 📝 Changelog

### v2.0 - Usage-Based Pricing
- ✅ Volume discounts up to 25%
- ✅ Automatic usage tracking
- ✅ Monthly billing automation
- ✅ Real-time CloudWatch monitoring
- ✅ Tiered pricing (4 tiers)

### v1.0 - Initial Release
- Fixed pricing ($9.99, $19.99/month)
- Manual subscription management
- Basic Stripe integration

---

**🎉 Your Stripe account is now fully connected and tracking usage in real-time!**

The more you grow, the cheaper it gets. Start at $29.99 with Starter and watch your per-user cost drop as you scale to Enterprise.
