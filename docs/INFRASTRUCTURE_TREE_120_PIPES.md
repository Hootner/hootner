# 🌳 HOOTNER Infrastructure Tree - 120 Pipes Mapped

## Complete Project Structure with AWS Integration

```
my-local-repo/
│
├── 📄 template-enhanced.yaml ⚡ [120 PIPES] ⚡
│   └── CloudFormation infrastructure connecting everything below
│
├── 📱 apps/                          # Frontend Layer
│   └── frontend/
│       └── html-pages/
│           ├── dashboard.html        → CloudFront (PIPE 93-95)
│           ├── video-player.html     → CloudFront → S3 VideoStorage
│           └── config.html           → Auto-detects AWS endpoints
│               ├── GRAPHQL_ENDPOINT  ← API Gateway (PIPE 91)
│               └── UPLOAD_API        ← API Gateway (PIPE 99)
│
├── 🧠 hexarchy/                      # Hexagonal Architecture
│   │
│   ├── 1-foundation/                 # Core Utilities
│   │   └── utils/                    → Used by all Lambdas
│   │
│   ├── 2-intelligence/               # AI Services
│   │   └── ai-services/
│   │       └── video-generation/     → Triggered by SQS (PIPE 119)
│   │
│   ├── 3-communication/              # APIs & Adapters
│   │   └── api/
│   │       └── graphql/              → GraphQLFunction (PIPE 65-99)
│   │           ├── schema/           → DynamoDB operations
│   │           ├── resolvers/
│   │           │   ├── videoResolvers-dynamodb.js
│   │           │   │   └── HootnerTable (PIPE 89)
│   │           │   └── dynamodb-helpers.js
│   │           │       ├── TABLE_NAME (PIPE 4, Global)
│   │           │       ├── createVideo()    → DynamoDB
│   │           │       ├── getVideo()       → DynamoDB
│   │           │       ├── updateVideo()    → DynamoDB
│   │           │       └── deleteVideo()    → DynamoDB
│   │           ├── routes/
│   │           │   └── upload.js     → S3 UploadBucket (PIPE 79)
│   │           └── utils/
│   │               └── auth.js
│   │                   ├── API_SECRETS_ARN (PIPE 86)
│   │                   └── JWT_SECRET_ARN (PIPE 87)
│   │
│   ├── 4-interface/                  # UI Components
│   │   └── components/               → Served via CloudFront
│   │
│   ├── 5-economy/                    # Business Logic
│   │   └── payment/
│   │       └── stripe-integration.js
│   │           └── STRIPE_SECRET_KEY ← Secrets Manager (PIPE 94)
│   │       └── services/usage-pricing-service.js
│   │           ├── Base pay → gets cheaper with scale ⚡
│   │           ├── Tracks: users, videos, storage
│   │           ├── Calculates: volume discounts
│   │           └── Stripe subscriptions with usage billing
│   │               ├── Starter: $29.99 + $0.50/user
│   │               ├── Growth: $99.99 + $0.40/user (20% cheaper)
│   │               ├── Scale: $299.99 + $0.30/user (40% cheaper)
│   │               └── Enterprise: $999.99 + $0.20/user (60% cheaper)
│   │           └── Volume discounts:
│   │               ├── 1K users → 5% off
│   │               ├── 5K users → 10% off
│   │               ├── 10K users → 15% off
│   │               ├── 50K users → 20% off
│   │               └── 100K+ users → 25% off
│   │
│   ├── 6-information/                # Data Models
│   │   └── models/
│   │       └── video.model.js        → DynamoDB schema
│   │
│   ├── 7-data/                       # Storage Layer
│   │   ├── databases/
│   │   │   └── dynamodb-client.js    → HootnerTable (PIPE 4)
│   │   └── cache/
│   │       └── redis-client.js       → Future: ElastiCache
│   │
│   └── 8-operations/                 # Infrastructure & DevOps
│       └── infrastructure/
│           ├── template-enhanced.yaml ⚡ Main Infrastructure
│           └── deployment-scripts/   → Uses CloudFormation outputs
│
├── 🔧 services/                      # Microservices Layer
│   │
│   ├── s3-upload-service.js          # S3 Integration
│   │   ├── VIDEO_BUCKET (PIPE 78, 107)
│   │   ├── UPLOAD_BUCKET (PIPE 79, 108)
│   │   ├── generateUploadURL()       → S3 Presigned URLs
│   │   ├── moveToVideoStorage()      → S3 Copy operations
│   │   └── KMS_KEY_ID (PIPE 84, 111) → Encryption
│   │
│   ├── sqs-video-processor.js        # Queue Processing
│   │   ├── VIDEO_QUEUE_URL (PIPE 82, 109)
│   │   ├── NOTIFICATION_QUEUE_URL (PIPE 83, 110)
│   │   ├── sendProcessingJob()       → SQS SendMessage
│   │   └── processS3Event()          → Triggered by S3 (PIPE 14)
│   │
│   └── video-generation/             # AI Video Service
│       └── main.py                   → Processes videos from queue
│
├── 🎯 api/                           # API Layer
│   │
│   ├── graphql/                      # GraphQL Server
│   │   ├── server.js                 → Express + Apollo Server
│   │   │   └── Wrapped by serverless-http for Lambda
│   │   ├── lambda.handler            → GraphQLFunction Entry Point
│   │   └── resolvers/
│   │       └── All connected to DynamoDB (PIPE 89)
│   │
│   ├── lambda/                       # Lambda Functions
│   │   └── s3-event-handler.js       # S3EventProcessorFunction
│   │       ├── Entry: SQS Trigger (PIPE 119)
│   │       ├── Reads: VIDEO_BUCKET (PIPE 107)
│   │       ├── Writes: UPLOAD_BUCKET (PIPE 108)
│   │       ├── Updates: HootnerTable (PIPE 117)
│   │       ├── Notifies: NOTIFICATION_QUEUE_URL (PIPE 116)
│   │       └── Encrypts: KMS_KEY_ID (PIPE 118)
│   │
│   └── layers/                       # Lambda Layers
│       └── api-keys/
│           └── nodejs/
│               └── index.js          # APIKeysLayer (PIPE 76)
│                   ├── getSecret()        → Secrets Manager
│                   ├── getAPIKeys()       → API_SECRETS_ARN
│                   └── getJWTSecret()     → JWT_SECRET_ARN
│
├── 📜 scripts/                       # Automation Scripts
│   │
│   ├── setup-aws-env.js              # Environment Setup
│   │   └── Fetches CloudFormation outputs (PIPE 120)
│   │       ├── API_ENDPOINT
│   │       ├── GRAPHQL_ENDPOINT
│   │       ├── CLOUDFRONT_DOMAIN
│   │       ├── USER_POOL_ID
│   │       └── TABLE_NAME
│   │
│   ├── deploy-to-cloudfront.js       # Frontend Deployment
│   │   ├── STATIC_BUCKET (PIPE 80)
│   │   ├── uploadDirectory()         → S3 PutObject
│   │   └── invalidateCache()
│   │       └── CLOUDFRONT_DISTRIBUTION_ID (PIPE 85)
│   │
│   └── quick-deploy.js               # One-Command Deploy
│       └── Orchestrates: sam build → sam deploy → setup-aws-env
│
├── 📚 docs/                          # Documentation
│   ├── AI_AGENT_ORCHESTRATION.md
│   ├── AWS_FOR_BEGINNERS.md
│   ├── BACKEND_QUICKSTART.md
│   └── DEPLOYMENT_GUIDE.md
│
├── 🔐 config/                        # Configuration
│   └── aws-config.js                 → Environment detection
│
└── 🌩️ AWS INFRASTRUCTURE             # CloudFormation Resources
    │
    ├── 🪣 S3 Buckets (23 pipes)
    │   ├── LoggingBucket
    │   │   └── Receives logs from all other buckets (PIPE 8, 13, 19)
    │   ├── VideoStorageBucket
    │   │   ├── Stores final videos (PIPE 78, 107)
    │   │   ├── CloudFront origin (PIPE 26)
    │   │   └── Public read policy with encryption
    │   ├── UploadBucket
    │   │   ├── Temp uploads (PIPE 79, 108)
    │   │   ├── S3 Event → SQS (PIPE 14)
    │   │   └── 7-day lifecycle deletion
    │   └── StaticAssetsBucket
    │       ├── Frontend files (PIPE 80)
    │       ├── CloudFront origin (PIPE 26, 50)
    │       └── OAI access only (PIPE 27, 52)
    │
    ├── 🌍 CloudFront Distribution (7 pipes)
    │   ├── Domain: PIPE 93, 94, 95
    │   ├── Origin 1: S3 StaticAssets
    │   ├── Origin 2: API Gateway (PIPE 28, 54)
    │   ├── Cache Behavior: /api/* → API
    │   ├── Cache Behavior: /graphql → API
    │   └── Default → S3 Static
    │
    ├── 🚪 API Gateway (3 pipes)
    │   ├── REST API: HootnerApi (PIPE 52, 58, 78, 79)
    │   ├── /graphql → GraphQLFunction
    │   ├── /api/upload/* → GraphQLFunction
    │   ├── API Key Required (PIPE 53)
    │   └── Usage Plan (PIPE 54)
    │       ├── Quota: 10,000 req/day
    │       └── Throttle: 100 req/sec
    │
    ├── ⚡ Lambda Functions (58 pipes)
    │   │
    │   ├── GraphQLFunction (38 connections)
    │   │   ├── DependsOn (10): PIPES 65-74
    │   │   ├── Environment (11): PIPES 78-88
    │   │   │   ├── TABLE_NAME → HootnerTable
    │   │   │   ├── VIDEO_BUCKET → VideoStorageBucket
    │   │   │   ├── UPLOAD_BUCKET → UploadBucket
    │   │   │   ├── STATIC_BUCKET → StaticAssetsBucket ✨
    │   │   │   ├── USER_POOL_ID → Cognito
    │   │   │   ├── VIDEO_QUEUE_URL → VideoProcessingQueue
    │   │   │   ├── NOTIFICATION_QUEUE_URL → NotificationQueue ✨
    │   │   │   ├── KMS_KEY_ID → EncryptionKey ✨
    │   │   │   ├── CLOUDFRONT_DISTRIBUTION_ID → CloudFront ✨
    │   │   │   ├── API_SECRETS_ARN → APISecrets ✨
    │   │   │   ├── JWT_SECRET_ARN → JWTSecret ✨
    │   │   │   └── AWS_REGION → Current Region ✨
    │   │   ├── Policies (10): PIPES 89-97
    │   │   │   ├── DynamoDB CRUD
    │   │   │   ├── S3 Read/Write (Video + Upload)
    │   │   │   ├── SQS SendMessage (Video + Notification) ✨
    │   │   │   ├── Secrets GetValue
    │   │   │   ├── KMS Decrypt ✨
    │   │   │   └── CloudFront Invalidation ✨
    │   │   └── Events: API Gateway triggers (PIPES 98, 99)
    │   │
    │   └── S3EventProcessorFunction (20 connections)
    │       ├── DependsOn (6): PIPES 100-105
    │       ├── Environment (6): PIPES 107-112
    │       │   ├── TABLE_NAME → HootnerTable
    │       │   ├── VIDEO_BUCKET → VideoStorageBucket
    │       │   ├── UPLOAD_BUCKET → UploadBucket
    │       │   ├── VIDEO_QUEUE_URL → VideoProcessingQueue
    │       │   ├── NOTIFICATION_QUEUE_URL → NotificationQueue ✨
    │       │   ├── KMS_KEY_ID → EncryptionKey ✨
    │       │   └── AWS_REGION → Current Region ✨
    │       ├── Policies (7): PIPES 113-118
    │       │   ├── S3 Read/Write
    │       │   ├── SQS SendMessage (Video + Notification) ✨
    │       │   ├── DynamoDB CRUD
    │       │   └── KMS Decrypt ✨
    │       └── Event: SQS Trigger (PIPE 119)
    │
    ├── 📬 SQS Queues (11 pipes)
    │   ├── VideoProcessingQueue
    │   │   ├── Receives S3 notifications (PIPE 14)
    │   │   ├── Triggers S3EventProcessor (PIPE 119)
    │   │   ├── Dead letter: DLQQueue (PIPE 37)
    │   │   └── Both Lambdas send here (PIPES 82, 92, 109, 115)
    │   ├── NotificationQueue ✨ NEW
    │   │   ├── User notifications
    │   │   ├── Processing status updates
    │   │   └── Both Lambdas send here (PIPES 83, 93, 110, 116)
    │   └── DeadLetterQueue
    │       └── Failed messages (PIPE 37, 67, 77)
    │
    ├── 🗄️ DynamoDB (6 pipes)
    │   └── HootnerTable
    │       ├── Primary Key: PK, SK
    │       ├── GSI 1: GSI1PK, GSI1SK
    │       ├── GSI 2: UserByEmail, CreatedAt
    │       ├── GSI 3: VideosByDate, CreatedAt
    │       ├── Encryption: KMS (PIPE 46)
    │       ├── Global ENV: TABLE_NAME (PIPE 4)
    │       └── Used by: Both Lambdas (PIPES 89, 117)
    │
    ├── 👥 Cognito (5 pipes)
    │   ├── UserPool (PIPE 32, 35, 70, 81, 96)
    │   ├── UserPoolClient (PIPE 98)
    │   └── UserPoolDomain (PIPE 34)
    │
    ├── 🔐 Secrets Manager (8 pipes)
    │   ├── APISecrets (hootner/api-keys)
    │   │   ├── OPENAI_API_KEY
    │   │   ├── STRIPE_SECRET_KEY
    │   │   ├── FIREBASE_API_KEY
    │   │   └── Accessed via: PIPES 76, 86, 94
    │   └── JWTSecret (hootner/jwt-secret)
    │       └── Accessed via: PIPES 77, 87, 95
    │
    ├── 🔑 KMS (8 pipes)
    │   └── EncryptionKey
    │       ├── Encrypts: All S3, DynamoDB, SQS
    │       ├── Lambda access: PIPES 84, 96, 111, 118 ✨
    │       └── Auto-rotation: Enabled
    │
    └── 📊 CloudWatch (9 pipes)
        ├── Alarms (3)
        │   ├── API 5xx Errors (PIPES 57-59)
        │   ├── Lambda Errors (PIPES 60-61)
        │   └── DLQ Messages (PIPES 62-64)
        ├── Logs
        │   ├── /aws/lambda/graphql
        │   └── /aws/lambda/s3-processor
        └── SNS Topic
            └── AlarmNotificationTopic (PIPE 56)

═══════════════════════════════════════════════════════════════════════════
                    🎯 DATA FLOW: VIDEO UPLOAD PIPELINE
═══════════════════════════════════════════════════════════════════════════

1️⃣  User uploads video via dashboard.html
    └─> CloudFront (PIPE 93) → API Gateway (PIPE 78)

2️⃣  API Gateway → GraphQLFunction
    └─> /api/upload/presign endpoint (PIPE 99)

3️⃣  GraphQLFunction generates presigned URL
    └─> UPLOAD_BUCKET env var (PIPE 79)

4️⃣  User uploads directly to S3 UploadBucket
    └─> S3 Event Notification triggered (PIPE 14)

5️⃣  S3 → SQS VideoProcessingQueue
    └─> SQS message created (PIPE 14)

6️⃣  SQS triggers S3EventProcessorFunction
    └─> Lambda invoked (PIPE 119)

7️⃣  S3EventProcessorFunction processes video
    ├─> Reads from UPLOAD_BUCKET (PIPE 108)
    ├─> Moves to VIDEO_BUCKET (PIPE 107)
    ├─> Updates DynamoDB (PIPE 117)
    ├─> Encrypts with KMS (PIPE 118) ✨
    └─> Sends notification (PIPE 116) ✨

8️⃣  NotificationQueue → Future notification service
    └─> User gets status update ✨

9️⃣  User views video via dashboard
    └─> CloudFront (PIPE 93) → S3 VideoStorageBucket

═══════════════════════════════════════════════════════════════════════════

Legend:
  ✨ = New in v2.0 (105 → 120 pipes)
  → = Connection/pipe
  PIPE X = Reference number in TEMPLATE_CONNECTIONS_MAP.md
```

