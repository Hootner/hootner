# 🔧 Backend Quick Start Guide

## Amazon Q Focus Areas ✅

This guide covers the backend infrastructure that Amazon Q is managing while GitHub Copilot handles frontend features.

---

## 🚀 Quick Start (60 seconds)

```bash
# 1. Start infrastructure (MongoDB + Redis)
docker-compose -f docker-compose.dev.yml up -d

# 2. Install dependencies (if not done)
npm install
cd api/graphql && npm install && cd ../..

# 3. Start all backend services
npm run start:backend
```

**Services will be available at:**
- GraphQL API: http://localhost:4000/graphql
- Video Generation: http://localhost:5003/health
- MongoDB: mongodb://localhost:27017/hootner
- Redis: redis://localhost:6379

---

## 📦 NPM Dependencies - FIXED ✅

**Issue:** Conflicting `express-graphql` and `apollo-server-express` packages

**Solution:** Removed `express-graphql` from root package.json. GraphQL API now uses Apollo Server exclusively.

```bash
# Reinstall dependencies
npm install
cd api/graphql && npm install
```

---

## 🗄️ Database Setup

### MongoDB + Redis (Docker)

```bash
# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker ps

# View logs
docker logs hootner-mongodb-dev
docker logs hootner-redis-dev

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down
```

### Database Optimization

```bash
# Optimize MongoDB indexes and Redis configuration
npm run db:optimize
```

**What it does:**
- Creates MongoDB collections (users, videos, sessions, analytics)
- Creates performance indexes
- Configures Redis LRU eviction policy
- Sets up TTL for session expiration

---

## 🔐 Security Hardening

### Security Middleware

Location: `api/graphql/middleware/security.js`

**Features:**
- Rate limiting (API, Auth, GraphQL)
- XSS sanitization
- SQL/NoSQL injection prevention
- Request size limiting
- Security headers (Helmet.js)

### Apply Security Middleware

```javascript
// In your Express app
const {
  apiLimiter,
  authLimiter,
  securityHeaders,
  sanitizeInput,
  preventInjection,
} = require('./middleware/security');

app.use(securityHeaders);
app.use(sanitizeInput);
app.use(preventInjection);
app.use('/api', apiLimiter);
app.use('/auth', authLimiter);
```

---

## 🎯 GraphQL API

### Start GraphQL Server

```bash
# Standalone
cd api/graphql && npm start

# Or with backend orchestrator
npm run start:backend
```

### Health Check

```bash
curl http://localhost:4000/health
```

### GraphQL Playground

Open: http://localhost:4000/graphql

**Example Query:**
```graphql
query {
  videos {
    id
    title
    url
    duration
  }
}
```

---

## 🎬 Python AI Services

### Video Generation API

```bash
cd services/video-generation

# Install dependencies (first time)
python install.py

# Start API
python api.py
```

**Endpoints:**
- `POST /generate` - Generate video from text
- `GET /health` - Health check
- `GET /api/video/<id>` - Get video metadata
- `GET /api/video/stream/<file>` - Stream video

### Test Video Generation

```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A robot dancing in space",
    "num_frames": 16,
    "height": 64,
    "width": 64
  }'
```

---

## ☁️ AWS Infrastructure

### Setup AWS Resources

```bash
# Configure AWS CLI
aws configure

# Run setup script
npm run aws:setup
```

**Creates:**
- S3 bucket for video storage
- DynamoDB table for metadata
- Lambda function for processing
- IAM roles and policies

**Configuration saved to:** `config/aws-config.json`

---

## 🔄 Backend Services Orchestrator

### Start All Services

```bash
npm run start:backend
```

**What it does:**
1. Checks MongoDB and Redis are running
2. Optimizes database configurations
3. Starts GraphQL API (port 4000)
4. Starts Video Generation API (port 5003)
5. Monitors services and auto-restarts on failure

### Stop Services

Press `Ctrl+C` - graceful shutdown of all services

---

## 🔍 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# View MongoDB logs
docker logs hootner-mongodb-dev

# Restart MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli -a dev_redis_password ping

# View Redis logs
docker logs hootner-redis-dev
```

### GraphQL API Issues

```bash
# Check if port 4000 is available
netstat -ano | findstr :4000

# View GraphQL logs
cd api/graphql && npm start
```

### Python API Issues

```bash
# Check Python version (requires 3.8+)
python --version

# Reinstall dependencies
cd services/video-generation
python install.py

# Check if port 5003 is available
netstat -ano | findstr :5003
```

---

## 📊 Monitoring & Health Checks

### Service Health

```bash
# GraphQL API
curl http://localhost:4000/health

# Video Generation API
curl http://localhost:5003/health

# MongoDB
mongosh "mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin" --eval "db.adminCommand('ping')"

# Redis
redis-cli -a dev_redis_password ping
```

### Database Stats

```bash
# MongoDB stats
mongosh "mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin" --eval "db.stats()"

# Redis info
redis-cli -a dev_redis_password info memory
```

---

## 🤝 Coordination with GitHub Copilot

### Backend APIs Ready for Frontend Integration

Once backend services are running, GitHub Copilot can integrate:

**GraphQL Endpoints:**
- `http://localhost:4000/graphql` - Main GraphQL endpoint
- WebSocket subscriptions for real-time features

**Video APIs:**
- `http://localhost:5003/api/video/<id>` - Video metadata
- `http://localhost:5003/api/video/stream/<file>` - Video streaming

**Analytics:**
- `POST http://localhost:5003/api/analytics/track` - Track events
- `POST http://localhost:5003/api/analytics/playback` - Track playback

### WebSocket Support

GraphQL API includes WebSocket support for real-time features:
- `ws://localhost:4000/graphql` - Subscriptions endpoint

---

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
MONGODB_URI=mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin
REDIS_URL=redis://:dev_redis_password@localhost:6379

# API
JWT_SECRET=your-secret-key-min-32-chars
API_PORT=4000

# AWS (optional for local dev)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_your_key
```

---

## 🎯 Next Steps

1. ✅ Dependencies fixed - `npm install` should work
2. ✅ Infrastructure ready - MongoDB + Redis via Docker
3. ✅ Security hardened - Rate limiting, XSS protection, injection prevention
4. ✅ APIs ready - GraphQL + Video Generation
5. ✅ AWS setup script - Run when ready to deploy

**Ready for frontend integration!** 🚀

GitHub Copilot can now integrate WebSocket APIs and video streaming into the Cinema Player and other frontend features.

---

## 📚 Additional Resources

- [GraphQL Schema](../api/graphql/schema-enhanced.graphql)
- [Security Middleware](../api/graphql/middleware/security.js)
- [Video Generation API](../services/video-generation/api.py)
- [AWS Setup Script](./aws-setup.js)
- [Database Optimization](./optimize-databases.js)

---

**Questions?** Check the main [README.md](../README.md) or create an issue.
