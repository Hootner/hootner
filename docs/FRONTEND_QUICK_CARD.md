# 🎬 Cinema Player Integration Quick Card

## Start Everything (60 Seconds)

```bash
# Terminal 1: Infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Backend
npm run start:backend

# Terminal 3: Frontend
node serve-html-basic.js

# Open Browser
http://localhost:3005/video-player
```

---

## Available Services

| Service           | URL                                | Status |
| ----------------- | ---------------------------------- | ------ |
| **Cinema Player** | http://localhost:3005/video-player | 🎬     |
| **GraphQL API**   | http://localhost:4000/graphql      | 🚀     |
| **Video API**     | http://localhost:5003/health       | 📹     |
| **MongoDB**       | mongodb://localhost:27017/hootner  | 🗄️     |
| **Redis**         | redis://localhost:6379             | ⚡     |

---

## Frontend Integration Points

### 🔌 WebSocket Real-Time

```javascript
// Auto-connects on page load
initWebSocket()

// Subscribe to events
subscribeToVideoUpdates()
subscribeToComments()
subscribeLikeUpdates()
```

### 📊 Real Data Binding

```javascript
// Load videos
await fetchVideosFromBackend()

// Get video details
const details = await fetchVideoDetails(videoId)

// Get user profile
const user = await fetchUserProfile()
```

### 📈 Analytics Tracking

```javascript
// Track events (auto: play, pause, seek, complete)
await trackEvent('custom_event', { data: value })

// Track position (auto: every 10s)
await trackPlaybackPosition()
```

### 💬 Social Features

```javascript
// Like
await likeVideo(videoId)

// Comment
await addComment('Great video!')

// Share
await shareVideo('copy')

// Watch Party
await joinWatchParty()
```

---

## API Endpoints

### GraphQL

```javascript
// POST http://localhost:4000/graphql
const response = await graphqlFetch(query, variables)
```

### REST Analytics

```
POST http://localhost:5003/api/analytics/track
POST http://localhost:5003/api/analytics/playback
```

### Video Streaming

```
GET http://localhost:5003/api/video/stream/<file>
GET http://localhost:5003/api/video/<id>
```

---

## Keyboard Shortcuts

| Key         | Action       |
| ----------- | ------------ |
| **T**       | Theater Mode |
| **C**       | Cinema Mode  |
| **S**       | Stats        |
| **L**       | Playlist     |
| **H**       | History      |
| **/**       | Search       |
| **Ctrl+I**  | Mini-Player  |
| **Shift+C** | Screenshot   |
| **?**       | Help         |

---

## Common Tasks

### Add Real Videos

```javascript
fetchVideosFromBackend()
```

### Track User Action

```javascript
await trackEvent('user_action', {
  action: 'video_like',
  video_id: videoId,
})
```

### Handle Comments Real-Time

```javascript
// Auto-handled by WebSocket subscription
// Comments appear instantly with:
subscribeToComments()
```

### Update Like Count

```javascript
// Auto-updated by subscription
// See: handleWebSocketMessage()
```

### Share Video

```javascript
await shareVideo('copy')
showNotification('📋 Link copied!')
```

---

## Browser Console Tips

```javascript
// Check connection
console.log('WS Ready:', wsConnection.readyState === 1)

// Check session
console.log('Session:', sessionId)

// Check user
console.log('User:', currentUser)

// Manual refresh
fetchVideosFromBackend()

// Manual track
trackEvent('test', { message: 'Hello' })
```

---

## Troubleshooting

### ❌ No Videos Loading

```javascript
// Check GraphQL
curl http://localhost:4000/health

// Check connection
console.log(wsConnection);

// Manual fetch
fetchVideosFromBackend();
```

### ❌ Comments Not Real-Time

```javascript
// Verify subscription
subscribeToComments();

// Check WebSocket
console.log(wsConnection.readyState);

// Manually check
curl ws://localhost:4000/graphql
```

### ❌ Analytics Not Tracking

```javascript
// Check Video API
curl http://localhost:5003/health

// Check session
console.log(sessionId);

// Manual track
trackEvent('test');
```

---

## Security

- ✅ Rate Limiting: 100 req/15min
- ✅ XSS Protection: Input sanitization
- ✅ JWT Auth: Bearer token headers
- ✅ CORS: Whitelisted localhost
- ✅ Request Limits: 10MB max

---

## Documentation

📚 [Full Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)
📚 [Backend Quick Ref](BACKEND_QUICK_REF.md)
📚 [Backend Status](BACKEND_STATUS.md)
📚 [Architecture](ARCHITECTURE_DIAGRAM.md)

---

## Files Modified

- ✅ `hexarchy/4-interface/ui/pages/video-player.html` - Added ~1500 lines
  - Option E: WebSocket integration
  - Option F: Real data binding
  - Option G: Analytics tracking
  - Option H: Social features

---

## Status

🟢 **All Systems Go**

- WebSocket: ✅ Connected
- GraphQL: ✅ Responding
- Analytics: ✅ Tracking
- Social: ✅ Active
- Security: ✅ Hardened

---

**Last Updated:** January 22, 2026
**By:** GitHub Copilot
**For:** HOOTNER Team

The owl is flying high! 🦉
