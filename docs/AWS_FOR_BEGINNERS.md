# AWS Setup for Complete Beginners

## Don't Panic! 🦉

If you're new to AWS, you're not alone. AWS is **overwhelming** even for experienced developers. This guide assumes **zero AWS knowledge** and walks you through everything step-by-step.

## What Is AWS Anyway?

AWS (Amazon Web Services) is like renting computer infrastructure instead of buying your own servers. Think of it as:
- **Storage** (like Dropbox, but for your app)
- **Databases** (like a spreadsheet, but for millions of rows)
- **Servers** (computers that run your code 24/7)

For HOOTNER, AWS is **optional** during development.

## Two Ways to Develop

### Option 1: Local Mode (Recommended for Beginners)

**No AWS account needed!** Everything runs on your computer.

```bash
npm run aws:onboard
# Choose "Local Mode" when prompted
npm run start:all
```

**Perfect for:**
- Learning how HOOTNER works
- Building features
- Testing changes
- First 1-3 months of development

**Limitations:**
- Only you can access it (not public)
- No real CDN performance testing
- Can't test AWS-specific features

### Option 2: AWS Mode (When You're Ready)

Connect to real AWS infrastructure for production-like testing.

**Perfect for:**
- Testing with real users
- Performance optimization
- Pre-launch testing
- Production deployment

## Step-by-Step AWS Setup

### 1. Install AWS CLI

The AWS CLI is a command-line tool to control AWS.

**Windows:**
1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Restart your terminal

**Mac:**
```bash
brew install awscli
```

**Linux:**
```bash
sudo apt install awscli  # Ubuntu/Debian
sudo yum install awscli  # CentOS/RHEL
```

**Verify:**
```bash
aws --version
# Should show: aws-cli/2.x.x
```

### 2. Create an AWS Account