## 🔍 Quick Reference

### Find Your Code in the Tree

**Working on GraphQL?**
```
api/graphql/ → GraphQLFunction → PIPES 65-99
```

**Working on uploads?**
```
services/s3-upload-service.js → UploadBucket → PIPE 79
```

**Working on video processing?**
```
api/lambda/s3-event-handler.js → S3EventProcessor → PIPES 100-119
```

**Working on frontend?**
```
apps/frontend/html-pages/ → CloudFront → PIPE 93
```

### Trace a Feature Through the Tree

**"Where does video upload connect?"**
```
User → CloudFront → API Gateway → GraphQLFunction
     → S3 UploadBucket → SQS → S3EventProcessor
     → DynamoDB + VideoStorageBucket
```

**"How does authentication work?"**
```
User → Cognito UserPool → GraphQLFunction
     → Lambda Layer → Secrets Manager
     → JWT Token → Response
```

**"Where are my API keys?"**
```
Secrets Manager → Lambda Layer (PIPE 76)
                → GraphQLFunction (PIPES 86, 87)
                → Your code
```

## 📊 Tree Statistics

- **Total Files Mapped:** 50+
- **Total Pipes:** 120 ⚡
- **Layers:** 8 (hexarchy) + AWS infrastructure
- **Lambda Functions:** 4 (GraphQL, S3EventProcessor, StripeWebhook, PricingCalculator)
- **S3 Buckets:** 4
- **Queues:** 3
- **APIs:** 1 (GraphQL + Upload + Stripe webhooks)
- **Stripe Integration:** ✅ Connected (PIPES 94, 106-120)
  - **Usage-based pricing:** Base pay → cheaper with scale
  - **Volume discounts:** Up to 25% off at 100K+ users
  - **Real-time tracking:** Users, videos, storage
  - **Monthly billing:** Automated via EventBridge

