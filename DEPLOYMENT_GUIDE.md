# 🚀 HOOTNER Infrastructure - Quick Deployment Guide

## 📋 Prerequisites Checklist

- [ ] AWS CLI installed and configured
- [ ] AWS SAM CLI installed (`pip install aws-sam-cli`)
- [ ] Node.js 18+ installed
- [ ] AWS Account ID: 504165876439
- [ ] Admin email for alerts

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Validate template
sam validate --template template-enhanced.yaml

# 2. Build (if you have Lambda code)
sam build --template template-enhanced.yaml

# 3. Deploy with guided setup
sam deploy \
  --template-file template-enhanced.yaml \
  --stack-name hootner-platform \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=prod \
    AdminEmail=your-email@example.com \
  --guided

# 4. Get all outputs
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs' \
  --output table
```

## 📦 What Gets Created

### ✅ Storage (3 S3 Buckets)
- `hootner-videos-{AccountId}` - Video storage with versioning
- `hootner-uploads-{AccountId}` - User uploads with S3 notifications
- `hootner-frontend-{AccountId}` - Static website hosting

### ✅ CDN (CloudFront)
- Distribution with S3 and API Gateway origins
- Automatic HTTPS redirect
- Caching for static assets
- API passthrough for /api/* and /graphql

### ✅ Authentication (Cognito)
- User Pool with email verification
- Password policy enforcement
- Optional MFA support
- OAuth 2.0 client

### ✅ Async Processing (SQS)
- Video processing queue (15 min visibility)
- Dead letter queue (14 day retention)
- Notification queue
- S3 → SQS integration

### ✅ Database (DynamoDB)
- Single-table design with GSIs
- Point-in-time recovery enabled
- KMS encryption
- TTL for auto-cleanup
- DynamoDB Streams

### ✅ Security
- KMS encryption key
- Secrets Manager (API keys, JWT)
- API Gateway with API key auth
- Usage plans and throttling

### ✅ Monitoring (CloudWatch)
- SNS topic for alarms
- API 5XX error alarm
- Lambda error alarm
- DLQ message alarm
- Email notifications

## 🔑 Post-Deployment Steps

### 1. Save Important Outputs

```bash
# Get CloudFront domain
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomain`].OutputValue' \
  --output text

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text

# Get User Pool ID
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text

# Get API Key
aws apigateway get-api-keys \
  --name-query HootnerAPIKey \
  --include-values \
  --query 'items[0].value' \
  --output text
```

### 2. Update Secrets

```bash
# Update API secrets
aws secretsmanager update-secret \
  --secret-id hootner-platform/api-keys \
  --secret-string '{
    "OPENAI_API_KEY": "sk-your-real-key",
    "STRIPE_SECRET_KEY": "sk_live_your-key",
    "FIREBASE_API_KEY": "your-firebase-key"
  }'
```

### 3. Upload Frontend

```bash
# Get bucket name
BUCKET=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`StaticAssetsBucket`].OutputValue' \
  --output text)

# Upload HTML pages
aws s3 sync apps/frontend/html-pages/ s3://$BUCKET/ \
  --exclude "*.js" \
  --exclude "node_modules/*" \
  --cache-control "max-age=86400"

# Get CloudFront distribution ID
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='hootner-platform CDN'].Id" \
  --output text)

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

### 4. Create Test User

```bash
# Get User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin@hootner.com \
  --user-attributes Name=email,Value=admin@hootner.com Name=name,Value="Admin User" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username admin@hootner.com \
  --password "YourSecurePassword123!" \
  --permanent
```

### 5. Test API

```bash
# Get API endpoint and key
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

API_KEY=$(aws apigateway get-api-keys \
  --name-query HootnerAPIKey \
  --include-values \
  --query 'items[0].value' \
  --output text)

# Test GraphQL endpoint
curl -X POST "${API_ENDPOINT}/graphql" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

## 🔧 Update Frontend Configuration

Create `.env.production` in `apps/frontend/`:

```bash
# Get all values
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomain`].OutputValue' \
  --output text)

API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text)

# Create .env file
cat > apps/frontend/.env.production << EOF
VITE_API_ENDPOINT=${API_ENDPOINT}
VITE_GRAPHQL_ENDPOINT=${API_ENDPOINT}/graphql
VITE_CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}
VITE_USER_POOL_ID=${USER_POOL_ID}
VITE_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
VITE_AWS_REGION=us-east-1
EOF
```

## 📊 Monitoring Dashboard

### View CloudWatch Metrics

```bash
# API Gateway metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --dimensions Name=ApiName,Value=HootnerAPI \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Lambda errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# DLQ messages
QUEUE_NAME=$(aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].Resources[?LogicalResourceId==`DeadLetterQueue`].PhysicalResourceId' \
  --output text)

aws cloudwatch get-metric-statistics \
  --namespace AWS/SQS \
  --metric-name ApproximateNumberOfMessagesVisible \
  --dimensions Name=QueueName,Value=$QUEUE_NAME \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## 🧪 Testing Checklist

- [ ] CloudFront serves static files
- [ ] API Gateway responds to /graphql
- [ ] Cognito user can sign in
- [ ] S3 upload triggers SQS message
- [ ] DynamoDB read/write works
- [ ] CloudWatch alarms send emails
- [ ] Secrets Manager accessible by Lambda

## 💰 Cost Estimate

**Monthly costs (production workload):**
- S3 (1TB): ~$23
- CloudFront (1TB transfer): ~$85
- DynamoDB (PAY_PER_REQUEST): ~$10-20
- Lambda (1M requests): Free tier
- API Gateway (1M requests): Free tier
- Cognito (50K MAU): Free tier
- SQS: ~$0.40
- Secrets Manager: ~$1.20
- CloudWatch Alarms (3): ~$0.30
- KMS: ~$1

**Total: ~$120-130/month**

## 🔄 Update Stack

```bash
# After making changes to template
sam build --template template-enhanced.yaml

sam deploy \
  --template-file template-enhanced.yaml \
  --stack-name hootner-platform \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset
```

## 🗑️ Cleanup (Delete Everything)

```bash
# Empty S3 buckets first
aws s3 rm s3://hootner-videos-504165876439 --recursive
aws s3 rm s3://hootner-uploads-504165876439 --recursive
aws s3 rm s3://hootner-frontend-504165876439 --recursive

# Delete stack
aws cloudformation delete-stack --stack-name hootner-platform

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name hootner-platform
```

## 🆘 Troubleshooting

### Stack Creation Failed

```bash
# View events
aws cloudformation describe-stack-events \
  --stack-name hootner-platform \
  --max-items 20

# Check specific resource
aws cloudformation describe-stack-resource \
  --stack-name hootner-platform \
  --logical-resource-id GraphQLFunction
```

### Lambda Can't Access DynamoDB

```bash
# Check IAM role
aws iam get-role-policy \
  --role-name hootner-platform-GraphQLFunctionRole-XXXXX \
  --policy-name DynamoDBCrudPolicy
```

### CloudFront 403 Errors

```bash
# Check bucket policy
aws s3api get-bucket-policy \
  --bucket hootner-frontend-504165876439

# Verify OAI
aws cloudfront get-cloud-front-origin-access-identity \
  --id YOUR_OAI_ID
```

## 📞 Support

- AWS SAM Docs: https://docs.aws.amazon.com/serverless-application-model/
- CloudFormation: https://docs.aws.amazon.com/cloudformation/
- Troubleshooting: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/troubleshooting.html

---

**Last Updated:** January 24, 2026  
**Template Version:** 1.0.0  
**Status:** Production Ready ✅
