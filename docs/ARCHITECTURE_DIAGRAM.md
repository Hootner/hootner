# 🏗️ HOOTNER Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│                    (GitHub Copilot Focus)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │    Cinema    │  │   Jukebox    │  │    Social    │            │
│  │    Player    │  │    Player    │  │   Features   │            │
│  │ (HTML/JS/CSS)│  │   (React)    │  │   (React)    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                  │                     │
│         └─────────────────┴──────────────────┘                     │
│                           │                                        │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            │ HTTP/WebSocket
                            │
┌───────────────────────────┼────────────────────────────────────────┐
│                           │    API GATEWAY LAYER                   │
│                    (Amazon Q Focus)                                │
├───────────────────────────┼────────────────────────────────────────┤
│                           │                                        │
│  ┌────────────────────────┴─────────────────────────┐             │
│  │         Security Middleware                      │             │
│  │  • Rate Limiting (100/15min)                     │             │
│  │  • XSS Sanitization                              │             │
│  │  • Injection Prevention                          │             │
│  │  • CORS (localhost:3000, localhost:5173)         │             │
│  │  • Helmet.js Security Headers                    │             │
│  └────────────────────────┬─────────────────────────┘             │
│                           │                                        │
│         ┌─────────────────┴─────────────────┐                     │
│         │                                   │                     │
│  ┌──────▼──────────┐              ┌─────────▼────────┐           │
│  │  GraphQL API    │              │  Video Gen API   │           │
│  │  Port 4000      │              │  Port 5003       │           │
│  │                 │              │                  │           │
│  │ • Apollo Server │              │ • Flask REST     │           │
│  │ • WebSocket     │              │ • PyTorch ML     │           │
│  │ • Subscriptions │              │ • Video Stream   │           │
│  │ • JWT Auth      │              │ • Analytics      │           │
│  └────────┬────────┘              └─────────┬────────┘           │
│           │                                 │                     │
└───────────┼─────────────────────────────────┼─────────────────────┘
            │                                 │
            │                                 │
┌───────────┼─────────────────────────────────┼─────────────────────┐
│           │      DATA LAYER                 │                     │
│           │   (Amazon Q Focus)              │                     │
├───────────┼─────────────────────────────────┼─────────────────────┤
│           │                                 │                     │
│  ┌────────▼────────┐              ┌─────────▼────────┐           │
│  │    MongoDB      │              │     Redis        │           │
│  │  Port 27017     │              │   Port 6379      │           │
│  │                 │              │                  │           │
│  │ • Users         │              │ • Sessions       │           │
│  │ • Videos        │              │ • Cache          │           │
│  │ • Analytics     │              │ • Rate Limits    │           │
│  │ • Sessions      │              │ • Pub/Sub        │           │
│  │                 │              │                  │           │
│  │ Indexes:        │              │ Config:          │           │
│  │ • email (unique)│              │ • LRU eviction   │           │
│  │ • userId        │              │ • 1GB max memory │           │
│  │ • createdAt     │              │ • RDB snapshots  │           │
│  │ • TTL (sessions)│              │ • Password auth  │           │
│  └─────────────────┘              └──────────────────┘           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
            │                                 │
            │                                 │
┌───────────┼─────────────────────────────────┼─────────────────────┐
│           │    CLOUD LAYER (Optional)       │                     │
│           │   (Amazon Q Focus)              │                     │
├───────────┼─────────────────────────────────┼─────────────────────┤
│           │                                 │                     │
│  ┌────────▼────────┐  ┌──────────────┐  ┌──▼──────────┐         │
│  │   AWS S3        │  │  DynamoDB    │  │   Lambda    │         │
│  │                 │  │              │  │             │         │
│  │ • Video Storage │  │ • Metadata   │  │ • Processing│         │
│  │ • Versioning    │  │ • Analytics  │  │ • Webhooks  │         │
│  │ • Encryption    │  │ • Indexes    │  │ • Events    │         │
│  └─────────────────┘  └──────────────┘  └─────────────┘         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐         │
│  │              CloudFront CDN                         │         │
│  │  • Global distribution                              │         │
│  │  • Edge caching                                     │         │
│  │  • SSL/TLS                                          │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Video Playback Flow
```
Cinema Player → GraphQL API → MongoDB (metadata)
              ↓
         Video Gen API → S3/Local Storage → Stream to Player
              ↓
         Analytics API → MongoDB (tracking)
```

### 2. Real-time Updates Flow
```
Frontend → WebSocket (ws://localhost:4000/graphql)
         ↓
    GraphQL Subscriptions
         ↓
    Redis Pub/Sub
         ↓
    All Connected Clients
```

