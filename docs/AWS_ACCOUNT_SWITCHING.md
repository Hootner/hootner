# AWS Account Switching - Visual Guide

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR COMPUTER                                               │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  HOOTNER     │      │  AWS CLI     │                    │
│  │  Project     │◄─────┤  Credentials │                    │
│  └──────────────┘      └──────────────┘                    │
│         │                      │                            │
│         │                      │ Points to one             │
│         │                      │ account at a time         │
│         │                      │                            │
└─────────┼──────────────────────┼────────────────────────────┘
          │                      │
          │                      ▼
          │              ┌───────────────┐
          │              │ Account       │
          │              │ Switcher      │
          │              └───────┬───────┘
          │                      │
          │        ┌─────────────┼─────────────┐
          │        │             │             │
          ▼        ▼             ▼             ▼
    ┌─────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
    │ AWS     │ │ AWS       │ │ AWS       │ │ AWS       │
    │ Account │ │ Account   │ │ Account   │ │ Account   │
    │ Dev     │ │ Staging   │ │ Prod      │ │ Personal  │
    └─────────┘ └───────────┘ └───────────┘ └───────────┘
    Resources   Resources     Resources     Resources
    Isolated    Isolated      Isolated      Isolated
```

## What Switching Looks Like

### Before Switch (Using Dev Account)

```
┌─────────────────────────────────────────────────┐
│ ~/.aws/credentials                              │
├─────────────────────────────────────────────────┤
│ [default]                                       │
│ aws_access_key_id = AKIADEV123456               │
│ aws_secret_access_key = abc123dev               │
│                                                 │
│ [staging]                                       │
│ aws_access_key_id = AKIASTAGE789                │
│ aws_secret_access_key = xyz789stage             │
└─────────────────────────────────────────────────┘

Current: Dev Account (default)
Commands target: Dev Account
```

### After Switch (Using Staging Account)

```bash
# Switch command
export AWS_PROFILE=staging
```

```
┌─────────────────────────────────────────────────┐
│ ~/.aws/credentials (same file, different target)│
├─────────────────────────────────────────────────┤
│ [default]                                       │
│ aws_access_key_id = AKIADEV123456               │
│ aws_secret_access_key = abc123dev               │
│                                                 │
│ [staging]  ◄── Now using this!                  │
│ aws_access_key_id = AKIASTAGE789                │
│ aws_secret_access_key = xyz789stage             │
└─────────────────────────────────────────────────┘

Current: Staging Account  
Commands target: Staging Account
```

## Resource Isolation

```
AWS Dev Account                   AWS Staging Account
┌─────────────────┐              ┌─────────────────┐
│ DynamoDB Tables │              │ DynamoDB Tables │
│ - videos-dev    │              │ - videos-stage  │
│ - users-dev     │              │ - users-stage   │
├─────────────────┤              ├─────────────────┤
│ S3 Buckets      │              │ S3 Buckets      │
│ - hootner-dev   │              │ - hootner-stage │
├─────────────────┤              ├─────────────────┤
│ Lambda Functions│              │ Lambda Functions│
│ - processVideo  │              │ - processVideo  │
├─────────────────┤              ├─────────────────┤
│ CloudFront      │              │ CloudFront      │
│ - Distribution  │              │ - Distribution  │
└─────────────────┘              └─────────────────┘
     Isolated                         Isolated
     $X/month                         $Y/month
```

## Switching Methods

### Method 1: Environment Variable (Temporary)

```bash
# Current session only
export AWS_PROFILE=staging
npm run aws:deploy

# Returns to default when terminal closes
```

```
┌──────────────────────────────────────┐
│ Terminal Session                     │
│                                      │
│ AWS_PROFILE=staging                  │
│ └─► All commands use staging        │
│                                      │
│ Close terminal → Back to default    │
└──────────────────────────────────────┘
```

### Method 2: Profile in Every Command

```bash
# Specify profile per command
aws s3 ls --profile staging
aws dynamodb list-tables --profile dev
```

```
┌──────────────────────────────────────┐
│ Explicit per command                 │
│                                      │
│ --profile staging → Staging account  │
│ --profile dev     → Dev account      │
│ No --profile      → Default account  │
└──────────────────────────────────────┘
```

### Method 3: Change Default Profile

```bash
# Overwrites default credentials
aws configure
# Enter new credentials
```

```
Before:                    After:
┌──────────────┐          ┌──────────────┐
│ [default]    │          │ [default]    │
│ = Dev Account│   →→→    │ = New Account│
└──────────────┘          └──────────────┘
Old creds lost            Must re-enter
(unless backed up)        old creds later
```

## What Happens to Resources When You Switch

### Scenario: You have deployed infrastructure in Dev, now switching to Staging

```
Step 1: Before Switch
┌────────────────────────────────┐
│ Dev Account (Active)           │
│ ✓ DynamoDB tables exist        │
│ ✓ Lambda functions deployed    │
│ ✓ S3 buckets with videos       │
│ ✓ CloudFront distribution      │
└────────────────────────────────┘

