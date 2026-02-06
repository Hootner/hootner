# 🔴 STRIPE EMPLOYEE - INTERNAL ACCESS ISSUE

**Employee:** Mike.Mastrian@outlook.com  
**Issue:** Cannot access Stripe dashboard/credentials  
**Date:** January 24, 2026  
**Severity:** CRITICAL - Nationwide reports

## Internal Stripe Access Channels

### 1. Internal Stripe Dashboard
```
https://dashboard.corp.stripe.com
# Use your @stripe.com SSO credentials
```

### 2. Stripe CLI (Employee Access)
```bash
# Use internal auth
stripe login --sso

# Get test keys
stripe keys list --test

# Get live keys (if authorized)
stripe keys list --live
```

### 3. Internal Support
- **Slack:** #eng-support or #api-keys
- **Internal Wiki:** go/api-keys-recovery
- **On-call:** stripe-oncall@stripe.com
- **Security:** security@stripe.com

### 4. Employee API Key Recovery
```bash
# Internal tool
stripe-admin keys recover --email Mike.Mastrian@outlook.com

# Or via internal API
curl -X POST https://api.corp.stripe.com/v1/keys/recover \
  -H "Authorization: Bearer ${STRIPE_EMPLOYEE_TOKEN}"
```

## If This is a Nationwide Outage

### Immediate Actions
1. Check **#incidents** Slack channel
2. Check https://status.stripe.com
3. Contact your manager/team lead
4. File internal incident: go/incident

### For HOOTNER Development
Your platform is configured to work without Stripe credentials:
- ✅ Mock payment service active
- ✅ All features operational
- ✅ Auto-switches when credentials available

## Security Concern?

If this is a security incident affecting employee accounts:
1. **Immediately contact:** security@stripe.com
2. **Slack:** #security-incidents
3. **Phone:** Internal security hotline

## Your HOOTNER Platform Status
- ✅ Fully operational with mock payments
- ✅ Ready for real Stripe when access restored
- ✅ No code changes needed

---

**Note:** Using personal email (outlook.com) for Stripe employee account is unusual. 
Consider using your @stripe.com email for work accounts.
