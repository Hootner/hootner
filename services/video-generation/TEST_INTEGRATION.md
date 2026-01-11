# 🔗 Backend-Frontend Integration Test Guide

**Status:** ✅ **FULLY CONNECTED**

## Overview

The cinema player is now fully integrated with the backend API, featuring:
- ✅ Dynamic video loading from backend
- ✅ Real-time analytics tracking
- ✅ Scene/chapter markers integration
- ✅ Metadata synchronization
- ✅ Cross-origin resource sharing (CORS)

---

## Quick Test

### 1. Start Backend API

```bash
cd services/video-generation
python api.py
```

Expected output:
```
🚀 Initializing Video Generator...
✅ Generator ready!

============================================================
🦉 HOOTNER Video Generation API
============================================================

📡 Server starting on http://localhost:5003

📚 Endpoints:
   GET  /health                  - Health check
   POST /generate                - Generate single video
   ...

🎬 Video Player Integration:
   GET  /api/video/<id>          - Get video metadata
   GET  /api/video/stream/<file> - Stream video file
   GET  /api/video/sample        - Get sample video

📊 Analytics:
   POST /api/analytics/track     - Track events
   POST /api/analytics/playback  - Track playback
   GET  /api/analytics/<id>      - Get video analytics

============================================================
```

### 2. Generate a Test Video

```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A robot dancing in space",
    "num_frames": 16,
    "format": "mp4"
  }'
```

Response:
```json
{
  "job_id": "abc123-def456-...",
  "status": "completed",
  "download_url": "/download/abc123-def456-....mp4"
}
```

### 3. Open Video Player

Open in browser:
```
http://localhost:3000/cinema-player.html?video=abc123-def456
```

Or use direct URL:
```
http://localhost:3000/cinema-player.html?url=/api/video/stream/abc123-def456.mp4
```

Or load sample:
```
http://localhost:3000/cinema-player.html
```

---

## Integration Features

### 1. **Dynamic Video Loading**

The player automatically loads videos from the backend based on URL parameters:

**URL Patterns:**
- `?video=<video_id>` - Load by video ID (fetches metadata)
- `?url=<video_url>` - Load by direct URL
- No params - Loads sample/default video

**JavaScript Code:**
```javascript
// Automatically called on page load
async function loadVideoFromBackend() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('video');
    const videoUrl = urlParams.get('url');

    if (videoUrl) {
        loadVideoUrl(videoUrl);
    } else if (videoId) {
        await fetchVideoMetadata(videoId);
    } else {
        loadVideoUrl(`${API_BASE_URL}/api/video/sample`);
    }
}
```

### 2. **Metadata Integration**

When loading by video ID, the player fetches rich metadata:

**API Request:**
```
GET /api/video/<video_id>
```

**Response:**
```json
{
  "id": "video-123",
  "title": "A robot dancing in space",
  "url": "/api/video/stream/video-123.mp4",
  "duration": 30.0,
  "created_at": "2026-01-11T10:30:00Z",
  "metadata": {
    "prompt": "A robot dancing in space",
    "num_frames": 16,
    "scenes": [...]
  }
}
```

**Player Actions:**
- Updates page title with video title
- Loads chapter markers from scenes
- Initializes analytics tracking
- Updates duration badge

### 3. **Real-Time Analytics**

The player automatically tracks user interactions:

**Events Tracked:**
- `session_start` - User loads video
- `play` - Playback started
- `pause` - Playback paused
- `seek` - User seeks to position
- `complete` - Video finished
- `session_end` - User leaves page

**Playback Position:**
- Tracked every 5 seconds during playback
- Includes current time and playback rate

**API Calls:**
```javascript
// Track event
POST /api/analytics/track
{
  "session_id": "uuid",
  "video_id": "video-123",
  "event_type": "play",
  "timestamp": 10.5
}

// Track position
POST /api/analytics/playback
{
  "session_id": "uuid",
  "video_id": "video-123",
  "current_time": 45.2,
  "playback_rate": 1.0
}
```

**Analytics Storage:**
- Stored in `services/video-generation/analytics/` directory
- One file per session: `<session_id>.jsonl`
- JSONL format (one JSON event per line)

### 4. **Chapter Markers**

If the backend provides scene data, the player displays chapter markers:

```javascript
function loadChapterMarkers(scenes) {
    const container = document.getElementById('chapterMarkers');
    container.innerHTML = '';

    scenes.forEach(scene => {
        const marker = document.createElement('div');
        marker.className = 'chapter-marker';
        marker.style.left = `${(scene.start_time / video.duration) * 100}%`;
        marker.title = `Scene at ${formatTime(scene.start_time)}`;
        container.appendChild(marker);
    });
}
```

### 5. **CORS Configuration**

Backend allows cross-origin requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Frontend server)
- `https://hootner.com` (Production)

**Python Configuration:**
```python
CORS(
    app,
    origins=["http://localhost:5173", "http://localhost:3000", "https://hootner.com"],
)
```

---

## API Endpoint Reference

### Video Endpoints

| Endpoint | Method | Description | Example |
|----------|--------|-------------|---------|
| `/api/video/<id>` | GET | Get video metadata | `/api/video/abc123` |
| `/api/video/stream/<file>` | GET | Stream video file | `/api/video/stream/video.mp4` |
| `/api/video/sample` | GET | Get sample video | `/api/video/sample` |

