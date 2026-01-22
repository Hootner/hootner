# 🚀 Backend Quick Reference Card

## One-Line Commands

```bash
# Start everything
docker-compose -f docker-compose.dev.yml up -d && npm run start:backend

# Validate everything
npm run backend:validate

# Stop everything
docker-compose -f docker-compose.dev.yml down
```

---

## Service URLs

| Service | URL | Health Check |
|---------|-----|--------------|
| GraphQL API | http://localhost:4000/graphql | http://localhost:4000/health |
| Video Generation | http://localhost:5003 | http://localhost:5003/health |
| MongoDB | mongodb://localhost:27017 | `mongosh` connection |
| Redis | redis://localhost:6379 | `redis-cli ping` |

---

## Essential Commands

```bash
# Infrastructure
docker-compose -f docker-compose.dev.yml up -d    # Start
docker-compose -f docker-compose.dev.yml down     # Stop
docker ps                                         # Check status

# Backend Services
npm run start:backend      # Start all services
npm run backend:validate   # Validate setup
npm run db:optimize        # Optimize databases

# AWS (Optional)
npm run aws:setup          # Setup AWS resources

# Testing
curl http://localhost:4000/health    # GraphQL health
curl http://localhost:5003/health    # Video API health
```

---

## Troubleshooting

```bash
# MongoDB not connecting?
docker logs hootner-mongodb-dev
docker-compose -f docker-compose.dev.yml restart mongodb

# Redis not connecting?
docker logs hootner-redis-dev
docker-compose -f docker-compose.dev.yml restart redis

# Dependencies issues?
npm install
cd api/graphql && npm install

# Port conflicts?
netstat -ano | findstr :4000    # GraphQL
netstat -ano | findstr :5003    # Video API
netstat -ano | findstr :27017   # MongoDB
netstat -ano | findstr :6379    # Redis
```

---

## Environment Variables

```bash
# Required in .env
MONGODB_URI=mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin
REDIS_URL=redis://:dev_redis_password@localhost:6379
JWT_SECRET=your-secret-key-min-32-chars
API_PORT=4000
```

---

## Security Features

- ✅ Rate Limiting: 100 req/15min (API), 5 req/15min (Auth)
- ✅ XSS Protection: Input sanitization
- ✅ Injection Prevention: SQL/NoSQL pattern detection
- ✅ Security Headers: Helmet.js
- ✅ CORS: Whitelist localhost:3000, localhost:5173

---

## Documentation

- **Quick Start:** `docs/BACKEND_QUICKSTART.md`
- **Status:** `BACKEND_STATUS.md`
- **Architecture:** `docs/ARCHITECTURE_DIAGRAM.md`
- **Checklist:** `docs/BACKEND_CHECKLIST.md`
- **Complete Report:** `BACKEND_COMPLETE_REPORT.md`

---

## Integration Examples

### GraphQL Query
```javascript
fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '{ videos { id title url } }'
  })
});
```

### Video Streaming
```javascript
const video = await fetch('http://localhost:5003/api/video/video-123')
  .then(res => res.json());
// Use video.url in player
```

### Analytics
```javascript
await fetch('http://localhost:5003/api/analytics/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    video_id: videoId,
    event_type: 'play',
    timestamp: currentTime
  })
});
```

---

## Status Indicators

🟢 Running and healthy
🟡 Starting or optional
🔴 Error or not running
✅ Configured correctly
❌ Needs attention

---

**Quick Help:** Run `npm run backend:validate` for detailed status

**Last Updated:** 2025-01-10