## 🎯 Stripe Integration Flow (PIPES 106-120)

### How Your Stripe Account Connects

```
1. User Creates Subscription
   ↓
   services/usage-pricing-service.js
   ↓
   STRIPE_SECRET_KEY (Secrets Manager - PIPE 94)
   ↓
   Stripe API: Creates customer + subscription
   ↓
   DynamoDB: Saves subscription details

2. Stripe Sends Webhook (payment successful, subscription updated, etc.)
   ↓
   API Gateway /webhooks/stripe (PIPE 107)
   ↓
   StripeWebhookFunction (PIPE 106)
   ↓
   Verifies signature with STRIPE_WEBHOOK_SECRET (PIPE 110)
   ↓
   DynamoDB: Updates subscription status

3. Usage Tracking (automatic)
   ↓
   Video uploaded → UsageTrackingFunction (PIPE 111)
   ↓
   User active → EventBridge → UsageTrackingFunction
   ↓
   DynamoDB: Increments activeUsers, totalVideos, storageGB

4. Monthly Billing (automatic)
   ↓
   EventBridge: Runs 1st of month (PIPE 113)
   ↓
   PricingCalculatorFunction (PIPE 112)
   ↓
   Reads: DynamoDB usage data
   ↓
   Calculates: Base + overages - volume discount
   ↓
   Stripe API: Creates invoice
   ↓
   Gets cheaper as you scale! 🎉
```