### Analytics Endpoints

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/analytics/track` | POST | Track event | `{session_id, video_id, event_type, timestamp}` |
| `/api/analytics/playback` | POST | Track position | `{session_id, video_id, current_time, playback_rate}` |
| `/api/analytics/<id>` | GET | Get video analytics | N/A |

---

## Testing Scenarios

### Scenario 1: Load Generated Video

```bash
# 1. Generate video
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Sunset over mountains", "format": "mp4"}'

# Response: {"job_id": "xyz789", ...}

# 2. Open in player
open http://localhost:3000/cinema-player.html?video=xyz789
```

**Expected Behavior:**
- Loading spinner appears
- Video loads from backend
- Title updates to "Sunset over mountains"
- Duration badge shows actual duration
- Analytics start tracking

### Scenario 2: Stream Sample Video

```bash
# Open player without parameters
open http://localhost:3000/cinema-player.html
```

**Expected Behavior:**
- Loads first available video from outputs directory
- If no videos exist, shows error message
- Analytics track as "sample" video

### Scenario 3: View Analytics

```bash
# Generate and watch video
VIDEO_ID="abc123"

# Get analytics
curl http://localhost:5003/api/analytics/$VIDEO_ID
```

**Expected Response:**
```json
{
  "video_id": "abc123",
  "total_views": 5,
  "total_events": 23,
  "events": [
    {
      "event_type": "session_start",
      "timestamp": 0.0,
      "recorded_at": "2026-01-11T10:30:00Z"
    },
    {
      "event_type": "play",
      "timestamp": 0.5,
      "recorded_at": "2026-01-11T10:30:01Z"
    },
    ...
  ]
}
```

---

## Browser Console Output

When the player loads successfully, you should see:

```
🎬 HOOTNER Cinema Player initialized
✨ Features: 8K UHD, HDR10, Dolby Atmos 7.1.4, 4-hour support
🔗 Backend: http://localhost:5003
Loading video metadata...
✅ Video loaded: Sunset over mountains
📊 Analytics session started: <session_id>
```

---

## Troubleshooting

### Issue: "Failed to load video"

**Causes:**
- Backend API not running
- CORS errors
- Video file doesn't exist

**Solutions:**
```bash
# Check backend is running
curl http://localhost:5003/health

# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5003/api/video/sample

# List available videos
ls services/video-generation/outputs/
```

### Issue: "Analytics not tracking"

**Check:**
- Browser console for errors
- Analytics directory exists: `services/video-generation/analytics/`
- Permissions to write files

**Debug:**
```javascript
// Open browser console
localStorage.debug = '*';
// Reload page and check analytics calls
```

### Issue: "Video not playing"

**Check:**
- Video codec support (H.264/H.265)
- File format (MP4 recommended)
- Browser compatibility

**Test:**
```bash
# Check video file
ffprobe services/video-generation/outputs/video.mp4
```

---

## Integration Checklist

✅ **Backend API:**
- [x] `/api/video/<id>` endpoint implemented
- [x] `/api/video/stream/<file>` endpoint implemented
- [x] `/api/analytics/track` endpoint implemented
- [x] `/api/analytics/playback` endpoint implemented
- [x] CORS configured for frontend origins
- [x] Analytics directory created

✅ **Frontend Player:**
- [x] Backend API URL configured
- [x] Dynamic video loading implemented
- [x] Metadata fetching implemented
- [x] Analytics tracking implemented
- [x] Chapter markers integration
- [x] Error handling added
- [x] Loading states implemented

✅ **Data Flow:**
- [x] Player → Backend (video requests)
- [x] Backend → Player (video streaming)
- [x] Player → Backend (analytics events)
- [x] Backend → Storage (analytics data)

---

## Next Steps

### 1. **Connect to New Modules**

Integrate the 5 new modules we created:

```python
# In api.py
from ai_video_intelligence import analyze_video_content
from adaptive_streaming import create_adaptive_streaming_package
from subtitle_generator import generate_multi_language_subtitles
from analytics_engine import VideoAnalytics
from watch_party import WatchPartyManager

# Add endpoints for each feature
```

### 2. **GraphQL Integration**

Connect to GraphQL API for unified data access:

```javascript
// In cinema-player.html
const GRAPHQL_URL = 'http://localhost:4000/graphql';

async function fetchVideoViaGraphQL(videoId) {
    const query = `
        query GetVideo($id: ID!) {
            video(id: $id) {
                id
                title
                url
                scenes { startTime endTime }
                analytics { views engagement }
            }
        }
    `;

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { id: videoId } })
    });

    return await response.json();
}
```

### 3. **Watch Party Integration**

Add WebSocket connection for real-time collaboration:

```javascript
const ws = new WebSocket('ws://localhost:5004/watch-party/abc123');

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'playback_state') {
        syncPlayback(message.data);
    }
};
```

---

## Summary

**Status:** ✅ **FULLY INTEGRATED**

The backend and frontend are now connected with:
- Dynamic video loading via REST API
- Real-time analytics tracking
- Metadata synchronization
- Chapter markers support
- Cross-origin resource sharing
- Error handling and loading states

**Test it now:**
```bash
# Terminal 1: Start backend
cd services/video-generation && python api.py

# Terminal 2: Generate test video
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test video", "format": "mp4"}'

# Browser: Open player
open http://localhost:3000/cinema-player.html
```

🎉 **Everything is connected and working!**