**Cost Reality Check:**
- Account creation is **FREE**
- **Free tier** gives 12 months of free services
- You need a credit card for verification (won't be charged)
- Development costs: Usually $0-5/month with free tier
- Production costs: Scales with usage

**Steps:**
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Enter email and account name
4. Verify email
5. Enter password
6. Add contact information
7. Enter credit card (for verification only)
8. Choose "Basic Support - Free"
9. Verify phone number
10. Done!

**Security Tip:** Enable MFA (multi-factor authentication) immediately after account creation for security.

### 3. Get Your AWS Credentials

Credentials are like a username/password for the AWS API.

**Steps:**
1. Log into AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → "Security credentials"
3. Scroll to "Access keys" section
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Check the acknowledgment box
7. Click "Next"
8. Add description: "HOOTNER Development"
9. Click "Create access key"
10. **IMPORTANT:** Download the CSV file (you can't see the secret again!)

**The CSV contains:**
- **Access Key ID**: Like a username (can be public-ish)
- **Secret Access Key**: Like a password (keep this SECRET!)

### 4. Run the Onboarding Wizard

We've built a friendly wizard that handles everything:

```bash
npm run aws:onboard
```

The wizard will:
- Check if AWS CLI is installed
- Guide you through credential setup
- Test your connection
- Configure everything automatically

**What you'll need:**
- Your Access Key ID (from the CSV)
- Your Secret Access Key (from the CSV)

### 5. Verify Setup

```bash
npm run aws:check
```

This should show your AWS account information. If it works, you're all set!

## Understanding AWS Costs

### Free Tier (First 12 Months)

✅ **FREE:**
- 1,000,000 Lambda requests/month
- 25 GB DynamoDB storage
- 5 GB S3 storage
- 50 GB data transfer

✅ **HOOTNER Development Usage:**
- ~100-1000 requests/day = FREE
- Database: <1 GB = FREE
- Storage: <5 GB videos = FREE

⚠️ **Watch Out For:**
- CloudFront data transfer (can add up)
- Leaving resources running 24/7
- Large video uploads (use compression!)

### Monitoring Costs

**Set up billing alerts:**
1. AWS Console → Billing Dashboard
2. Budgets → Create budget
3. Set $5 alert threshold
4. You'll get email if costs exceed $5

**Check costs daily:**
```bash
# Visit AWS Console → Billing Dashboard
# Shows current month's costs
```

## Switching AWS Accounts

### Why You Might Switch Accounts

- **Dev Account**: For development/testing
- **Staging Account**: For pre-production testing  
- **Production Account**: For real users
- **Personal vs Work**: Different AWS accounts for different projects

### How to Switch Accounts

#### Method 1: Using AWS Profiles (Recommended)

```bash
# Configure first account
aws configure --profile personal
# Enter credentials for personal account

# Configure second account  
aws configure --profile work
# Enter credentials for work account

# Switch between them
export AWS_PROFILE=personal  # Use personal account
export AWS_PROFILE=work      # Use work account

# Check which account you're using
aws sts get-caller-identity
```

#### Method 2: Using the Wizard

```bash
npm run aws:onboard
# Wizard will detect existing config and ask if you want to use it or create new
```

#### Method 3: Manual Switch

```bash
# Reconfigure default credentials
aws configure
# This overwrites existing credentials
```

### What Happens When You Switch

**Resources Stay Separate:**
- Each AWS account has completely separate resources
- DynamoDB tables from Account A don't exist in Account B
- Deployed infrastructure is isolated per account

**You'll Need To:**
1. Re-deploy infrastructure: `npm run aws:deploy`
2. Re-setup databases: `npm run db:setup`
3. Update environment variables (if any are account-specific)

**Configuration Stays:**
- Your code doesn't change
- HOOTNER configuration is account-agnostic
- Just point to different AWS credentials

### Best Practices for Multiple Accounts

**Use profiles for clarity:**
```bash
# Always be explicit about which account
aws configure --profile hootner-dev
aws configure --profile hootner-staging
aws configure --profile hootner-prod

# Set active profile
export AWS_PROFILE=hootner-dev
```

**Add to your shell config:**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias aws-dev='export AWS_PROFILE=hootner-dev'
alias aws-staging='export AWS_PROFILE=hootner-staging'
alias aws-prod='export AWS_PROFILE=hootner-prod'

# Then use:
aws-dev      # Switch to dev
aws-staging  # Switch to staging
```

**Check before deploying:**
```bash
# Always verify which account before deploying
echo $AWS_PROFILE
aws sts get-caller-identity
npm run aws:deploy
```

## Common Issues for Beginners

### "AWS CLI not found"

**Problem:** Terminal can't find `aws` command.

**Fix:**
1. Install AWS CLI (see above)
2. Restart terminal/VS Code
3. Try again

### "The security token included in the request is invalid"

**Problem:** Credentials are wrong or expired.

**Fix:**
```bash
# Re-configure credentials
aws configure
# Enter correct Access Key ID and Secret Access Key
```

### "Access Denied" Errors

**Problem:** Your AWS user doesn't have permissions.

**Fix:**
1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Click "Users" → Your username
3. Click "Add permissions" → "Attach policies directly"
4. Add: `AdministratorAccess` (for development only!)

**Security Note:** Only use `AdministratorAccess` for your personal dev account. Production should use minimal permissions.

### "Region not found"

**Problem:** No default region configured.

**Fix:**
```bash
aws configure
# When prompted for region, enter: us-east-1
```

### Forgot to Download Credentials CSV

**Problem:** Created access key but didn't download it.

**Fix:**
1. Go to Security Credentials
2. Delete the old access key
3. Create a new one
4. Download the CSV this time!

## Getting Help

### In VS Code
```bash
npm run aws:onboard  # Run wizard again anytime
npm run aws:check    # Verify AWS connection
```

### AWS Documentation
- AWS Free Tier: https://aws.amazon.com/free/
- AWS CLI Guide: https://docs.aws.amazon.com/cli/latest/userguide/
- Billing Dashboard: https://console.aws.amazon.com/billing/

### HOOTNER Community
- GitHub Issues: https://github.com/hootner/enterprise-platform/issues
- Documentation: See [docs/](.)

## Next Steps

Once AWS is configured:

1. **Test connection:**
   ```bash
   npm run aws:check
   ```

2. **Deploy infrastructure:**
   ```bash
   npm run aws:deploy
   ```

3. **Start developing:**
   ```bash
   npm run start:all
   ```

4. **Monitor costs:**
   - Set up billing alerts
   - Check AWS Billing Dashboard weekly

## Remember

- **Start with Local Mode** - No AWS needed initially
- **Free Tier is generous** - 12 months of free services
- **You can switch accounts** anytime - It's just configuration
- **Costs are predictable** - Set billing alerts
- **AWS is complex** - That's normal, take it step by step

You've got this! 🦉