### 3. Video Generation Flow
```
Frontend → POST /generate
         ↓
    Video Gen API (PyTorch)
         ↓
    Generate Video (30s)
         ↓
    Save to Storage
         ↓
    Return URL to Frontend
```

### 4. Authentication Flow
```
Frontend → POST /auth/login
         ↓
    GraphQL API
         ↓
    MongoDB (verify user)
         ↓
    Generate JWT Token
         ↓
    Store in Redis (session)
         ↓
    Return to Frontend
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                              │
│  • CORS whitelist                                       │
│  • Rate limiting                                        │
│  • Request size limits                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Input Validation                              │
│  • XSS sanitization                                     │
│  • SQL/NoSQL injection prevention                       │
│  • Schema validation                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Authentication                                │
│  • JWT tokens                                           │
│  • Session management                                   │
│  • Password hashing (bcrypt)                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Authorization                                 │
│  • Role-based access control                            │
│  • Resource ownership checks                            │
│  • API key validation                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 5: Data Security                                 │
│  • MongoDB authentication                               │
│  • Redis password protection                            │
│  • Encryption at rest (S3)                              │
│  • Encryption in transit (TLS)                          │
└─────────────────────────────────────────────────────────┘
```

## Service Dependencies

```
┌──────────────────┐
│  start:backend   │  (Orchestrator)
└────────┬─────────┘
         │
         ├─→ Check MongoDB (port 27017)
         │   └─→ docker-compose.dev.yml
         │
         ├─→ Check Redis (port 6379)
         │   └─→ docker-compose.dev.yml
         │
         ├─→ Optimize Databases
         │   └─→ scripts/optimize-databases.js
         │
         ├─→ Start GraphQL API (port 4000)
         │   └─→ api/graphql/server-enhanced.js
         │       ├─→ MongoDB connection
         │       ├─→ Redis connection
         │       └─→ WebSocket server
         │
         └─→ Start Video Gen API (port 5003)
             └─→ services/video-generation/api.py
                 ├─→ PyTorch models
                 └─→ Flask server
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Development                          │
├─────────────────────────────────────────────────────────┤
│  • Docker Compose (MongoDB + Redis)                     │
│  • Local Node.js servers                                │
│  • Local Python API                                     │
│  • npm run start:backend                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    Staging                              │
├─────────────────────────────────────────────────────────┤
│  • Docker containers                                    │
│  • AWS RDS (MongoDB)                                    │
│  • AWS ElastiCache (Redis)                              │
│  • ECS/Fargate                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    Production                           │
├─────────────────────────────────────────────────────────┤
│  • Kubernetes + Istio                                   │
│  • MongoDB Atlas                                        │
│  • AWS ElastiCache                                      │
│  • Auto-scaling                                         │
│  • Blue-green deployment                                │
│  • Multi-region                                         │
└─────────────────────────────────────────────────────────┘
```

## Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
│  • GraphQL API                                          │
│  • Video Generation API                                 │
└────────────────────┬────────────────────────────────────┘
                     │ Metrics
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   Prometheus                            │
│  • Scrape metrics every 15s                             │
│  • Store time-series data                               │
│  • Alert rules                                          │
└────────────────────┬────────────────────────────────────┘
                     │ Query
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    Grafana                              │
│  • Dashboards                                           │
│  • Visualizations                                       │
│  • Alerts                                               │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
my-local-repo/
├── api/
│   └── graphql/
│       ├── server-enhanced.js          # GraphQL server
│       ├── schema-enhanced.graphql     # GraphQL schema
│       ├── resolvers/                  # Query/Mutation resolvers
│       ├── middleware/
│       │   └── security.js             # Security middleware ✨
│       └── package.json
│
├── services/
│   └── video-generation/
│       ├── api.py                      # Flask API
│       ├── generator.py                # Video generation
│       └── unet.py                     # ML models
│
├── scripts/
│   ├── start-backend.js                # Orchestrator ✨
│   ├── optimize-databases.js           # DB optimization ✨
│   ├── validate-backend.js             # Validation ✨
│   ├── aws-setup.js                    # AWS setup ✨
│   └── mongo-init.js                   # MongoDB init ✨
│
├── docs/
│   └── BACKEND_QUICKSTART.md           # Backend guide ✨
│
├── docker-compose.dev.yml              # Dev infrastructure ✨
├── .env                                # Environment config ✨
├── BACKEND_STATUS.md                   # Integration status ✨
├── SUMMARY.md                          # Complete summary ✨
└── package.json                        # Updated scripts ✨

✨ = Created/Updated by Amazon Q
```

---

**Legend:**
- 🟢 Running and healthy
- 🟡 Optional/Not started
- 🔴 Error/Not configured
- ✨ New/Updated files

**Status:** All systems operational and ready for frontend integration!
