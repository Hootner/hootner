# 🚀 Deployment Checklist - 120 Pipe Infrastructure

## ✅ Pre-Deployment Status

**Template:** [template-enhanced.yaml](template-enhanced.yaml)  
**Total Connections:** 120 pipes  
**Template Size:** 913 lines  
**Status:** Ready for deployment ✅

---

## 📋 Pre-Deployment Checklist

### 1. Environment Preparation
- [ ] AWS CLI configured: `aws configure list`
- [ ] AWS credentials active: `aws sts get-caller-identity`
- [ ] SAM CLI installed: `sam --version`
- [ ] Node.js 20+ installed: `node --version`
- [ ] All dependencies installed: `npm install`

### 2. Template Validation
```bash
# Validate CloudFormation syntax
sam validate --lint

# Check for template errors
aws cloudformation validate-template --template-body file://template-enhanced.yaml
```

### 3. Review New Connections (105 → 120)
- [ ] **+10 new environment variables** across both Lambda functions
- [ ] **+5 new IAM policies** for enhanced permissions
- [ ] **+16 explicit dependencies** for proper initialization
- [ ] **+4 new !GetAtt** connections for resource attributes
- [ ] **+12 new !Ref** connections for direct references

### 4. Secrets Configuration
```bash
# Update API keys in Secrets Manager (after initial deployment)
aws secretsmanager put-secret-value \
  --secret-id hootner/api-keys \
  --secret-string '{
    "OPENAI_API_KEY": "your-key-here",
    "STRIPE_SECRET_KEY": "your-key-here",
    "FIREBASE_API_KEY": "your-key-here"
  }'

# Update JWT secret
aws secretsmanager put-secret-value \
  --secret-id hootner/jwt-secret \
  --secret-string "your-jwt-secret-here"
```

---

## 🎯 Deployment Commands

### Option 1: Quick Deploy (Recommended)
```bash
# All-in-one deployment
npm run aws:quick-deploy
```

### Option 2: Manual SAM Deploy
```bash
# Build and deploy with SAM
sam build
sam deploy --guided
```

### Option 3: Step-by-Step
```bash
# 1. Build the application
sam build

# 2. Deploy with stack name
sam deploy \
  --stack-name hootner-platform \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=prod \
    AdminEmail=your-email@domain.com

# 3. Get stack outputs
npm run aws:setup-env

# 4. Deploy frontend to CloudFront
npm run aws:deploy-cloudfront
```

---

## 🔍 Post-Deployment Verification

### 1. Check Stack Status
```bash
# View deployment status
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query 'Stacks[0].StackStatus'

# Expected: CREATE_COMPLETE or UPDATE_COMPLETE
```

### 2. Verify All 120 Connections

**Lambda Environment Variables (20 checks):**
```bash
# GraphQLFunction (11 vars)
aws lambda get-function-configuration --function-name hootner-platform-graphql \
  --query 'Environment.Variables' --output json

# Should include:
# ✓ TABLE_NAME (global)
# ✓ NODE_ENV (global)
# ✓ VIDEO_BUCKET
# ✓ UPLOAD_BUCKET
# ✓ STATIC_BUCKET (NEW)
# ✓ USER_POOL_ID
# ✓ VIDEO_QUEUE_URL
# ✓ NOTIFICATION_QUEUE_URL (NEW)
# ✓ KMS_KEY_ID (NEW)
# ✓ CLOUDFRONT_DISTRIBUTION_ID (NEW)
# ✓ API_SECRETS_ARN (NEW)
# ✓ JWT_SECRET_ARN (NEW)
# ✓ AWS_REGION (NEW)

# S3EventProcessorFunction (9 vars)
aws lambda get-function-configuration --function-name hootner-platform-s3-processor \
  --query 'Environment.Variables' --output json

# Should include:
# ✓ TABLE_NAME (global)
# ✓ NODE_ENV (global)
# ✓ VIDEO_BUCKET
# ✓ UPLOAD_BUCKET
# ✓ VIDEO_QUEUE_URL
# ✓ NOTIFICATION_QUEUE_URL (NEW)
# ✓ KMS_KEY_ID (NEW)
# ✓ AWS_REGION (NEW)
```

