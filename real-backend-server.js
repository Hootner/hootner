#!/usr/bin/env node

/**
 * Real Backend Server - DynamoDB-backed
 * Publishes real events on writes; supports DynamoDB Local via DYNAMO_ENDPOINT
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DYNAMO_TABLE || 'HootnerActivities';
const DYNAMO_ENDPOINT = process.env.DYNAMO_ENDPOINT; // Optional: http://localhost:8000 for DynamoDB Local

const dynamoClient = new DynamoDBClient({
  region: REGION,
  endpoint: DYNAMO_ENDPOINT || undefined
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true }
});

const pubsub = new PubSub();
const app = express();
app.use(cors());
app.use(express.json());

let dbConnected = false;

async function ensureTable() {
  try {
    await docClient.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    dbConnected = true;
    console.log(`✅ DynamoDB table ready: ${TABLE_NAME}`);
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`ℹ️ Table ${TABLE_NAME} not found. Creating with on-demand billing...`);
      await docClient.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'PK', AttributeType: 'S' },
          { AttributeName: 'SK', AttributeType: 'S' }
        ]
      }));
      dbConnected = true;
      console.log(`✅ Table ${TABLE_NAME} created`);
    } else {
      dbConnected = false;
      console.error('❌ DynamoDB unavailable:', error.message);
    }
  }
}

async function putEntity(item) {
  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));
}

async function getRecentActivities(limit = 30) {
  if (!dbConnected) return [];
  const result = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    Limit: 200
  }));
  const items = result.Items || [];
  return items
    .filter(i => i.entityType)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(i => ({
      type: i.entityType,
      message: i.message || '',
      timestamp: i.createdAt,
      data: i.data || {}
    }));
}

function publishActivity(activity) {
  const payload = {
    type: activity.type,
    message: activity.message,
    timestamp: activity.timestamp || new Date().toISOString(),
    data: activity.data || {}
  };
  console.log('📨 Real activity:', payload.type, '-', payload.message);
  pubsub.publish('ACTIVITY_STREAM', { activityStream: payload });
}

function buildUserItem({ userId, email, name, createdAt }) {
  return {
    PK: `USER#${userId}`,
    SK: 'PROFILE',
    entityType: 'NEW_USER',
    userId,
    email,
    name,
    createdAt,
    message: `New user registered: ${name}`
  };
}

function buildVideoItem({ videoId, userId, title, url, createdAt }) {
  return {
    PK: `VIDEO#${videoId}`,
    SK: 'META',
    entityType: 'VIDEO_UPLOADED',
    videoId,
    userId,
    title,
    url,
    status: 'processing',
    createdAt,
    message: `User uploaded video: "${title}"`
  };
}

function buildPaymentItem({ paymentId, userId, amount, createdAt }) {
  return {
    PK: `PAYMENT#${paymentId}`,
    SK: 'RECORD',
    entityType: 'PAYMENT_PROCESSED',
    paymentId,
    userId,
    amount,
    status: 'completed',
    createdAt,
    message: `Payment processed: $${amount.toFixed(2)}`
  };
}

app.post('/api/users', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'DynamoDB not connected' });
    }

    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'email and name are required' });
    }

    const timestamp = new Date().toISOString();
    const userId = uuidv4();
    const item = buildUserItem({ userId, email, name, createdAt: timestamp });
    await putEntity(item);
    publishActivity({ type: item.entityType, message: item.message, timestamp, data: { userId, email } });

    res.json({ success: true, user: { userId, email, name, createdAt: timestamp } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'DynamoDB not connected' });
    }

    const { title, userId, url } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ error: 'title and userId are required' });
    }

    const timestamp = new Date().toISOString();
    const videoId = uuidv4();
    const item = buildVideoItem({ videoId, userId, title, url: url || 'pending', createdAt: timestamp });
    await putEntity(item);
    publishActivity({ type: item.entityType, message: item.message, timestamp, data: { videoId, userId } });

    res.json({ success: true, video: { videoId, userId, title, url: url || 'pending', status: 'processing', createdAt: timestamp } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    if (!dbConnected) {
      return res.status(503).json({ error: 'DynamoDB not connected' });
    }

    const { userId, amount } = req.body;
    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({ error: 'userId and numeric amount are required' });
    }

    const timestamp = new Date().toISOString();
    const paymentId = uuidv4();
    const item = buildPaymentItem({ paymentId, userId, amount, createdAt: timestamp });
    await putEntity(item);
    publishActivity({ type: item.entityType, message: item.message, timestamp, data: { paymentId, userId, amount } });

    res.json({ success: true, payment: { paymentId, userId, amount, status: 'completed', createdAt: timestamp } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: dbConnected ? 'connected' : 'disconnected',
    table: TABLE_NAME,
    region: REGION,
    mode: dbConnected ? 'REAL DATA (DynamoDB)' : 'INACTIVE',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/activities/recent', async (req, res) => {
  try {
    const activities = await getRecentActivities();
    res.json({ activities, mode: dbConnected ? 'dynamodb' : 'offline', count: activities.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const wss = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

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

async function start() {
  console.log('\n====================================================');
  console.log('🚀 Real Backend Server - Starting (DynamoDB)');
  console.log('====================================================\n');

  await ensureTable();

  httpServer.listen(PORT, () => {
    console.log('\n====================================================');
    console.log('✅ Real Backend Server Started');
    console.log('====================================================\n');
    console.log('🌐 HTTP:', `http://localhost:${PORT}`);
    console.log('🔌 WebSocket:', `ws://localhost:${PORT}/graphql`);
    console.log('📊 Health:', `http://localhost:${PORT}/health`);
    console.log('📈 Recent:', `http://localhost:${PORT}/api/activities/recent`);
    console.log(`\n💾 DynamoDB: ${dbConnected ? '✅ Connected' : '❌ Unavailable'} (table: ${TABLE_NAME}, region: ${REGION})`);
    if (DYNAMO_ENDPOINT) {
      console.log(`🔗 Endpoint override: ${DYNAMO_ENDPOINT}`);
    }

    if (dbConnected) {
      console.log('\n📡 API Endpoints:');
      console.log('   POST /api/users - Create user (triggers real event)');
      console.log('   POST /api/videos - Upload video (triggers real event)');
      console.log('   POST /api/payments - Process payment (triggers real event)');
      console.log('\n🔍 Events publish immediately after writes');
    } else {
      console.log('\n⚠️  DynamoDB not available');
      console.log('   Set AWS credentials + AWS_REGION, or set DYNAMO_ENDPOINT for DynamoDB Local');
      console.log('   Example (local): DYNAMO_ENDPOINT=http://localhost:8000 npm start');
    }

    console.log('\n📱 Frontend: http://localhost:3005/live-activity.html');
    console.log('====================================================\n');
  });
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  httpServer.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

start().catch(console.error);