### Pricing Example

**Starter Plan - 150 users:**
```
Base:           $29.99
Overage:        50 users × $0.50 = $25.00
Subtotal:       $54.99
Volume discount: $0 (under 1K threshold)
───────────────────────
Total:          $54.99/month
```

**Growth Plan - 1,500 users:**
```
Base:           $99.99
Overage:        1,000 users × $0.40 = $400.00
Subtotal:       $499.99
Volume discount: 5% = $25.00 (passed 1K threshold!)
───────────────────────
Total:          $474.99/month ← Gets cheaper per user!
```

**Enterprise Plan - 50,000 users:**
```
Base:           $999.99
Overage:        40,000 users × $0.20 = $8,000.00
Subtotal:       $8,999.99
Volume discount: 20% = $1,800.00 (passed 50K threshold!)
───────────────────────
Total:          $7,199.99/month ← 80% cheaper per user than Starter!
```

### Where to Set Your Stripe Keys

**1. Get your keys from Stripe Dashboard:**
- Live mode: `https://dashboard.stripe.com/apikeys`
- Test mode: `https://dashboard.stripe.com/test/apikeys`

**2. Update Secrets Manager (AWS Console):**
```bash
# Navigate to: AWS Console → Secrets Manager
# Find: hootner-stripe-secret-key
# Update with: sk_live_YOUR_KEY_HERE (or sk_test_... for testing)

# Find: hootner-stripe-webhook-secret
# Update with: whsec_YOUR_WEBHOOK_SECRET_HERE
```

