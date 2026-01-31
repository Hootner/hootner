# Layer 0: Core Infrastructure

**Foundation layer containing all database, API, AWS, security, authentication, and system-level configurations.**

## Structure

```
0-core/
├── database/           # Database configurations
│   ├── dynamodb/      # DynamoDB client & config
│   └── redis/         # Redis client & config
├── api/               # API configurations
│   ├── graphql/       # GraphQL API setup
│   └── rest/          # REST API setup
├── aws/               # AWS service configurations
│   ├── s3/            # S3 storage config
│   ├── lambda/        # Lambda functions config
│   ├── cloudfront/    # CloudFront CDN config
│   ├── sqs/           # SQS message queues
│   ├── ses/           # SES email service
│   ├── sns/           # SNS push notifications
│   └── secrets-manager/ # Secrets Manager
├── auth/              # Authentication & Authorization
│   ├── firebase.js    # Firebase Auth
│   ├── jwt.js         # JWT token management
│   ├── session.js     # Session management
│   └── middleware.js  # Auth middleware
├── security/          # Security middleware
│   ├── cors.js        # CORS configuration
│   ├── helmet.js      # Security headers
│   ├── rate-limit.js  # Rate limiting
│   └── validation.js  # Request validation
├── realtime/          # Real-time communication
│   ├── socket.js      # Socket.io WebSocket
│   └── event-bus.js   # Event pub/sub
├── logging/           # Logging & monitoring
│   ├── logger.js      # Winston logger
│   ├── cloudwatch.js  # CloudWatch integration
│   └── health.js      # Health check endpoints
├── payment/           # Payment processing
│   └── stripe.js      # Stripe integration
├── notifications/     # Notification services
│   ├── email.js       # Email (SES)
│   └── push.js        # Push notifications (SNS)
├── errors/            # Error handling
│   ├── custom-errors.js # Error classes
│   └── handler.js     # Global error handler
├── storage/           # File storage & upload
│   └── upload.js      # Multer + S3 upload
└── config/            # Configuration
    ├── env.js         # Environment validation
    └── features.js    # Feature flags
```

## Database

### DynamoDB
- **Location**: `database/dynamodb/config.js`
- **Usage**: Import `docClient` for document operations
- **Environment**: `DYNAMODB_ENDPOINT` for local development

### Redis
- **Location**: `database/redis/config.js`
- **Usage**: Import `redisClient` for caching
- **Reconnection**: Automatic retry with exponential backoff

## API

### GraphQL
- **Port**: 4000 (default)
- **Endpoint**: `/graphql`
- **Playground**: Enabled in development

### REST
- **Port**: 8080 (default)
- **Base Path**: `/api/v1`
- **Rate Limiting**: 100 requests per 15 minutes

## AWS Services

### S3
- **Buckets**: videos, assets, uploads
- **Client**: Configured with region and credentials

### Lambda
- **Functions**: video-processor, thumbnail-generator, notification-handler
- **Invocation**: Async/sync based on function

### CloudFront
- **Distribution**: Video content delivery
- **Caching**: Global edge locations
- **Domain**: Configured via environment variable

## Environment Variables

```env
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# DynamoDB
DYNAMODB_ENDPOINT=http://localhost:8000  # For local dev
TABLE_NAME=HootnerActivities

# Redis
REDIS_URL=redis://localhost:6379

# API
GRAPHQL_PORT=4000
API_PORT=8080
CORS_ORIGIN=http://localhost:3000

# Node.js Version
NODE_VERSION=22  # Updated from 20

# S3 Buckets
S3_VIDEO_BUCKET=hootner-videos
S3_ASSETS_BUCKET=hootner-assets
S3_UPLOAD_BUCKET=hootner-uploads

# Lambda Functions
LAMBDA_VIDEO_PROCESSOR=hootner-video-processor
LAMBDA_THUMBNAIL_GEN=hootner-thumbnail-generator
LAMBDA_NOTIFICATION=hootner-notification-handler

# CloudFront
CLOUDFRONT_VIDEO_DIST=EV15I3TSUE9A1
CLOUDFRONT_DOMAIN=d2xg9k8zu8m8bh.cloudfront.net
```

## Usage Examples

### DynamoDB
```javascript
import { docClient } from './database/dynamodb/config.js';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Get item
const result = await docClient.send(new GetCommand({
  TableName: 'HootnerActivities',
  Key: { PK: 'VIDEO#123', SK: 'METADATA' }
}));

// Put item
await docClient.send(new PutCommand({
  TableName: 'HootnerActivities',
  Item: {
    PK: 'VIDEO#123',
    SK: 'METADATA',
    title: 'My Video',
    createdAt: Date.now()
  }
}));
```

### Redis
```javascript
import redisClient from './database/redis/config.js';

await redisClient.connect();
await redisClient.set('key', 'value', { EX: 3600 });
const value = await redisClient.get('key');
```

### S3
```javascript
import { s3Client, bucketConfig } from './aws/s3/config.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';

await s3Client.send(new PutObjectCommand({
  Bucket: bucketConfig.videoBucket,
  Key: 'video.mp4',
  Body: fileBuffer
}));
```

## Integration

This layer is imported by higher layers (1-foundation, 2-intelligence, etc.) to access infrastructure services. All infrastructure code is centralized here for consistency and maintainability.
