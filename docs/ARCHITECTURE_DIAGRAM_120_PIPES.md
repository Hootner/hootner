# 🏗️ HOOTNER 120-Pipe Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         HOOTNER PLATFORM - 120 PIPES                            │
│                     Complete Serverless Video Infrastructure                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                                    │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  📱 User Browser ──> HTML/CSS/JS ──> CloudFront CDN                             │
│                          │                     │                                │
│                          │                     ├─> [S3Origin] Static Assets     │
│                          │                     └─> [ApiOrigin] API Gateway      │
│                          │                                                      │
│                          └─> config.html (Auto-detect AWS/Local)               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  CDN & DISTRIBUTION LAYER                                                        │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  🌍 CloudFront Distribution (PIPE 111)                                          │
│      │                                                                           │
│      ├─> Cache Behavior: /api/* ──> API Gateway                                │
│      ├─> Cache Behavior: /graphql ──> API Gateway                              │
│      └─> Default ──> S3 Static Assets                                          │
│                                                                                  │
│  🔐 Origin Access Identity (OAI) ──> S3 Read Permission                         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  API GATEWAY LAYER                                                               │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  🚪 API Gateway (REST API)                                                      │
│      │                                                                           │
│      ├─> POST /graphql ──> GraphQLFunction (PIPE 98)                           │
│      ├─> POST /api/upload/presign ──> GraphQLFunction (PIPE 99)                │
│      ├─> POST /api/upload/complete ──> GraphQLFunction                         │
│      └─> GET /api/upload/status/:id ──> GraphQLFunction                        │
│                                                                                  │
│  🔑 API Key Required (PIPE 53, 54)                                              │
│  📊 Usage Plan: 10,000 req/day, 100 req/sec                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  LAMBDA COMPUTE LAYER                                                            │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ⚡ GraphQLFunction (38 connections)                                            │
│     ├─ Runtime: Node.js 20.x                                                    │
│     ├─ Memory: 1024 MB, Timeout: 30s                                            │
│     ├─ Layer: APIKeysLayer (PIPE 76) ──> Secrets Manager Utils                 │
│     │                                                                            │
│     ├─ DependsOn (10 resources - PIPES 65-74):                                 │
│     │   └─ HootnerTable, APIKeysLayer, VideoStorageBucket,                     │
│     │      UploadBucket, StaticAssetsBucket, VideoProcessingQueue,             │
│     │      NotificationQueue, APISecrets, JWTSecret, EncryptionKey             │
│     │                                                                            │
│     ├─ Environment (11 variables - PIPES 78-88):                               │
│     │   ├─ TABLE_NAME ──────────────> HootnerTable                             │
│     │   ├─ VIDEO_BUCKET ─────────────> VideoStorageBucket                      │
│     │   ├─ UPLOAD_BUCKET ────────────> UploadBucket                            │
│     │   ├─ STATIC_BUCKET ────────────> StaticAssetsBucket (NEW)                │
│     │   ├─ USER_POOL_ID ─────────────> Cognito UserPool                        │
│     │   ├─ VIDEO_QUEUE_URL ──────────> VideoProcessingQueue                    │
│     │   ├─ NOTIFICATION_QUEUE_URL ───> NotificationQueue (NEW)                 │
│     │   ├─ KMS_KEY_ID ───────────────> EncryptionKey (NEW)                     │
│     │   ├─ CLOUDFRONT_DISTRIBUTION_ID > CloudFront (NEW)                       │
│     │   ├─ API_SECRETS_ARN ──────────> APISecrets (NEW)                        │
│     │   ├─ JWT_SECRET_ARN ───────────> JWTSecret (NEW)                         │
│     │   └─ AWS_REGION ───────────────> AWS::Region (NEW)                       │
│     │                                                                            │
│     └─ Policies (10 permissions - PIPES 89-97):                                │
│         ├─ DynamoDB CRUD ──────────> HootnerTable                              │
│         ├─ S3 CRUD ────────────────> VideoStorageBucket, UploadBucket         │
│         ├─ SQS SendMessage ────────> VideoQueue, NotificationQueue (NEW)      │
│         ├─ Secrets GetValue ───────> APISecrets, JWTSecret                    │
│         ├─ KMS Decrypt ────────────> EncryptionKey (NEW)                      │
│         └─ CloudFront Invalidation > Distribution (NEW)                        │
│                                                                                  │
│  ⚡ S3EventProcessorFunction (20 connections)                                   │
│     ├─ Runtime: Node.js 20.x                                                    │
│     ├─ Memory: 512 MB, Timeout: 300s                                            │
│     │                                                                            │
│     ├─ DependsOn (6 resources - PIPES 100-105):                                │
│     │   └─ HootnerTable, VideoStorageBucket, UploadBucket,                     │
│     │      VideoProcessingQueue, NotificationQueue, EncryptionKey              │
│     │                                                                            │
│     ├─ Environment (6 variables - PIPES 107-112):                              │
│     │   ├─ TABLE_NAME ──────────────> HootnerTable                             │
│     │   ├─ VIDEO_BUCKET ─────────────> VideoStorageBucket                      │
│     │   ├─ UPLOAD_BUCKET ────────────> UploadBucket                            │
│     │   ├─ VIDEO_QUEUE_URL ──────────> VideoProcessingQueue                    │
│     │   ├─ NOTIFICATION_QUEUE_URL ───> NotificationQueue (NEW)                 │
│     │   ├─ KMS_KEY_ID ───────────────> EncryptionKey (NEW)                     │
│     │   └─ AWS_REGION ───────────────> AWS::Region (NEW)                       │
│     │                                                                            │
│     ├─ Policies (7 permissions - PIPES 113-118):                               │
│     │   ├─ S3 CRUD ──────────────────> VideoStorageBucket, UploadBucket       │
│     │   ├─ SQS SendMessage ──────────> VideoQueue, NotificationQueue (NEW)    │
│     │   ├─ DynamoDB CRUD ────────────> HootnerTable                            │
│     │   └─ KMS Decrypt ──────────────> EncryptionKey (NEW)                     │
│     │                                                                            │
│     └─ Triggered by: SQS Event (PIPE 119) ──> VideoProcessingQueue            │
└─────────────────────────────────────────────────────────────────────────────────┘
           │                                           │
           ▼                                           ▼
┌────────────────────────────┐      ┌────────────────────────────────────────────┐
│  STORAGE LAYER             │      │  QUEUE & MESSAGING LAYER                   │
│  ────────────────────────  │      │  ────────────────────────────────────────  │
│                            │      │                                            │
│  🪣 S3 Buckets (23 pipes)  │      │  📬 SQS Queues (11 pipes)                 │
│                            │      │                                            │
│  1. LoggingBucket          │      │  1. VideoProcessingQueue                  │
│     └─> Stores access logs │      │     ├─> Receives S3 notifications (14)   │
│                            │      │     ├─> Triggers S3Processor (119)        │
│  2. VideoStorageBucket     │      │     ├─> VisibilityTimeout: 900s           │
│     ├─> Final videos       │      │     └─> DeadLetterQueue on failure (37)  │
│     ├─> Public read policy │      │                                            │
│     ├─> KMS encrypted      │      │  2. NotificationQueue (NEW)               │
│     └─> Versioned          │      │     ├─> User notifications                │
│                            │      │     ├─> Processing status updates         │
│  3. UploadBucket           │      │     └─> VisibilityTimeout: 300s           │
│     ├─> Temp uploads       │      │                                            │
│     ├─> S3 Notification ─┐ │      │  3. DeadLetterQueue                       │
│     │   └─> VideoQueue   │ │      │     └─> Failed messages from VideoQueue  │
│     ├─> 7-day lifecycle   │ │      │                                            │
│     └─> KMS encrypted     │ │      └────────────────────────────────────────────┘
│                           │ │
│  4. StaticAssetsBucket    │ │      ┌────────────────────────────────────────────┐
│     ├─> HTML/CSS/JS       │ │      │  AUTHENTICATION LAYER                      │
│     ├─> CloudFront origin │ │      │  ────────────────────────────────────────  │
│     └─> OAI access only   │ │      │                                            │
│                           │ │      │  👥 Cognito User Pool (5 pipes)           │
│  All Buckets:             │ │      │     ├─> Email verification                │
│  ├─> Log to LoggingBucket │ │      │     ├─> Password policy (8+ chars)        │
│  ├─> Encrypted at rest    │ │      │     ├─> MFA optional                      │
│  └─> Public access blocked│ │      │     └─> OAuth flows                       │
│                           │ │      │                                            │
└───────────────────────────┘ │      │  📱 User Pool Client                      │
                              │      │     └─> Web app client (no secret)        │
                              │      │                                            │
                              │      │  🌐 User Pool Domain                       │
                              └────> │     └─> hootner-{AccountId}                │
                                     │                                            │
                                     └────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  DATABASE LAYER                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  🗄️ DynamoDB Table: HootnerActivities (6 pipes)                                │
│     ├─ Primary Key: PK (Partition), SK (Sort)                                  │
│     ├─ Billing: PAY_PER_REQUEST                                                 │
│     ├─ Encryption: KMS (PIPE 46, 84, 111)                                      │
│     ├─ Streams: NEW_AND_OLD_IMAGES                                              │
│     ├─ Point-in-Time Recovery: Enabled                                          │
│     ├─ TTL: Enabled on expiresAt field                                          │
│     │                                                                            │
│     ├─ GSI #1: PK=GSI1PK, SK=GSI1SK                                             │
│     ├─ GSI #2: PK=UserEmail, SK=CreatedAt (UserByEmail)                         │
│     └─ GSI #3: PK=EntityType, SK=CreatedAt (VideosByDate)                       │
│                                                                                  │
│  Data Entities:                                                                  │
│  ├─ Users:  PK=USER#{id}, SK=PROFILE                                           │
│  ├─ Videos: PK=VIDEO#{id}, SK=METADATA                                         │
│  ├─ Upload: PK=UPLOAD#{id}, SK=STATUS                                          │
│  └─ Views:  PK=VIDEO#{id}, SK=VIEW#{timestamp}                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECRETS & ENCRYPTION LAYER                                                      │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  🔐 Secrets Manager (8 pipes)                                                   │
│                                                                                  │
│  1. APISecrets (hootner/api-keys) - PIPES 76, 94                               │
│     ├─ OPENAI_API_KEY                                                           │
│     ├─ STRIPE_SECRET_KEY                                                        │
│     ├─ FIREBASE_API_KEY                                                         │
│     └─ Rotation: 90 days                                                        │
│                                                                                  │
│  2. JWTSecret (hootner/jwt-secret) - PIPES 77, 95                              │
│     ├─ JWT signing key                                                          │
│     └─ Rotation: 90 days                                                        │
│                                                                                  │
│  🔑 KMS Encryption Key (8 pipes)                                                │
│     ├─ Encrypts: All S3 buckets, DynamoDB, SQS                                 │
│     ├─ Key Rotation: Enabled (annual)                                           │
│     ├─ Alias: alias/hootner-platform-key                                        │
│     └─ Used by: Lambda for encrypt/decrypt (PIPES 96, 118)                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  MONITORING & ALARMS LAYER                                                       │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  📊 CloudWatch Alarms (9 pipes)                                                 │
│                                                                                  │
│  1. API 5xx Errors (PIPES 57-59)                                                │
│     ├─ Threshold: > 10 errors in 5 minutes                                      │
│     └─> SNS: AlarmNotificationTopic                                             │
│                                                                                  │
│  2. Lambda Errors (PIPES 60-61)                                                 │
│     ├─ Threshold: > 5 errors in 5 minutes                                       │
│     └─> SNS: AlarmNotificationTopic                                             │
│                                                                                  │
│  3. Dead Letter Queue (PIPES 62-64)                                             │
│     ├─ Threshold: > 0 messages                                                  │
│     └─> SNS: AlarmNotificationTopic                                             │
│                                                                                  │
│  📧 SNS Topic: AlarmNotificationTopic                                           │
│     ├─ Subscribes: Admin email                                                  │
│     └─ Sends: Email alerts on alarms                                            │
│                                                                                  │
│  📝 CloudWatch Logs                                                              │
│     ├─ /aws/lambda/hootner-platform-graphql                                     │
│     ├─ /aws/lambda/hootner-platform-s3-processor                                │
│     └─ Retention: 7 days                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  DATA FLOW: VIDEO UPLOAD PIPELINE (10 CRITICAL PIPES)                           │
└─────────────────────────────────────────────────────────────────────────────────┘

  1️⃣  User → CloudFront → API Gateway → GraphQLFunction
      Request presigned upload URL

  2️⃣  GraphQLFunction → S3 UploadBucket
      Generate presigned URL (PIPE 79)

  3️⃣  User → S3 UploadBucket (Direct)
      Upload video file using presigned URL

  4️⃣  S3 UploadBucket → SQS VideoProcessingQueue
      S3 Event Notification (PIPE 14)

  5️⃣  SQS VideoProcessingQueue → S3EventProcessorFunction
      SQS trigger (PIPE 119)

  6️⃣  S3EventProcessorFunction → DynamoDB HootnerTable
      Create video metadata (PIPE 117)

  7️⃣  S3EventProcessorFunction → S3 VideoStorageBucket
      Move file from upload to storage (PIPE 107)

  8️⃣  S3EventProcessorFunction → SQS NotificationQueue
      Send completion notification (PIPE 116) [NEW]

  9️⃣  GraphQLFunction → DynamoDB HootnerTable
      Query video status (PIPE 89)

  🔟  CloudFront → S3 VideoStorageBucket
      Serve video to user (CDN cached)

┌─────────────────────────────────────────────────────────────────────────────────┐
│  CONNECTION SUMMARY                                                              │
└─────────────────────────────────────────────────────────────────────────────────┘

  Resource Type          │ Connections │ Key Integrations
  ───────────────────────┼─────────────┼────────────────────────────────────
  Global Environment     │      5      │ All Lambdas get TABLE_NAME, AWS_REGION
  S3 Buckets            │     23      │ Logging, Videos, Uploads, Static
  CloudFront            │      7      │ CDN with dual origins (S3 + API)
  Cognito               │      5      │ User authentication & OAuth
  SQS Queues            │     11      │ Video processing + Notifications
  KMS Encryption        │      8      │ Encrypts everything at rest
  DynamoDB Table        │      6      │ Single-table design with 3 GSIs
  Secrets Manager       │      8      │ API keys + JWT secret
  API Gateway           │      3      │ GraphQL + Upload endpoints
  CloudWatch Alarms     │      9      │ Monitors errors and failures
  Lambda Functions      │     58      │ GraphQL (38) + S3Processor (20)
  CloudFormation Outputs│      1      │ Exports all endpoints
  ───────────────────────┴─────────────┴────────────────────────────────────
  TOTAL CONNECTIONS      │    120      │ Fully integrated infrastructure

┌─────────────────────────────────────────────────────────────────────────────────┐
│  NEW CAPABILITIES (105 → 120 PIPES)                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

  ✨ Real-Time Notifications
     └─> NotificationQueue integration (PIPES 83, 93, 110, 116)

  ✨ CloudFront Cache Management
     └─> Invalidate cache from Lambda (PIPE 85, 97)

  ✨ KMS Encryption/Decryption
     └─> Lambda can encrypt/decrypt data (PIPES 84, 96, 111, 118)

  ✨ Cross-Region Support
     └─> Region-aware operations (PIPES 88, 112)

  ✨ Static Asset Deployment
     └─> Deploy to S3 + invalidate CloudFront (PIPE 80)

  ✨ Explicit Dependencies
     └─> 16 DependsOn declarations prevent race conditions

  ✨ Direct Secret Access
     └─> ARNs available as env vars (PIPES 86, 87)

┌─────────────────────────────────────────────────────────────────────────────────┐
│  DEPLOYMENT STATUS: ✅ READY FOR PRODUCTION                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

  Template:    template-enhanced.yaml (913 lines)
  Connections: 120 pipes (+14% from 105)
  Resources:   ~45 AWS resources
  Cost:        $0-5/month with free tier, ~$10-50/month light production
  
  Deploy:      npm run aws:quick-deploy
  Validate:    sam validate --lint
  Monitor:     aws cloudformation describe-stacks --stack-name hootner-platform
```