Step 2: Execute Switch
$ export AWS_PROFILE=staging

Step 3: After Switch
┌────────────────────────────────┐
│ Dev Account (Inactive)         │
│ ✓ Resources still exist!       │
│ ✓ Still running (if started)   │
│ ✓ Still incurring costs        │
│ ✗ Can't access from CLI now    │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Staging Account (Active)       │
│ ✗ No HOOTNER resources yet     │
│ ➜ Need to deploy               │
│ $ npm run aws:deploy           │
└────────────────────────────────┘

Step 4: Deploy to New Account
$ npm run aws:deploy
✓ New resources created in Staging
✓ Separate from Dev
✓ Independent costs
```

## Common Patterns

### Pattern 1: Dev → Staging → Production Pipeline

```
Developer Workflow:
1. Local Mode (no AWS)
   ↓ Build features
2. Dev Account (test AWS integration)
   ↓ Test deployment
3. Staging Account (pre-production)
   ↓ Test with real users
4. Production Account (live)
   ↓ Launch!

Each step = Different AWS account
Each account = Isolated resources
```

### Pattern 2: Personal Projects vs Work

```
# Morning: Work on personal project
export AWS_PROFILE=personal
npm run aws:deploy
# Deploys to personal account
# Bill goes to personal credit card

# Afternoon: Work on company project
export AWS_PROFILE=work
npm run aws:deploy
# Deploys to work account
# Bill goes to company
```

## Pro Tips for Managing Multiple Accounts

### Shell Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Quick switches
alias aws-dev='export AWS_PROFILE=dev && npm run aws:status'
alias aws-stage='export AWS_PROFILE=staging && npm run aws:status'
alias aws-prod='export AWS_PROFILE=production && npm run aws:status'
alias aws-personal='export AWS_PROFILE=personal && npm run aws:status'

# Safety check
alias aws-whoami='aws sts get-caller-identity'

# Deploy with confirmation
alias aws-deploy='npm run aws:status && read -p "Deploy to this account? (y/n) " -n 1 -r && echo && [[ $REPLY =~ ^[Yy]$ ]] && npm run aws:deploy'
```

### VS Code Extension

Install AWS Toolkit extension to see which account is active in VS Code status bar:

```
Status Bar: AWS: dev (us-east-1)  ◄── Always visible
```

### Account Naming Convention

```bash
# Clear names prevent mistakes
aws configure --profile hootner-dev-john
aws configure --profile hootner-staging-shared
aws configure --profile hootner-prod-readonly
```

## Checklist: Before Switching Accounts

```
Before you switch:
[ ] Know which account you're currently using
    $ aws sts get-caller-identity
    
[ ] Document any important resource IDs
    - DynamoDB table names
    - S3 bucket names
    - CloudFront distributions
    
[ ] Ensure work is committed to git
    $ git status
    
[ ] Stop any running AWS services
    (if you want to avoid costs)

After you switch:
[ ] Verify new account
    $ npm run aws:status
    
[ ] Deploy if needed
    $ npm run aws:deploy
    
[ ] Update any environment variables
    (if account-specific)
    
[ ] Test connection
    $ npm run aws:check
```

## Cost Tracking Across Accounts

```
Account A: Dev          Account B: Staging      Account C: Production
┌────────────────┐     ┌────────────────┐      ┌────────────────┐
│ Monthly: $2    │     │ Monthly: $8    │      │ Monthly: $150  │
│ (mostly free)  │     │ (light usage)  │      │ (active users) │
└────────────────┘     └────────────────┘      └────────────────┘
     Separate              Separate                 Separate
     billing               billing                  billing
```

**Track each account separately in AWS Billing Dashboard**

## Summary

✅ **Switching is safe** - Resources stay in their original accounts

✅ **It's just configuration** - Changes which account CLI talks to

✅ **Code doesn't change** - HOOTNER works the same in any account

✅ **Resources are isolated** - Changes in one account don't affect others

✅ **Use profiles** - Easier than overwriting credentials

✅ **Always verify** - Run `npm run aws:status` after switching

---

**Remember:** Switching AWS accounts is like changing which server you're deploying to. Your code doesn't change, just the destination.
