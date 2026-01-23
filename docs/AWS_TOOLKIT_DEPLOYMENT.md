# AWS Toolkit Deployment Guide

## Deploy HOOTNER via AWS Toolkit Extension

### Step 1: API Gateway

1. Open AWS Toolkit in IDE
2. Create REST API: `hootner-api`
3. Add resources:
   - `/graphql` → Lambda (GraphQL API)
   - `/videos` → Lambda (Video service)
   - `/health` → Lambda (Health check)

### Step 2: Lambda Functions

Deploy these functions:

- `hootner-graphql-api` (Node.js 18)
  - Handler: `api/graphql/lambda.handler`
  - Memory: 512 MB
  - Timeout: 30s
- `hootner-video-generation` (Python 3.11)
  - Handler: `services/video-generation/lambda_handler.handler`
  - Memory: 2048 MB
  - Timeout: 300s

### Step 3: DynamoDB Tables

Create tables via AWS Toolkit:

- Table: `hootner-videos`
  - Partition key: `id` (String)
  - Sort key: `createdAt` (Number)
  - Billing: On-demand

- Table: `hootner-users`
  - Partition key: `userId` (String)
  - Billing: On-demand

### Step 4: S3 Buckets

Create buckets:

- `hootner-videos-{account-id}` - Video storage
- `hootner-frontend-{account-id}` - Static website hosting

### Step 5: ElastiCache (Redis)

Via AWS Console (not in Toolkit):

- Cluster: `hootner-cache`
- Node type: `cache.t3.micro`
- Engine: Redis 7.x

### Step 6: CloudFront

- Origin: S3 bucket (frontend)
- Behaviors: `/api/*` → API Gateway

### Step 7: Environment Variables

Set in Lambda configuration:

```
DYNAMODB_TABLE=hootner-videos
REDIS_ENDPOINT=<elasticache-endpoint>
S3_BUCKET=hootner-videos-{account-id}
JWT_SECRET=<generate-secret>
```

### Step 8: Deploy Frontend

```bash
cd apps/frontend
npm run build
aws s3 sync dist/ s3://hootner-frontend-{account-id}
```

### Quick Deploy Commands

```bash
# Package Lambda functions
npm run aws:package

# Deploy via SAM (alternative)
sam build
sam deploy --guided
```

## Estimated Costs (Monthly)

- Lambda: $5-20 (free tier eligible)
- DynamoDB: $5-15 (on-demand)
- S3: $1-5
- ElastiCache: $15-30 (t3.micro)
- CloudFront: $1-10
- **Total: ~$30-80/month**

## Monitoring

- CloudWatch Logs: Auto-enabled
- X-Ray: Enable for tracing
- CloudWatch Alarms: Set for errors

## Rollback

- Lambda: Previous version via Toolkit
- API Gateway: Revert stage deployment
