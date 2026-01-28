# AWS Deployment Complete! 🚀

Your HOOTNER platform has been upgraded with full AWS integration:

## ✅ What's Been Implemented

### 1. Lambda Layer (`api/layers/api-keys/`)
- Centralized secrets management
- AWS Secrets Manager integration
- Local development fallback
- **Install:** `npm run layer:install`

### 2. S3 Integration (`services/s3-upload-service.js`)
- Presigned URL generation for uploads
- Video storage management
- File validation and security
- Bucket-to-bucket file movement

### 3. SQS Video Processing (`services/sqs-video-processor.js`)
- S3 event processing
- Queue-based video pipeline
- Dead letter queue handling
- Background worker support

### 4. DynamoDB Helpers (`api/graphql/resolvers/dynamodb-helpers.js`)
- Single-table design patterns
- Replaces MongoDB/Mongoose syntax
- GSI queries for user videos
- Atomic operations (views, likes)

### 5. Enhanced Authentication (`api/graphql/utils/auth.js`)
- AWS Secrets Manager for JWT secrets
- Hybrid local/AWS development
- Automatic secret caching

### 6. Upload API (`api/graphql/routes/upload.js`)
- POST `/api/upload/presign` - Get upload URL
- POST `/api/upload/complete` - Trigger processing
- GET `/api/upload/status/:id` - Check status

### 7. Deployment Scripts
- `scripts/setup-aws-env.js` - Fetch CloudFormation outputs
- `scripts/deploy-to-cloudfront.js` - Deploy frontend to CDN
- `api/lambda/s3-event-handler.js` - S3 trigger handler

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
npm run layer:install
```

### Step 2: Deploy Infrastructure
```bash
# Build and deploy CloudFormation stack
sam build
sam deploy --guided

# After deployment, setup environment
npm run aws:setup-env
```

### Step 3: Update Secrets
```bash
# Update API keys in AWS Secrets Manager
aws secretsmanager put-secret-value \
  --secret-id hootner/api-keys \
  --secret-string '{"OPENAI_API_KEY":"your-key","STRIPE_SECRET_KEY":"your-key"}'
```

### Step 4: Deploy Frontend
```bash
npm run aws:deploy-cloudfront
```

## 📝 Environment Variables

After running `npm run aws:setup-env`, you'll have `.env.aws` with:

```env
# API Endpoints
API_ENDPOINT=https://xxx.execute-api.us-east-1.amazonaws.com/prod
GRAPHQL_ENDPOINT=https://xxx.execute-api.us-east-1.amazonaws.com/prod/graphql

# CloudFront
CLOUDFRONT_DOMAIN=xxx.cloudfront.net
CLOUDFRONT_URL=https://xxx.cloudfront.net

# Storage
VIDEO_BUCKET=hootner-videos-123456789
UPLOAD_BUCKET=hootner-uploads-123456789

# Database
TABLE_NAME=HootnerActivities

# Queues
VIDEO_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/hootner-video-processing
```

## 🔧 Local Development

Works seamlessly in both modes:

```bash
# Local mode (uses DynamoDB Local, no AWS)
npm run start:all

# AWS mode (uses real AWS services)
export $(cat .env.aws | xargs)
npm run start:all
```

## 📊 What Changed in Your Template

The template is now fully aligned with your code:

### Already Defined ✅
- S3 Buckets (logging, videos, uploads, static)
- CloudFront Distribution
- Cognito (not used - kept custom JWT)
- SQS Queues (now integrated)
- DynamoDB Table (patterns fixed)
- Secrets Manager (now used)
- Lambda + API Gateway

### Newly Integrated 🆕
- Lambda layer for shared code
- S3 upload handlers
- SQS message processors
- DynamoDB single-table design
- Secrets Manager client
- CloudFront deployment

## 🎯 API Usage Examples

### Upload a Video
```javascript
// 1. Get presigned URL
const response = await fetch('/api/upload/presign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filename: 'my-video.mp4',
    contentType: 'video/mp4',
    fileSize: 1024000
  })
});

const { uploadURL, fileKey } = await response.json();

// 2. Upload to S3
await fetch(uploadURL, {
  method: 'PUT',
  body: videoFile,
  headers: { 'Content-Type': 'video/mp4' }
});

// 3. Complete upload
await fetch('/api/upload/complete', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileKey,
    title: 'My Video',
    description: 'Description',
    visibility: 'public'
  })
});
```

### Query Videos (DynamoDB)
```javascript
const { getVideo, getVideosByUser } = require('./api/graphql/resolvers/dynamodb-helpers');

// Get single video
const video = await getVideo('vid_123');

// Get user's videos
const { items, hasMore } = await getVideosByUser('user_456', {
  limit: 20
});
```

## 🔐 Security Notes

1. **Secrets:** Never commit real API keys. Use Secrets Manager in prod.
2. **CORS:** Configure CloudFront allowed origins for production
3. **API Keys:** Rotate API Gateway keys regularly
4. **IAM:** Lambda functions use least-privilege IAM roles

## 📈 Monitoring

CloudWatch alarms configured for:
- API 5xx errors
- Lambda errors
- Dead letter queue messages

View in AWS Console → CloudWatch → Alarms

## 🆘 Troubleshooting

### "Module not found: /opt/nodejs"
- Run `npm run layer:install` before deploying
- Ensure layer is included in template

### "Access Denied" to S3/DynamoDB
- Check Lambda execution role has correct policies
- Verify resource names match environment variables

### CloudFront not updating
- Run `npm run aws:deploy-cloudfront` to invalidate cache
- Wait 5-10 minutes for propagation

## 🎉 You're Ready!

Your codebase now perfectly aligns with `template-enhanced.yaml`. Deploy with confidence!

```bash
# Quick deploy
sam build && sam deploy && npm run aws:setup-env && npm run aws:deploy-cloudfront
```

Need help? Check the docs or review the comparison report above.
