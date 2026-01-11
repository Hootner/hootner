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

// Enhanced WebSocket for real-time updates
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
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
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log(`👤 Profile: http://localhost:${PORT}/profile`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
});