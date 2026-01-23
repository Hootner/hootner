#!/usr/bin/env node

/**
 * Real Backend Server - Connects to MongoDB for Real Data
 * Replaces test server with actual database integration
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import cors from 'cors';

// MongoDB Models
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const VideoSchema = new mongoose.Schema({
  title: String,
  userId: String,
  url: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const PaymentSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const DeploymentSchema = new mongoose.Schema({
  version: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const SecurityScanSchema = new mongoose.Schema({
  issuesFound: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Video = mongoose.model('Video', VideoSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Deployment = mongoose.model('Deployment', DeploymentSchema);
const SecurityScan = mongoose.model('SecurityScan', SecurityScanSchema);

// Initialize PubSub
const pubsub = new PubSub();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hootner';
let dbConnected = false;

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    dbConnected = true;
    console.log('✅ MongoDB connected:', MONGODB_URI);
    
    // Start monitoring for real changes
    startRealEventMonitoring();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Falling back to in-memory mode (no persistence)');
    dbConnected = false;
  }
}

// Real-time event monitoring from MongoDB
function startRealEventMonitoring() {
  console.log('🔍 Monitoring database for real-time changes...');
  
  // Watch for new users
  const userChangeStream = User.watch();
  userChangeStream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      const user = await User.findById(change.fullDocument._id);
      publishActivity({
        type: 'NEW_USER',
        message: `New user registered: ${user.name}`,
        timestamp: new Date().toISOString(),
        data: { userId: user._id, email: user.email }
      });
    }
  });
  
  // Watch for new videos
  const videoChangeStream = Video.watch();
  videoChangeStream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      const video = await Video.findById(change.fullDocument._id);
      publishActivity({
        type: 'VIDEO_UPLOADED',
        message: `User uploaded video: "${video.title}"`,
        timestamp: new Date().toISOString(),
        data: { videoId: video._id, title: video.title }
      });
    }
  });
  
  // Watch for new payments
  const paymentChangeStream = Payment.watch();
  paymentChangeStream.on('change', async (change) => {
    if (change.operationType === 'insert') {
      const payment = await Payment.findById(change.fullDocument._id);
      publishActivity({
        type: 'PAYMENT_PROCESSED',
        message: `Payment processed: $${payment.amount.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        data: { paymentId: payment._id, amount: payment.amount }
      });
    }
  });
  
  console.log('✅ Real-time monitoring active for Users, Videos, Payments');
}

// Publish activity to subscribers
function publishActivity(activity) {
  console.log('📨 Real activity:', activity.type, '-', activity.message);
  pubsub.publish('ACTIVITY_STREAM', { activityStream: activity });
}

// REST Endpoints for data creation
app.post('/api/users', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const user = new User({
      email: req.body.email,
      name: req.body.name
    });
    await user.save();
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const video = new Video({
      title: req.body.title,
      userId: req.body.userId,
      url: req.body.url || 'pending',
      status: 'processing'
    });
    await video.save();
    
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const payment = new Payment({
      userId: req.body.userId,
      amount: req.body.amount,
      status: 'completed'
    });
    await payment.save();
    
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: dbConnected ? 'connected' : 'disconnected',
    mode: dbConnected ? 'REAL DATA' : 'IN-MEMORY',
    timestamp: new Date().toISOString()
  });
});

// Get recent activities
app.get('/api/activities/recent', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.json({ activities: [], mode: 'in-memory' });
    }
    
    const [users, videos, payments] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5),
      Video.find().sort({ createdAt: -1 }).limit(5),
      Payment.find().sort({ createdAt: -1 }).limit(5)
    ]);
    
    const activities = [
      ...users.map(u => ({ type: 'NEW_USER', data: u, timestamp: u.createdAt })),
      ...videos.map(v => ({ type: 'VIDEO_UPLOADED', data: v, timestamp: v.createdAt })),
      ...payments.map(p => ({ type: 'PAYMENT_PROCESSED', data: p, timestamp: p.createdAt }))
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    res.json({ activities, mode: 'real-data', count: activities.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create HTTP server
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Create WebSocket server
const wss = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  let subscriptionIterator;
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'connection_init') {
        ws.send(JSON.stringify({ type: 'connection_ack' }));
        console.log('✅ WebSocket connection acknowledged');
      }
      
      if (message.type === 'start' || message.type === 'subscribe') {
        console.log('📡 Starting activity stream subscription');
        
        subscriptionIterator = pubsub.asyncIterator('ACTIVITY_STREAM');
        
        (async () => {
          for await (const event of subscriptionIterator) {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                type: 'data',
                id: message.id || '1',
                payload: { data: event }
              }));
            }
          }
        })();
        
        ws.send(JSON.stringify({
          type: 'complete',
          id: message.id || '1'
        }));
      }
      
      if (message.type === 'stop') {
        if (subscriptionIterator && subscriptionIterator.return) {
          await subscriptionIterator.return();
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    if (subscriptionIterator && subscriptionIterator.return) {
      subscriptionIterator.return();
    }
  });
});

// Start server
async function start() {
  console.log('\n====================================================');
  console.log('🚀 Real Backend Server - Starting...');
  console.log('====================================================\n');
  
  // Try to connect to database
  await connectDatabase();
  
  httpServer.listen(PORT, () => {
    console.log('\n====================================================');
    console.log('✅ Real Backend Server Started');
    console.log('====================================================\n');
    console.log('🌐 HTTP:', `http://localhost:${PORT}`);
    console.log('🔌 WebSocket:', `ws://localhost:${PORT}/graphql`);
    console.log('📊 Health:', `http://localhost:${PORT}/health`);
    console.log('📈 Recent:', `http://localhost:${PORT}/api/activities/recent`);
    console.log('\n💾 Database:', dbConnected ? '✅ MongoDB CONNECTED' : '❌ Disconnected (in-memory mode)');
    console.log('🔄 Mode:', dbConnected ? '📊 REAL DATA FROM DATABASE' : '⚠️  IN-MEMORY (no persistence)');
    
    if (dbConnected) {
      console.log('\n📡 API Endpoints:');
      console.log('   POST /api/users - Create user (triggers real event)');
      console.log('   POST /api/videos - Upload video (triggers real event)');
      console.log('   POST /api/payments - Process payment (triggers real event)');
      console.log('\n🔍 Monitoring: Real-time change streams active');
      console.log('✨ Events will publish automatically when data changes');
    } else {
      console.log('\n⚠️  Database not available');
      console.log('💡 To connect real data:');
      console.log('   1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('   2. Start MongoDB: mongod --dbpath /data/db');
      console.log('   3. Restart this server');
      console.log('\n📝 Or use MongoDB Atlas (cloud):');
      console.log('   Set MONGODB_URI environment variable');
    }
    
    console.log('\n📱 Frontend: http://localhost:3005/live-activity.html');
    console.log('====================================================\n');
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (dbConnected) {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
  httpServer.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

start().catch(console.error);
