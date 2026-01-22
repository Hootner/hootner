#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from hexarchy UI pages
app.use(express.static(path.join(__dirname, 'hexarchy/4-interface/ui')));

// Routes for your HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/login.html'));
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

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/feed-react.html'));
});

app.get('/social', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/feed-react.html'));
});

app.get('/ultra-editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/ultra-editor.html'));
});

app.get('/design-showcase', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/design-showcase.html'));
});

app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/messages.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'hexarchy/4-interface/ui/pages/contact.html'));
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
    timestamp: new Date().toISOString()
  });
});

// WebSocket for real-time updates
import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send real-time metrics
  setInterval(() => {
    socket.emit('metrics', {
      posts: Math.floor(Math.random() * 50) + 100,
      users: Math.floor(Math.random() * 500) + 1000,
      engagement: Math.floor(Math.random() * 20) + 80,
      revenue: Math.floor(Math.random() * 5000) + 10000
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🦉 HOOTNER Platform running on http://localhost:${PORT}`);
  console.log(`🔐 Login: http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🛒 Marketplace: http://localhost:${PORT}/marketplace`);
  console.log(`💬 Messages: http://localhost:${PORT}/messages`);
  console.log(`📧 Contact: http://localhost:${PORT}/contact`);
  console.log(`🎬 Video Player: http://localhost:${PORT}/video-player`);
  console.log(`💻 Code Editor: http://localhost:${PORT}/code-editor`);
  console.log(`🤝 Collaboration: http://localhost:${PORT}/collaboration`);
  console.log(`🤖 AI Agents: http://localhost:${PORT}/agent-management`);
  console.log(`⚙️ DevOps: http://localhost:${PORT}/devops-monitoring`);
});