**IAM Policies (15 checks):**
```bash
# Check GraphQLFunction policies
aws lambda get-policy --function-name hootner-platform-graphql

# Should have access to:
# ✓ DynamoDB (HootnerTable)
# ✓ S3 (VideoStorageBucket, UploadBucket)
# ✓ SQS (VideoProcessingQueue, NotificationQueue) (NEW)
# ✓ Secrets Manager (APISecrets, JWTSecret)
# ✓ KMS (EncryptionKey) (NEW)
# ✓ CloudFront (Invalidation) (NEW)

# Check S3EventProcessorFunction policies
aws lambda get-policy --function-name hootner-platform-s3-processor

# Should have access to:
# ✓ DynamoDB (HootnerTable)
# ✓ S3 (VideoStorageBucket, UploadBucket)
# ✓ SQS (VideoProcessingQueue, NotificationQueue) (NEW)
# ✓ KMS (EncryptionKey) (NEW)
```

**Resource Dependencies (16 checks):**
```bash
# CloudFormation will ensure these are created in order:
# GraphQLFunction depends on:
# ✓ HootnerTable
# ✓ APIKeysLayer
# ✓ VideoStorageBucket
# ✓ UploadBucket
# ✓ StaticAssetsBucket
# ✓ VideoProcessingQueue
# ✓ NotificationQueue
# ✓ APISecrets
# ✓ JWTSecret
# ✓ EncryptionKey

# S3EventProcessorFunction depends on:
# ✓ HootnerTable
# ✓ VideoStorageBucket
# ✓ UploadBucket
# ✓ VideoProcessingQueue
# ✓ NotificationQueue
# ✓ EncryptionKey
```

### 3. Test Critical Data Flows

**Video Upload Pipeline:**
```bash
# 1. Get upload URL
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/prod/api/upload/presign \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.mp4", "contentType": "video/mp4"}'

# 2. Upload to S3 (use presigned URL from step 1)

# 3. Check SQS queue for message
aws sqs get-queue-attributes \
  --queue-url $(aws cloudformation describe-stacks --stack-name hootner-platform --query "Stacks[0].Outputs[?OutputKey=='VideoProcessingQueueUrl'].OutputValue" --output text) \
  --attribute-names ApproximateNumberOfMessages

# 4. Verify DynamoDB entry
aws dynamodb scan --table-name hootner-activities --limit 1
```

**Authentication Flow:**
```bash
# Test Cognito user pool
aws cognito-idp describe-user-pool \
  --user-pool-id $(aws cloudformation describe-stacks --stack-name hootner-platform --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
```

**CloudFront Distribution:**
```bash
# Get CloudFront domain
aws cloudformation describe-stacks \
  --stack-name hootner-platform \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" \
  --output text

# Test access
curl -I https://your-cloudfront-domain.cloudfront.net
```

### 4. Monitor CloudWatch Logs
```bash
# GraphQL Lambda logs
aws logs tail /aws/lambda/hootner-platform-graphql --follow

# S3 Processor Lambda logs
aws logs tail /aws/lambda/hootner-platform-s3-processor --follow

# Check for errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/hootner-platform-graphql \
  --filter-pattern "ERROR"
```

### 5. Check CloudWatch Alarms
```bash
# List all alarms
aws cloudwatch describe-alarms \
  --alarm-name-prefix hootner-platform

# Should see:
# ✓ hootner-platform-api-5xx-errors (API Gateway 5xx)
# ✓ hootner-platform-lambda-errors (Lambda errors)
# ✓ hootner-platform-dlq-messages (Dead letter queue)
```

---

## 🆕 New Features to Test

### 1. Notification System
```javascript
// In your Lambda code, you can now send notifications:
const { SQS } = require('@aws-sdk/client-sqs');
const sqs = new SQS();

await sqs.sendMessage({
  QueueUrl: process.env.NOTIFICATION_QUEUE_URL, // NEW
  MessageBody: JSON.stringify({
    type: 'upload_complete',
    videoId: 'abc123',
    userId: 'user456'
  })
});
```

### 2. CloudFront Cache Invalidation
```javascript
// Invalidate cache after updating static assets:
const { CloudFront } = require('@aws-sdk/client-cloudfront');
const cf = new CloudFront();

await cf.createInvalidation({
  DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID, // NEW
  InvalidationBatch: {
    CallerReference: Date.now().toString(),
    Paths: { Quantity: 1, Items: ['/*'] }
  }
});
```

