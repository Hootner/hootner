# HOOTNER Streaming API Documentation

## Overview
The HOOTNER Streaming API provides comprehensive endpoints for managing live streams, analytics, chat, and multi-platform broadcasting.

## Base URL
```
http://localhost:3005/api
```

## Authentication
Currently, the API uses basic session-based authentication. Future versions will include JWT tokens.

## Endpoints

### Streams

#### GET /streams
Get all active streams
```json
{
  "streams": [
    {
      "id": "stream_id",
      "title": "Live Stream",
      "category": "Gaming",
      "viewers": 150,
      "quality": "1080p",
      "startTime": 1640995200000
    }
  ]
}
```

#### POST /streams
Create a new stream
```json
{
  "title": "My Stream",
  "category": "Gaming",
  "quality": "1080p",
  "bitrate": 5000
}
```

#### DELETE /streams/:id
Stop a stream

### Analytics

#### GET /analytics/:streamId
Get analytics for a specific stream
```json
{
  "streamId": "stream_id",
  "peakViewers": 200,
  "totalMessages": 1500,
  "averageViewers": 125,
  "viewTime": [
    {
      "timestamp": 1640995200000,
      "viewers": 150,
      "quality": "1080p"
    }
  ]
}
```

#### GET /analytics/summary
Get overall analytics summary
```json
{
  "totalStreams": 50,
  "totalViewTime": 150000,
  "averageViewers": 75,
  "topCategories": ["Gaming", "Music", "Talk"]
}
```

### Chat

#### GET /chat-history
Get recent chat messages
```json
{
  "messages": [
    {
      "id": 123456789,
      "user": "StreamFan",
      "message": "Great stream!",
      "timestamp": 1640995200000,
      "filtered": false
    }
  ]
}
```

#### POST /chat/moderate
Moderate chat messages
```json
{
  "messageId": 123456789,
  "action": "delete|warn|ban",
  "reason": "Spam"
}
```

### Multi-Platform

#### GET /platforms
Get supported platforms
```json
{
  "platforms": [
    {
      "name": "YouTube",
      "type": "rtmp",
      "maxBitrate": 8000,
      "maxResolution": "4K"
    },
    {
      "name": "Twitch",
      "type": "rtmp",
      "maxBitrate": 6000,
      "maxResolution": "1080p"
    }
  ]
}
```

#### POST /platforms/connect
Connect to a platform
```json
{
  "platform": "youtube",
  "streamKey": "your_stream_key",
  "quality": "1080p",
  "bitrate": 5000
}
```

#### DELETE /platforms/:platform
Disconnect from a platform

### Settings

#### GET /settings
Get current stream settings
```json
{
  "quality": "1080p",
  "bitrate": 5000,
  "server": "us-west",
  "audioQuality": 192,
  "moderation": {
    "autoMod": true,
    "bannedWords": ["spam", "hate"]
  }
}
```

#### PUT /settings
Update stream settings
```json
{
  "quality": "4K",
  "bitrate": 8000,
  "server": "us-east"
}
```

## WebSocket Events

### Client to Server

#### start-stream
```json
{
  "quality": "1080p",
  "bitrate": 5000,
  "title": "My Stream",
  "category": "Gaming"
}
```

#### stop-stream
```json
{}
```

#### chat-message
```json
{
  "user": "StreamFan",
  "message": "Hello everyone!"
}
```

#### stream-stats
```json
{
  "frames": 1800,
  "drops": 5,
  "bandwidth": 5200
}
```

### Server to Client

#### streamStats
```json
{
  "viewers": 150,
  "bitrate": 5000,
  "fps": 30,
  "duration": 3600
}
```

#### chatMessage
```json
{
  "id": 123456789,
  "user": "StreamFan",
  "message": "Hello everyone!",
  "timestamp": 1640995200000,
  "filtered": false
}
```

#### viewer-count
```json
{
  "count": 150
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters",
  "details": "Quality must be one of: 480p, 720p, 1080p, 4K"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "details": "Please provide valid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "details": "Stream with ID 'stream_id' does not exist"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "details": "Maximum 10 requests per minute allowed"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred"
}
```

## Rate Limits

- Chat messages: 10 per minute per user
- API requests: 100 per minute per IP
- WebSocket connections: 5 per IP

## Quality Settings

### Video Qualities
- **4K**: 3840x2160, 12 Mbps, 30 FPS
- **1080p**: 1920x1080, 5 Mbps, 30 FPS
- **720p**: 1280x720, 2.5 Mbps, 30 FPS
- **480p**: 854x480, 1 Mbps, 30 FPS

### Audio Qualities
- **320 kbps**: High quality
- **192 kbps**: Standard quality
- **128 kbps**: Low quality

## Platform-Specific Settings

### YouTube
- Max bitrate: 8 Mbps
- Max resolution: 4K
- RTMP URL: `rtmp://a.rtmp.youtube.com/live2/`

### Twitch
- Max bitrate: 6 Mbps
- Max resolution: 1080p
- RTMP URL: `rtmp://live.twitch.tv/live/`

### Facebook
- Max bitrate: 4 Mbps
- Max resolution: 1080p
- Uses Facebook Live API

## Examples

### Starting a Stream
```javascript
const socket = io('http://localhost:3005');

socket.emit('start-stream', {
  quality: '1080p',
  bitrate: 5000,
  title: 'My Gaming Stream',
  category: 'Gaming'
});

socket.on('stream-started', (data) => {
  console.log('Stream started:', data);
});
```

### Sending Chat Messages
```javascript
socket.emit('chat-message', {
  user: 'StreamFan',
  message: 'Great stream!'
});

socket.on('chatMessage', (message) => {
  console.log('New message:', message);
});
```

### Getting Analytics
```javascript
fetch('/api/analytics/stream_id')
  .then(response => response.json())
  .then(data => {
    console.log('Analytics:', data);
  });
```

## Support

For technical support or questions about the API, please contact:
- Email: support@hootner.com
- Documentation: https://docs.hootner.com
- GitHub: https://github.com/hootner/streaming-api