**3. Configure Stripe webhook endpoint:**
```bash
# In Stripe Dashboard → Developers → Webhooks
# Add endpoint: https://YOUR_API_GATEWAY_URL/webhooks/stripe
# Events to listen for:
#   - customer.subscription.created
#   - customer.subscription.updated
#   - customer.subscription.deleted
#   - invoice.payment_succeeded
#   - invoice.payment_failed
```

**4. Test the connection:**
```bash
npm run test:stripe-webhook
# Or manually: POST to /webhooks/stripe with Stripe test event
```

## 🚀 Using This Tree

### For Development
1. Find your code file in the tree
2. See which PIPES connect to it
3. Reference [TEMPLATE_CONNECTIONS_MAP.md](TEMPLATE_CONNECTIONS_MAP.md) for details

### For Debugging
1. Trace the data flow path
2. Check each PIPE connection
3. Verify environment variables match

### For New Features
1. Identify where feature fits in tree
2. Find related PIPES
3. Add new connections following the pattern

---

**See also:**
- [TEMPLATE_CONNECTIONS_MAP.md](TEMPLATE_CONNECTIONS_MAP.md) - Detailed pipe inventory
- [ARCHITECTURE_DIAGRAM_120_PIPES.md](ARCHITECTURE_DIAGRAM_120_PIPES.md) - Visual architecture
- [DOCUMENTATION_INDEX_120_PIPES.md](DOCUMENTATION_INDEX_120_PIPES.md) - Full documentation