### 3. KMS Encryption
```javascript
// Encrypt/decrypt data with KMS:
const { KMS } = require('@aws-sdk/client-kms');
const kms = new KMS();

const encrypted = await kms.encrypt({
  KeyId: process.env.KMS_KEY_ID, // NEW
  Plaintext: Buffer.from('sensitive data')
});
```

### 4. Region-Aware Operations
```javascript
// Use region-aware S3 client:
const { S3 } = require('@aws-sdk/client-s3');
const s3 = new S3({ region: process.env.AWS_REGION }); // NEW
```

---

## 🔧 Troubleshooting

### Issue: Lambda can't access new environment variables
```bash
# Re-deploy Lambda configuration
sam deploy --no-execute-changeset

# Or update function directly
aws lambda update-function-configuration \
  --function-name hootner-platform-graphql \
  --environment "Variables={...add missing vars...}"
```

### Issue: IAM permission denied
```bash
# Check IAM role
aws lambda get-function --function-name hootner-platform-graphql \
  --query 'Configuration.Role'

# View role policies
aws iam list-role-policies --role-name <role-name-from-above>
```

### Issue: DependsOn causing circular dependencies
```bash
# Check CloudFormation events
aws cloudformation describe-stack-events \
  --stack-name hootner-platform \
  --max-items 20
```

### Issue: Secrets not accessible
```bash
# Verify Lambda has permission
aws secretsmanager get-secret-value --secret-id hootner/api-keys

# Check if Lambda layer is attached
aws lambda get-function --function-name hootner-platform-graphql \
  --query 'Configuration.Layers'
```

---

## 📊 Success Metrics

After deployment, you should see:

| Metric | Expected | Command to Check |
|--------|----------|------------------|
| **Stack Status** | `UPDATE_COMPLETE` | `aws cloudformation describe-stacks` |
| **Lambda Functions** | 2 active | `aws lambda list-functions` |
| **S3 Buckets** | 4 created | `aws s3 ls` |
| **DynamoDB Table** | 1 active | `aws dynamodb list-tables` |
| **SQS Queues** | 3 created | `aws sqs list-queues` |
| **CloudFront Distribution** | 1 deployed | `aws cloudfront list-distributions` |
| **Cognito User Pool** | 1 active | `aws cognito-idp list-user-pools` |
| **Secrets** | 2 configured | `aws secretsmanager list-secrets` |
| **CloudWatch Alarms** | 3 monitoring | `aws cloudwatch describe-alarms` |
| **Total Connections** | 120 pipes | All resources properly wired |

---

## 🎉 Deployment Complete!

Once all checks pass:

1. **Save Stack Outputs:**
   ```bash
   npm run aws:setup-env
   # Creates .env.aws with all endpoints
   ```

2. **Deploy Frontend:**
   ```bash
   npm run aws:deploy-cloudfront
   # Uploads HTML/CSS/JS to S3 and invalidates cache
   ```

3. **Access Your Platform:**
   - **API:** https://your-api-id.execute-api.region.amazonaws.com/prod
   - **GraphQL:** https://your-api-id.execute-api.region.amazonaws.com/prod/graphql
   - **Frontend:** https://your-distribution.cloudfront.net
   - **Dashboard:** https://your-distribution.cloudfront.net/dashboard.html

4. **Monitor & Scale:**
   - Check CloudWatch dashboards
   - Review alarm notifications
   - Scale Lambda concurrency if needed
   - Monitor DynamoDB capacity

---

## 📚 Related Documentation

- [TEMPLATE_CONNECTIONS_MAP.md](TEMPLATE_CONNECTIONS_MAP.md) - Detailed connection inventory
- [TEMPLATE_UPDATE_SUMMARY.md](TEMPLATE_UPDATE_SUMMARY.md) - What changed (105 → 120)
- [AWS_INTEGRATION_COMPLETE.md](AWS_INTEGRATION_COMPLETE.md) - Integration guide
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Deployment shortcuts

---

**🚀 Ready to deploy your 120-pipe infrastructure!**
