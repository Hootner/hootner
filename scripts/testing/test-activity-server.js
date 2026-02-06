#!/usr/bin/env node

/**
 * Test Activity Stream Server
 * Simplified GraphQL server to test the live activity real-time streaming
 */

import { createServer } from 'http';
import { PubSub } from 'graphql-subscriptions';
import { WebSocketServer } from 'ws';
import ActivityPublisher from './api/graphql/utils/activityPublisher.js';
import ActivityStreamGenerator from './api/graphql/utils/activityStreamGenerator.js';

const PORT = 4000;
const pubsub = new PubSub();

// Create HTTP server
const server = createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.url === '/graphql' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>GraphQL Test Server</h1><p>WebSocket endpoint ready at ws://localhost:4000/graphql</p>');
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/graphql' });

wss.on('connection', (ws) => {
  console.log('✅ New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 Received:', data.type);

      if (data.type === 'connection_init') {
        ws.send(JSON.stringify({ type: 'connection_ack' }));
      } else if (data.type === 'start' || data.type === 'subscribe') {
        // Subscribe to activity stream
        const subscriptionId = data.id || '1';
        
        // Set up listener for activity events
        const subscription = pubsub.asyncIterator(['ACTIVITY_STREAM']);
        
        (async () => {
          for await (const payload of subscription) {
            if (ws.readyState === ws.OPEN) {
              ws.send(JSON.stringify({
                id: subscriptionId,
                type: 'data',
                payload: {
                  data: {
                    activityStream: payload.activityStream
                  }
                }
              }));
            }
          }
        })();

        console.log(`✅ Client subscribed to activity stream (ID: ${subscriptionId})`);
      }
    } catch (err) {
      console.error('❌ WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket error:', err);
  });
});

// Override pubsub publish to broadcast via our pubsub
ActivityPublisher.publishActivity = async function(activity) {
  const enrichedActivity = {
    id: activity.id || `activity_${Date.now()}`,
    type: activity.type || 'SYSTEM_ALERT',
    message: activity.message || 'System event',
    description: activity.description || '',
    category: activity.category || 'general',
    service: activity.service || 'system',
    timestamp: activity.timestamp || new Date().toISOString(),
    userId: activity.userId || null,
    metadata: activity.metadata || null
  };

  try {
    await pubsub.publish('ACTIVITY_STREAM', {
      activityStream: enrichedActivity
    });
    console.log(`📨 Activity published: ${enrichedActivity.type} - ${enrichedActivity.message}`);
  } catch (error) {
    console.error('❌ Failed to publish activity:', error);
  }
};

// Start server
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Test Activity Stream Server Started');
  console.log('='.repeat(70));
  console.log(`\n🌐 HTTP: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/graphql`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log('\n🎬 Initializing real-time activity stream...');
  
  // Start activity generator
  ActivityStreamGenerator.startGenerator(3000);
  
  console.log('✅ Activity generator ready!');
  console.log('\n📱 Open http://localhost:3005/live-activity to see real-time events\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  ActivityStreamGenerator.stopGenerator();
  wss.close();
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
