# 🧪 Live API Testing Guide

## Test Your Integration in Real-Time

This guide provides copy-paste commands to test every integration point.

---

## Prerequisites

```bash
# Terminal 1: Start Infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Start Backend
npm run start:backend

# Terminal 3: Start Frontend
node serve-html-basic.js

# Terminal 4: Ready for testing
# Use curl, Postman, or browser console
```

---

## 1️⃣ Health Checks

### GraphQL API Health

```bash
curl http://localhost:4000/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "service": "GraphQL API",
  "uptime": 12345
}
```

### Video API Health

```bash
curl http://localhost:5003/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "service": "Video Generation API",
  "uptime": 12345
}
```

### MongoDB Connection

```bash
mongosh mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin
# Inside mongosh:
> db.videos.countDocuments()
# Should return: number or 0 if empty
```

### Redis Connection

```bash
redis-cli -h localhost -p 6379 -a dev_redis_password
# Inside redis-cli:
> PING
# Should return: PONG
```

---

## 2️⃣ GraphQL API Tests

### Get Videos

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { videos { id title duration } }"
  }'
```

### Get Single Video

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { video(id: \"video-1\") { id title description duration } }"
  }'
```

### Like Video

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { likeVideo(id: \"video-1\") { id likes } }"
  }'
```

### Add Comment

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addComment(videoId: \"video-1\", text: \"Great video!\") { id author text timestamp } }"
  }'
```

### Get Comments

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { comments(videoId: \"video-1\") { id author text timestamp likes } }"
  }'
```

---

## 3️⃣ REST API Tests

### Track Event

```bash
curl -X POST http://localhost:5003/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "video_id": "video-1",
    "event_type": "video_play",
    "timestamp": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
    "current_time": 0,
    "playback_rate": 1.0
  }'
```

### Track Playback Position

```bash
curl -X POST http://localhost:5003/api/analytics/playback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "video_id": "video-1",
    "current_time": 45.2,
    "playback_rate": 1.0,
    "duration": 300
  }'
```

### Get Video Metadata

```bash
curl http://localhost:5003/api/video/video-1
```

---

## 4️⃣ WebSocket Tests

### Browser Console

```javascript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:4000/graphql')

ws.addEventListener('open', () => {
  console.log('✅ WebSocket connected')

  // Subscribe to video updates
  ws.send(
    JSON.stringify({
      type: 'start',
      payload: {
        query: 'subscription { videoUpdated { id status progress } }',
      },
    })
  )
})

ws.addEventListener('message', (event) => {
  console.log('📨 Message:', event.data)
})

ws.addEventListener('error', (error) => {
  console.error('❌ Error:', error)
})
```

---

## 5️⃣ Frontend Integration Tests

### Open Browser Console

```javascript
// 1. Check WebSocket
console.log('WS Status:', wsConnection?.readyState)
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED

// 2. Check Session
console.log('Session ID:', sessionId)

// 3. Check User
console.log('Current User:', currentUser)

// 4. Fetch Videos
await fetchVideosFromBackend()

// 5. Fetch Video Details
const details = await fetchVideoDetails('video-1')
console.log('Video Details:', details)

// 6. Track Event
await trackEvent('test_event', { message: 'Testing' })

// 7. Like Video
await likeVideo('video-1')

// 8. Add Comment
await addComment('This is a test comment')

// 9. Join Watch Party
await joinWatchParty()

// 10. Share Video
await shareVideo('copy')
```

---

## 6️⃣ Database Tests

### MongoDB

```bash
mongosh mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin

# List collections
show collections

# Count videos
db.videos.countDocuments()

# Find video
db.videos.findOne()

# Count comments
db.comments.countDocuments()

# View indexes
db.videos.getIndexes()

# Find user
db.users.findOne()
```

### Redis

```bash
redis-cli -h localhost -p 6379 -a dev_redis_password

# Check stats
INFO

# Get cache keys
KEYS *

# Get value
GET "video:video-1"

# Set value
SET "test:key" "test:value" EX 3600

# List operations
LLEN "analytics:events"
```

---

## 7️⃣ Load Testing

### Simple Load Test

```bash
# Install k6 (https://k6.io/docs/getting-started/installation/)

# Create load-test-simple.js
cat > load-test-simple.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  const res = http.get('http://localhost:4000/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF

# Run test
k6 run load-test-simple.js
```

### GraphQL Load Test

```bash
cat > load-test-graphql.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
};

export default function() {
  const query = JSON.stringify({
    query: '{ videos(limit: 10) { id title } }',
  });

  const res = http.post('http://localhost:4000/graphql', query, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data': (r) => r.body.includes('data'),
  });
}
EOF

# Run test
k6 run load-test-graphql.js
```

---

## 8️⃣ Performance Benchmarks

### Measure GraphQL Latency

```bash
# Test 100 requests
time for i in {1..100}; do
  curl -s -X POST http://localhost:4000/graphql \
    -H "Content-Type: application/json" \
    -d '{"query": "{ videos(limit: 1) { id } }"}' > /dev/null
