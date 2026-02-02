# 🎯 Quick Start: AWS Deployment

Your HOOTNER platform is now ready for AWS deployment!

## ⚡ One-Command Deployment

```bash
npm run aws:quick-deploy
```

That's it! This will:
1. ✅ Install all dependencies
2. ✅ Build Lambda layers
3. ✅ Package CloudFormation stack
4. ✅ Deploy to AWS
5. ✅ Setup environment variables

## 📋 Manual Step-by-Step

If you prefer manual control:

### 1. Install Dependencies
```bash
npm install
npm run layer:install
```

### 2. Deploy Infrastructure
```bash
sam build
sam deploy --guided
```

During `--guided` setup:
- Stack Name: `hootner` (or your choice)
- AWS Region: `us-east-1` (or your choice)
- Confirm changes: `Y`
- Allow SAM CLI IAM creation: `Y`
- Save arguments: `Y`

### 3. Get Your Endpoints
```bash
npm run aws:setup-env
cat .env.aws
```

### 4. Update API Secrets
```bash
aws secretsmanager put-secret-value \
  --secret-id hootner/api-keys \
  --secret-string '{
    "OPENAI_API_KEY": "<your-openai-api-key>",
    "STRIPE_SECRET_KEY": "<your-stripe-secret-key>",
    "FIREBASE_API_KEY": "<your-firebase-api-key>"
  }'
```

### 5. Deploy Frontend
```bash
npm run aws:deploy-cloudfront
```

## 🧪 Test Your Deployment

```bash
# Get your API endpoint
source .env.aws

# Test health endpoint
curl $API_ENDPOINT/health

# Test GraphQL
curl $GRAPHQL_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

## 🔑 Get API Key

```bash
# Describe the API key
aws apigateway get-api-keys --include-values

# Or get from CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name hootner \
  --query 'Stacks[0].Outputs'
```

## 📱 Use Your API

### Upload a Video

```javascript
// Frontend code
const userAuth = 'jwt_value';
const apiEndpoint = 'https://<your-api-id>.execute-api.us-east-1.amazonaws.com/prod';

// 1. Get presigned URL
const { uploadURL, fileKey } = await fetch(`${apiEndpoint}/api/upload/presign`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userAuth}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filename: 'video.mp4',
    contentType: 'video/mp4',
    fileSize: videoFile.size
  })
}).then(r => r.json());

// 2. Upload to S3
await fetch(uploadURL, {
  method: 'PUT',
  body: videoFile
});

// 3. Complete upload
await fetch(`${apiEndpoint}/api/upload/complete`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userAuthToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileKey,
    title: 'My Video',
    description: 'Description'
  })
});
```

## 🔧 Common Commands

```bash
# View CloudFormation status
aws cloudformation describe-stacks --stack-name hootner

# View Lambda logs
aws logs tail /aws/lambda/hootner-graphql --follow

# Update just the Lambda code
sam build && sam deploy --no-confirm-changeset

# Delete stack (cleanup)
aws cloudformation delete-stack --stack-name hootner
```

## 🚨 Troubleshooting

### "AccessDeniedException"
```bash
# Check your AWS credentials
aws sts get-caller-identity

# Re-configure if needed
npm run aws:onboard
```

### "ValidationError: Template format error"
```bash
# Validate template
sam validate

# Check for syntax errors in template-enhanced.yaml
```

### "No such file or directory: api/layers"
```bash
# Install layer dependencies
npm run layer:install
```

### Lambda timeout
- Increase `Timeout` in template.yaml (default: 30s, max: 900s)
- Optimize cold starts by increasing `MemorySize`

## 💰 Cost Estimate

With AWS Free Tier:
- API Gateway: 1M requests/month FREE
- Lambda: 1M requests/month FREE
- DynamoDB: 25GB storage FREE
- S3: 5GB storage FREE
- CloudFront: 50GB transfer FREE

**Expected monthly cost:** $0-10 for typical development usage

## 📊 Monitoring

View in AWS Console:
- **CloudWatch**: Logs and metrics
- **API Gateway**: Request stats
- **Lambda**: Invocations and errors
- **S3**: Storage usage
- **DynamoDB**: Read/write units

Or use AWS CLI:
```bash
# Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=hootner-graphql \
  --start-time 2026-01-25T00:00:00Z \
  --end-time 2026-01-26T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## ✅ Success Checklist

- [ ] Infrastructure deployed (sam deploy)
- [ ] .env.aws created with endpoints
- [ ] API secrets updated in Secrets Manager
- [ ] Frontend deployed to CloudFront
- [ ] Health endpoint returns 200
- [ ] GraphQL endpoint accessible
- [ ] Upload presigned URL works
- [ ] CloudWatch logs visible

## 🎉 You're Live!

Your HOOTNER platform is now running on AWS serverless infrastructure!

- **API**: Your API Gateway endpoint
- **CDN**: Your CloudFront distribution
- **Database**: DynamoDB table
- **Storage**: S3 buckets
- **Queue**: SQS for video processing

Need help? Check [AWS_INTEGRATION_COMPLETE.md](AWS_INTEGRATION_COMPLETE.md) for detailed docs.
