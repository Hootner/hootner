const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const { limiter, validateInput, sanitizeHtml } = require('./security');

const ANALYTICS_DIR = path.join(__dirname, 'analytics');

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\'', '\'unsafe-inline\'', 'cdn.tailwindcss.com', 'cdn.socket.io', 'webrtc.github.io'],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'cdn.tailwindcss.com']
    }
  }
}));
app.use(limiter);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Mobile detection and redirect
app.get('/', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const hasTouchSupport = typeof globalThis !== 'undefined'
    && typeof globalThis.document !== 'undefined'
    && 'ontouchend' in globalThis.document;
  const isTablet = /iPad|Android(?=.*\bMobile\b)|Tablet|PlayBook|Silk/i.test(userAgent)
    || (userAgent.includes('Macintosh') && hasTouchSupport);

  if (isMobile || isTablet) {
    res.redirect('/mobile-stream.html');
  } else {
    res.redirect('/live-stream.html');
  }
});
app.use('/api', express.Router());

const streamers = new Map();
const analytics = new Map();
const chatHistory = [];
const bannedWords = ['spam', 'hate', 'toxic', 'abuse'];
const rateLimits = new Map();

// Enhanced WebRTC signaling and streaming logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Initialize rate limiting
  rateLimits.set(socket.id, { messages: 0, lastReset: Date.now() });

  socket.on('start-stream', (data) => {
    const streamData = {
      quality: data.quality || '1080p',
      bitrate: data.bitrate || 5000,
      viewers: 0,
      startTime: Date.now(),
      title: data.title || 'Live Stream',
      category: data.category || 'General',
      isRecording: false,
      stats: { frames: 0, drops: 0, bandwidth: 0 }
    };

    streamers.set(socket.id, streamData);
    analytics.set(socket.id, { viewTime: [], peakViewers: 0, totalMessages: 0 });

    socket.broadcast.emit('streamer-online', {
      streamerId: socket.id,
      title: streamData.title,
      category: streamData.category
    });

    console.log(`Stream started: ${socket.id} - ${streamData.title}`);

    // Start analytics collection
    startStreamAnalytics(socket.id);
  });

  socket.on('stop-stream', () => {
    const streamer = streamers.get(socket.id);
    if (streamer) {
      const duration = Date.now() - streamer.startTime;
      console.log(`Stream ended: ${socket.id} - Duration: ${Math.round(duration/1000)}s`);

      // Save analytics
      saveStreamAnalytics(socket.id, duration);
    }

    streamers.delete(socket.id);
    analytics.delete(socket.id);
    socket.broadcast.emit('streamer-offline', { streamerId: socket.id });
  });

  socket.on('join-stream', (streamerId) => {
    socket.join(streamerId);
    const streamer = streamers.get(streamerId);
    if (streamer) {
      streamer.viewers++;
      const analyticsData = analytics.get(streamerId);
      if (analyticsData && streamer.viewers > analyticsData.peakViewers) {
        analyticsData.peakViewers = streamer.viewers;
      }

      io.to(streamerId).emit('viewer-count', streamer.viewers);
      socket.emit('stream-info', {
        title: streamer.title,
        category: streamer.category,
        startTime: streamer.startTime
      });
    }
  });

  socket.on('leave-stream', (streamerId) => {
    socket.leave(streamerId);
    const streamer = streamers.get(streamerId);
    if (streamer && streamer.viewers > 0) {
      streamer.viewers--;
      io.to(streamerId).emit('viewer-count', streamer.viewers);
    }
  });

  // Enhanced WebRTC signaling
  socket.on('offer', (data) => {
    socket.to(data.to).emit('offer', {
      from: socket.id,
      offer: data.offer,
      timestamp: Date.now()
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer,
      timestamp: Date.now()
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
      timestamp: Date.now()
    });
  });

  // Enhanced chat with moderation
  socket.on('chat-message', (data) => {
    if (!rateLimitCheck(socket.id)) {
      socket.emit('rate-limited', { message: 'Too many messages. Please slow down.' });
      return;
    }

    // Validate and sanitize input
    if (!validateInput(data.user, 'username') || !validateInput(data.message, 'message')) {
      socket.emit('invalid-input', { message: 'Invalid input detected' });
      return;
    }

    let message = sanitizeHtml(data.message);
    const user = sanitizeHtml(data.user || 'Anonymous');

    // Auto-moderation
    if (containsBannedWords(message)) {
      message = '[Message filtered by AutoMod]';
    }

    const chatMessage = {
      id: Date.now() + Math.random(),
      user,
      message,
      timestamp: Date.now(),
      filtered: message.includes('[Message filtered')
    };

    chatHistory.push(chatMessage);
    if (chatHistory.length > 100) chatHistory.shift();

    // Update analytics for every active stream
    analytics.forEach((stats) => {
      if (stats) {
        stats.totalMessages += 1;
      }
    });

    io.emit('chatMessage', chatMessage);
  });

  // Stream quality updates
  socket.on('stream-stats', (data) => {
    const streamer = streamers.get(socket.id);
    if (streamer) {
      streamer.stats = { ...streamer.stats, ...data };
      socket.broadcast.emit('stream-quality-update', {
        streamerId: socket.id,
        stats: streamer.stats
      });
    }
  });

  // Recording controls
  socket.on('start-recording', () => {
    const streamer = streamers.get(socket.id);
    if (streamer) {
      streamer.isRecording = true;
      socket.emit('recording-started');
    }
  });

  socket.on('stop-recording', () => {
    const streamer = streamers.get(socket.id);
    if (streamer) {
      streamer.isRecording = false;
      socket.emit('recording-stopped');
    }
  });

  socket.on('disconnect', () => {
    const streamer = streamers.get(socket.id);
    if (streamer) {
      const duration = Date.now() - streamer.startTime;
      saveStreamAnalytics(socket.id, duration);
    }

    streamers.delete(socket.id);
    analytics.delete(socket.id);
    rateLimits.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// API endpoints
app.get('/api/streams', (req, res) => {
  const activeStreams = Array.from(streamers.entries()).map(([id, data]) => ({
    id,
    title: data.title,
    category: data.category,
    viewers: data.viewers,
    quality: data.quality,
    startTime: data.startTime
  }));
  res.json(activeStreams);
});

app.get('/api/analytics/:streamId', (req, res) => {
  const data = analytics.get(req.params.streamId);
  res.json(data || { error: 'Stream not found' });
});

app.get('/api/chat-history', (req, res) => {
  res.json(chatHistory.slice(-50)); // Last 50 messages
});

// Helper functions
function rateLimitCheck(socketId) {
  const limit = rateLimits.get(socketId);
  if (!limit) return true;

  const now = Date.now();
  if (now - limit.lastReset > 60000) { // Reset every minute
    limit.messages = 0;
    limit.lastReset = now;
  }

  if (limit.messages >= 10) return false; // Max 10 messages per minute
  limit.messages++;
  return true;
}

function containsBannedWords(message) {
  return bannedWords.some(word =>
    message.toLowerCase().includes(word.toLowerCase())
  );
}

function startStreamAnalytics(streamId) {
  const interval = setInterval(() => {
    const streamer = streamers.get(streamId);
    if (!streamer) {
      clearInterval(interval);
      return;
    }

    // Simulate analytics data
    const analyticsData = analytics.get(streamId);
    if (analyticsData) {
      analyticsData.viewTime.push({
        timestamp: Date.now(),
        viewers: streamer.viewers,
        quality: streamer.quality
      });
    }
  }, 30000); // Every 30 seconds
}

function saveStreamAnalytics(streamId, duration) {
  const data = analytics.get(streamId);
  const streamer = streamers.get(streamId);

  if (data && streamer) {
    const analyticsFile = {
      streamId,
      duration,
      peakViewers: data.peakViewers,
      totalMessages: data.totalMessages,
      averageViewers: data.viewTime.reduce((sum, entry) => sum + entry.viewers, 0) / data.viewTime.length || 0,
      endTime: Date.now()
    };

    // Save to file (in production, use a database)
    const filename = `analytics_${streamId}_${Date.now()}.json`;
    fs.writeFileSync(path.join(__dirname, 'analytics', filename), JSON.stringify(analyticsFile, null, 2));
  }
}

// Create analytics directory
if (!fs.existsSync(path.join(__dirname, 'analytics'))) {
  fs.mkdirSync(path.join(__dirname, 'analytics'));
}

const PORT = process.env.PORT || 3005;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enhanced Streaming Server running on port ${PORT}`);
  console.log(`📱 Mobile/Tablet: http://localhost:${PORT}/mobile-stream.html`);
  console.log(`💻 Desktop: http://localhost:${PORT}/live-stream.html`);
  console.log(`🌐 Edge/All Browsers: Auto-detected and redirected`);
  console.log(`📊 Analytics: http://localhost:${PORT}/analytics.html`);
  console.log(`🌐 Multi-Stream: http://localhost:${PORT}/multi-stream.html`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