done
```

### WebSocket Latency

```javascript
// Browser console
const ws = new WebSocket('ws://localhost:4000/graphql')
const start = Date.now()

ws.addEventListener('open', () => {
  const latency = Date.now() - start
  console.log('Connection latency:', latency + 'ms')
})
```

---

## 9️⃣ Error Scenarios

### Test Rate Limiting

```bash
# Make 101 requests in 15 minutes (limit is 100)
for i in {1..101}; do
  echo "Request $i:"
  curl -i http://localhost:4000/health | head -1
  sleep 1
done

# You should see a 429 (Too Many Requests) error
```

### Test Malicious Input

```bash
# XSS attempt
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { addComment(videoId: \"<script>alert(1)</script>\", text: \"test\") { id } }"
  }'

# Should be sanitized

# SQL Injection attempt
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { video(id: \"1 OR 1=1\") { id } }"
  }'

# Should be prevented
```

---

## 🔟 Monitoring Checklist

- [ ] GraphQL API responding (< 100ms)
- [ ] Video API responding (< 100ms)
- [ ] MongoDB connected and responsive
- [ ] Redis connected and responsive
- [ ] WebSocket connections working
- [ ] Real-time subscriptions active
- [ ] Analytics tracking working
- [ ] Payloads being sanitized
- [ ] Rate limiting active
- [ ] Error handling working
- [ ] Reconnection logic working
- [ ] Cache hit rates > 80%

---

## 🐛 Debugging

### Enable Verbose Logging

**Backend:**

```javascript
// In api/graphql/index.js
process.env.DEBUG = 'hootner:*'
```

**Frontend:**

```javascript
// Browser console
localStorage.setItem('debug', 'hootner:*')
// Reload page
```

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by:
   - **XHR** - GraphQL/REST requests
   - **WS** - WebSocket connections
   - **Document** - HTML pages

### Monitor Backend Logs

```bash
# GraphQL logs
docker logs -f hootner-graphql-api

# Video API logs
docker logs -f hootner-video-api

# MongoDB logs
docker logs -f hootner-mongodb-dev

# Redis logs
docker logs -f hootner-redis-dev
```

---

## ✅ Validation Checklist

After running all tests, verify:

- [ ] All health checks pass
- [ ] GraphQL queries return data
- [ ] Mutations create records
- [ ] Analytics events recorded
- [ ] WebSocket messages received
- [ ] Comments appear real-time
- [ ] Likes update instantly
- [ ] Rate limiting works
- [ ] XSS prevented
- [ ] Performance metrics good
- [ ] No console errors
- [ ] No security warnings

---

## 📊 Sample Data

### Create Test Video

```bash
mongosh mongodb://admin:dev_password_change_in_prod@localhost:27017/hootner?authSource=admin

db.videos.insertOne({
  _id: ObjectId(),
  id: "video-test-1",
  title: "Test Video",
  description: "This is a test video",
  url: "http://localhost:5003/api/video/stream/test.mp4",
  duration: 300,
  thumbnail: "http://localhost:5003/api/video/thumbnail/test.jpg",
  views: 0,
  likes: 0,
  uploadedAt: new Date(),
  creator: {
    id: "user-1",
    username: "testuser",
    avatar: "http://avatar.com/test.jpg"
  }
})
```

### Create Test User

```bash
db.users.insertOne({
  _id: ObjectId(),
  id: "user-test-1",
  username: "testuser",
  email: "test@example.com",
  avatar: "http://avatar.com/test.jpg",
  watchHistory: [],
  likedVideos: [],
  watchlist: []
})
```

---

## 🎯 Success Indicators

You'll know everything is working when:

✅ **Health Checks**

```bash
curl http://localhost:4000/health   # ✅ 200 OK
curl http://localhost:5003/health   # ✅ 200 OK
```

✅ **GraphQL**

```bash
curl ... -d '{"query": "{ videos { id } }"}' # ✅ Returns data
```

✅ **Analytics**

```bash
curl -X POST .../analytics/track ... # ✅ 200 OK
```

✅ **WebSocket**

```javascript
wsConnection.readyState === 1 // ✅ OPEN
```

✅ **Frontend**

```javascript
fetchVideosFromBackend() // ✅ Populates grid
likeVideo() // ✅ Updates count
addComment() // ✅ Shows instantly
```

---

## 📞 Support

**Issues?**

1. Check backend logs: `docker logs hootner-graphql-api`
2. Check frontend console: F12 → Console tab
3. Verify services running: `docker ps`
4. Test health endpoints manually
5. Review [Frontend Integration Guide](docs/FRONTEND_INTEGRATION_GUIDE.md)
6. Review [Backend Quick Ref](BACKEND_QUICK_REF.md)

---

**Last Updated:** January 22, 2026
**Status:** ✅ Production Ready

The owl is watching! 🦉
