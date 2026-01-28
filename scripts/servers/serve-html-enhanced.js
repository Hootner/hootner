#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

// Serve static files from hexarchy UI pages
app.use(express.static(path.join(__dirname, 'hexarchy/4-interface/ui')));

// Routes for your HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/dashboard.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/dashboard.html'));
});

app.get('/video-player', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/video-player.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/profile.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/settings.html'));
});

app.get('/marketplace', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/marketplace.html'));
});

app.get('/code-editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/code-editor.html'));
});

app.get('/auto-editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/auto-editor.html'));
});

app.get('/ultra-editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/ultra-editor.html'));
});

app.get('/design-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/design-showcase.html'));
});

app.get('/ai-video', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/ai-video.html'));
});

app.get('/live-stream', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/live-stream.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/analytics.html'));
});

app.get('/collaboration', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/collaboration.html'));
});

app.get('/agent-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/agent-management.html'));
});

app.get('/devops-monitoring', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/devops-monitoring.html'));
});

app.get('/feed-react', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/feed-react.html'));
});

// API endpoints for video player
app.get('/api/videos', (req, res) => {
  const videos = [
    {
      id: 1,
      title: 'HOOTNER Demo Video',
      duration: '2:30',
      src: '/videos/demo.mp4',
      poster: '/images/demo-thumb.jpg'
    }
  ];
  res.json(videos);
});

// API endpoints for dashboard data
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    posts: 127,
    users: 1234,
    engagement: 89,
    revenue: 12400,
    apiCalls: 8200,
    errorRate: 0.3,
    timestamp: new Date().toISOString()
  });
});

// API endpoints for agent management
app.get('/api/agents/status', (req, res) => {
  res.json({
    totalAgents: 75,
    activeAgents: 74,
    categories: {
      core: { total: 12, active: 12 },
      business: { total: 15, active: 15 },
      security: { total: 18, active: 17 },
      infrastructure: { total: 20, active: 20 },
      service: { total: 10, active: 10 }
    },
    systemResources: {
      cpu: Math.floor(Math.random() * 30) + 30,
      memory: Math.floor(Math.random() * 40) + 40,
      gpu: Math.floor(Math.random() * 50) + 50
    }
  });
});

// API endpoints for DevOps monitoring
app.get('/api/devops/metrics', (req, res) => {
  res.json({
    uptime: 99.97,
    responseTime: Math.floor(Math.random() * 50) + 100,
    throughput: (Math.random() * 2 + 1.5).toFixed(1) + 'K/s',
    errorRate: (Math.random() * 0.1).toFixed(3),
    activePods: Math.floor(Math.random() * 10) + 45,
    containers: [
      { name: 'hootner-frontend', status: 'running', cpu: 15, memory: 45 },
      { name: 'hootner-api', status: 'running', cpu: 32, memory: 67 },
      { name: 'mongodb-primary', status: 'running', cpu: 28, memory: 78 },
      { name: 'redis-cache', status: 'warning', cpu: 85, memory: 89 }
    ]
  });
});

// API endpoints for collaboration
app.get('/api/collaboration/rooms', (req, res) => {
  res.json({
    activeRooms: Math.floor(Math.random() * 5) + 2,
    totalParticipants: Math.floor(Math.random() * 20) + 10,
    onlineUsers: Math.floor(Math.random() * 15) + 5
  });
});

// Enhanced WebSocket for real-time updates
const server = createServer(app);

// SECURITY: Configure CORS based on environment
const corsOrigin = process.env.NODE_ENV === 'production' 
  ? (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
  : '*';

if (corsOrigin === '*') {
  console.warn('⚠️  WARNING: CORS is set to allow all origins. This is only safe for local development.');
}

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send enhanced real-time metrics
  const metricsInterval = setInterval(() => {
    const metrics = {
      posts: Math.floor(Math.random() * 50) + 100,
      users: Math.floor(Math.random() * 500) + 1000,
      engagement: Math.floor(Math.random() * 20) + 80,
      revenue: Math.floor(Math.random() * 5000) + 10000,
      apiCalls: Math.floor(Math.random() * 1000) + 7500,
      errorRate: Math.random() * 0.5 + 0.1
    };
    
    const traffic = {
      requests: Math.floor(Math.random() * 100) + 300,
      sessions: Math.floor(Math.random() * 200) + 1100,
      responseTime: Math.floor(Math.random() * 50) + 120
    };
    
    socket.emit('metrics', metrics);
    socket.emit('traffic', traffic);
    
    // Advanced analytics data
    const analytics = {
      performanceScore: Math.floor(Math.random() * 20) + 80,
      predictions: {
        'Traffic Growth': `+${Math.floor(Math.random() * 30)}%`,
        'Revenue Forecast': `$${(Math.random() * 10 + 10).toFixed(1)}K`,
        'User Retention': `${(Math.random() * 10 + 85).toFixed(1)}%`
      }
    };
    
    socket.emit('analytics', analytics);
    socket.emit('predictions', analytics.predictions);
    
    // Live streaming data
    if (Math.random() > 0.8) {
      const streamData = {
        viewers: Math.floor(Math.random() * 200) + 50,
        bitrate: Math.floor(Math.random() * 2000) + 3000,
        fps: Math.floor(Math.random() * 10) + 55
      };
      socket.emit('streamStats', streamData);
    }
    
    // Random security alerts
    if (Math.random() > 0.9) {
      const alerts = [
        { severity: 'HIGH', message: 'Unusual login pattern detected', details: 'IP: 45.123.67.89' },
        { severity: 'MEDIUM', message: 'Rate limit exceeded', details: 'API Key: prod_***1a2b' },
        { severity: 'LOW', message: 'New device registered', details: 'Location: New York' }
      ];
      const alert = alerts[Math.floor(Math.random() * alerts.length)];
      socket.emit('security', alert);
    }
    
    // Agent management data
    const agentData = {
      totalAgents: 75,
      activeAgents: Math.floor(Math.random() * 3) + 72,
      systemLoad: {
        cpu: Math.floor(Math.random() * 30) + 30,
        memory: Math.floor(Math.random() * 40) + 40,
        gpu: Math.floor(Math.random() * 50) + 50
      }
    };
    socket.emit('agentMetrics', agentData);
    
    // DevOps monitoring data
    const devopsData = {
      responseTime: Math.floor(Math.random() * 50) + 100,
      throughput: (Math.random() * 2 + 1.5).toFixed(1),
      errorRate: (Math.random() * 0.1).toFixed(3),
      activePods: Math.floor(Math.random() * 10) + 45
    };
    socket.emit('devopsMetrics', devopsData);
  }, 5000);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(metricsInterval);
  });
});

server.listen(PORT, () => {
  console.log(`🦉 HOOTNER Enhanced Platform running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🎬 Video Player: http://localhost:${PORT}/video-player`);
  console.log(`💻 Code Editor: http://localhost:${PORT}/code-editor`);
  console.log(`🛒 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`🤝 Collaboration: http://localhost:${PORT}/collaboration`);
  console.log(`🤖 AI Agents: http://localhost:${PORT}/agent-management`);
  console.log(`⚡ DevOps: http://localhost:${PORT}/devops-monitoring`);
  console.log(`📈 Analytics: http://localhost:${PORT}/analytics`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log(`👤 Profile: http://localhost:${PORT}/profile`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
});