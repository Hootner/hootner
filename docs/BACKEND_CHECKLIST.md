# ✅ Backend Setup Checklist

## 🎯 Quick Validation

Run this command to check everything:

```bash
npm run backend:validate
```

---

## 📋 Complete Checklist

### Prerequisites ✅

- [ ] Node.js 18+ installed (`node --version`)
- [ ] NPM 9+ installed (`npm --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] Git installed (`git --version`)

### Dependencies ✅

- [ ] Root dependencies installed (`npm install`)
- [ ] GraphQL API dependencies installed (`cd api/graphql && npm install`)
- [ ] No `express-graphql` conflict (removed from package.json)
- [ ] `graphql` package present in dependencies

### Configuration Files ✅

- [ ] `.env` file created (from `.env.example`)
- [ ] MongoDB URI configured in `.env`
- [ ] Redis URL configured in `.env`
- [ ] JWT secret set in `.env`
- [ ] `docker-compose.dev.yml` exists

### Infrastructure Services ✅

- [ ] Docker daemon running
- [ ] MongoDB container running (`docker ps | grep mongodb`)
- [ ] Redis container running (`docker ps | grep redis`)
- [ ] MongoDB accessible on port 27017
- [ ] Redis accessible on port 6379

### Database Setup ✅

- [ ] MongoDB collections created (users, videos, sessions, analytics)
- [ ] MongoDB indexes created (email, userId, createdAt)
- [ ] Redis configured with LRU eviction
- [ ] Redis max memory set (1GB)
- [ ] TTL indexes for session expiration

### Security ✅

- [ ] Security middleware created (`api/graphql/middleware/security.js`)
- [ ] Rate limiting configured
- [ ] XSS sanitization enabled
- [ ] Injection prevention active
- [ ] CORS whitelist configured
- [ ] Helmet.js security headers
- [ ] MongoDB authentication enabled
- [ ] Redis password protection

### API Services ✅

- [ ] GraphQL API server exists (`api/graphql/server-enhanced.js`)
- [ ] GraphQL schema exists (`api/graphql/schema-enhanced.graphql`)
- [ ] Video Generation API exists (`services/video-generation/api.py`)
- [ ] GraphQL health check responds (`http://localhost:4000/health`)
- [ ] Video API health check responds (`http://localhost:5003/health`)
- [ ] WebSocket subscriptions working (`ws://localhost:4000/graphql`)

### Scripts ✅

- [ ] Backend orchestrator (`scripts/start-backend.js`)
- [ ] Database optimizer (`scripts/optimize-databases.js`)
- [ ] AWS setup script (`scripts/aws-setup.js`)
- [ ] Backend validator (`scripts/validate-backend.js`)
- [ ] MongoDB init script (`scripts/mongo-init.js`)

### Documentation ✅

- [ ] Backend quick start guide (`docs/BACKEND_QUICKSTART.md`)
- [ ] Backend status document (`BACKEND_STATUS.md`)
- [ ] Architecture diagram (`docs/ARCHITECTURE_DIAGRAM.md`)
- [ ] Summary document (`SUMMARY.md`)
- [ ] This checklist (`docs/BACKEND_CHECKLIST.md`)

### NPM Scripts ✅

- [ ] `npm run start:backend` - Start all backend services
- [ ] `npm run db:optimize` - Optimize databases
- [ ] `npm run aws:setup` - Setup AWS infrastructure
- [ ] `npm run backend:validate` - Validate backend setup

---

## 🚀 Startup Sequence

### 1. First Time Setup

```bash
# Clone repository (if not done)
git clone <repository-url>
cd my-local-repo

# Install dependencies
npm install
cd api/graphql && npm install && cd ../..

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds for services to start
# Then optimize databases
npm run db:optimize

# Validate setup
npm run backend:validate
```

### 2. Daily Development

```bash
# Start infrastructure (if not running)
docker-compose -f docker-compose.dev.yml up -d

# Start backend services
npm run start:backend

# In another terminal, start frontend
npm start
```

### 3. Shutdown

```bash
# Stop backend services (Ctrl+C in terminal)

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down
```

---

## 🧪 Testing Checklist

### Infrastructure Tests

```bash
# Test MongoDB connection
mongosh "mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin" --eval "db.adminCommand('ping')"

# Test Redis connection
redis-cli -a dev_redis_password ping

# Check Docker containers
docker ps
```

### API Tests

```bash
# Test GraphQL health
curl http://localhost:4000/health

# Test Video Generation health
curl http://localhost:5003/health

# Test GraphQL query
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Test video generation
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "num_frames": 4}'
```

### Security Tests

```bash
# Test rate limiting (should fail after 100 requests)
for i in {1..101}; do curl http://localhost:4000/health; done

# Test CORS (should allow localhost:3000)
curl -H "Origin: http://localhost:3000" http://localhost:4000/health

# Test CORS (should block other origins)
curl -H "Origin: http://evil.com" http://localhost:4000/health
```

---

## 🔍 Troubleshooting Checklist

### MongoDB Issues

- [ ] Container running? (`docker ps | grep mongodb`)
- [ ] Port 27017 available? (`netstat -ano | findstr :27017`)
- [ ] Correct credentials in `.env`?
- [ ] View logs: `docker logs hootner-mongodb-dev`
- [ ] Restart: `docker-compose -f docker-compose.dev.yml restart mongodb`

### Redis Issues

- [ ] Container running? (`docker ps | grep redis`)
- [ ] Port 6379 available? (`netstat -ano | findstr :6379`)
- [ ] Correct password in `.env`?
- [ ] View logs: `docker logs hootner-redis-dev`
- [ ] Restart: `docker-compose -f docker-compose.dev.yml restart redis`

### GraphQL API Issues

- [ ] Dependencies installed? (`cd api/graphql && npm install`)
- [ ] Port 4000 available? (`netstat -ano | findstr :4000`)
- [ ] MongoDB connected?
- [ ] Redis connected?
- [ ] Check logs in terminal
- [ ] Restart: `npm run start:backend`

### Video Generation API Issues

- [ ] Python 3.8+ installed? (`python --version`)
- [ ] Dependencies installed? (`cd services/video-generation && python install.py`)
- [ ] Port 5003 available? (`netstat -ano | findstr :5003`)
- [ ] PyTorch installed?
- [ ] Check logs in terminal

### Dependency Issues

- [ ] Remove node_modules: `rm -rf node_modules api/graphql/node_modules`
- [ ] Clear npm cache: `npm cache clean --force`
- [ ] Reinstall: `npm install && cd api/graphql && npm install`
- [ ] Check for conflicts: `npm ls graphql`

---

## 🎯 Frontend Integration Checklist

### For GitHub Copilot

- [ ] Backend services running (`npm run start:backend`)
- [ ] GraphQL endpoint accessible (`http://localhost:4000/graphql`)
- [ ] WebSocket endpoint accessible (`ws://localhost:4000/graphql`)
- [ ] Video streaming endpoint accessible (`http://localhost:5003/api/video/stream/`)
- [ ] Analytics endpoint accessible (`http://localhost:5003/api/analytics/track`)

### Integration Points

- [ ] Apollo Client configured with GraphQL endpoint
- [ ] WebSocket Link configured for subscriptions
- [ ] Video player connected to streaming API
- [ ] Analytics tracking implemented
- [ ] Error handling for API failures
- [ ] Loading states for async operations
- [ ] Authentication token management

---

## 📊 Performance Checklist

### Database Performance

- [ ] MongoDB indexes created
- [ ] Query execution time < 100ms
- [ ] Connection pooling configured
- [ ] Redis cache hit rate > 80%

### API Performance

- [ ] Response time < 200ms (GraphQL)
- [ ] Video generation < 60s
- [ ] WebSocket latency < 50ms
- [ ] Rate limiting not blocking legitimate traffic

### Resource Usage

- [ ] MongoDB memory < 1GB
- [ ] Redis memory < 1GB
- [ ] Node.js memory < 512MB per process
- [ ] CPU usage < 50% idle

---

## 🔒 Security Checklist

### Authentication

- [ ] JWT tokens implemented
- [ ] Token expiration configured
- [ ] Refresh token mechanism
- [ ] Password hashing (bcrypt)

### Authorization

- [ ] Role-based access control
- [ ] Resource ownership checks
- [ ] API key validation
- [ ] Rate limiting per user

### Data Protection

- [ ] MongoDB authentication enabled
- [ ] Redis password protection
- [ ] Sensitive data encrypted
- [ ] HTTPS in production

### Attack Prevention

- [ ] XSS sanitization active
- [ ] SQL/NoSQL injection prevention
- [ ] CSRF protection
- [ ] Request size limits

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All tests passing
- [ ] Security audit clean
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Environment variables configured

### AWS Setup

- [ ] AWS CLI configured (`aws configure`)
- [ ] S3 bucket created (`npm run aws:setup`)
- [ ] DynamoDB table created
- [ ] Lambda functions deployed
- [ ] CloudFront distribution configured

### Production

- [ ] Environment set to production
- [ ] Strong secrets configured
- [ ] SSL/TLS certificates installed
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan

---

## ✅ Final Validation

Run all validation commands:

```bash
# 1. Validate backend setup
npm run backend:validate

# 2. Test all services
curl http://localhost:4000/health
curl http://localhost:5003/health

# 3. Check infrastructure
docker ps

# 4. Run security audit
npm run security:audit

# 5. Check logs
docker logs hootner-mongodb-dev
docker logs hootner-redis-dev
```

---

## 🎉 Success Criteria

All items checked = Backend ready for production! ✅

- ✅ All prerequisites installed
- ✅ All dependencies resolved
- ✅ All services running
- ✅ All tests passing
- ✅ All security measures active
- ✅ All documentation complete

**Status:** Ready for frontend integration! 🚀

---

## 📞 Support

If any checklist item fails:

1. Check troubleshooting section above
2. Review `docs/BACKEND_QUICKSTART.md`
3. Run `npm run backend:validate` for detailed errors
4. Check service logs
5. Create an issue with error details

---

**Last Updated:** 2025-01-10
**Maintained by:** Amazon Q (Backend Infrastructure)
