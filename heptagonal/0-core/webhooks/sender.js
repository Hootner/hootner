// Webhook System
import axios from 'axios';
import { docClient } from '../database/dynamodb/config.js';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { sign } from '../utils/crypto.js';
import { logger } from '../logging/logger.js';
import { addJob } from '../jobs/queue.js';

const WEBHOOKS_TABLE = process.env.WEBHOOKS_TABLE || 'Webhooks';

export const WEBHOOK_EVENTS = {
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_PROCESSED: 'video.processed',
  PAYMENT_SUCCESS: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  USER_CREATED: 'user.created',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled'
};

// Register webhook
export const registerWebhook = async ({ userId, url, events, secret }) => {
  const webhook = {
    id: `webhook-${Date.now()}`,
    userId,
    url,
    events,
    secret: secret || generateToken(32),
    isActive: true,
    createdAt: new Date().toISOString(),
    deliveryAttempts: 0,
    lastDelivery: null
  };

  await docClient.send(new PutCommand({
    TableName: WEBHOOKS_TABLE,
    Item: webhook
  }));

  return webhook;
};

// Send webhook
export const sendWebhook = async (event, payload) => {
  try {
    // Find subscribed webhooks
    const result = await docClient.send(new QueryCommand({
      TableName: WEBHOOKS_TABLE,
      IndexName: 'EventsIndex',
      KeyConditionExpression: 'event = :event',
      ExpressionAttributeValues: { ':event': event }
    }));

    const webhooks = result.Items?.filter(w => w.isActive) || [];

    // Send to each webhook (in background)
    for (const webhook of webhooks) {
      await addJob('emailNotifications', 'send-webhook', {
        webhookId: webhook.id,
        url: webhook.url,
        event,
        payload,
        secret: webhook.secret
      });
    }

    logger.info(`Webhooks triggered for event: ${event}`, { count: webhooks.length });
  } catch (error) {
    logger.error('Webhook dispatch failed:', error);
  }
};

// Deliver webhook (called by job processor)
export const deliverWebhook = async ({ url, event, payload, secret, webhookId }) => {
  const timestamp = Date.now();
  const signature = sign(`${timestamp}.${JSON.stringify(payload)}`, secret);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp
      },
      timeout: 10000
    });

    // Update delivery stats
    await docClient.send(new UpdateCommand({
      TableName: WEBHOOKS_TABLE,
      Key: { id: webhookId },
      UpdateExpression: 'SET lastDelivery = :now, deliveryAttempts = deliveryAttempts + :inc',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString(),
        ':inc': 1
      }
    }));

    logger.info('Webhook delivered', { webhookId, status: response.status });
    return { success: true };
  } catch (error) {
    logger.error('Webhook delivery failed', { webhookId, error: error.message });
    throw error; // Will trigger retry
  }
};

// Verify webhook signature (for incoming webhooks from third parties)
export const verifyWebhookSignature = (payload, signature, secret) => {
  const [timestamp, sig] = signature.split('.');
  const expected = sign(`${timestamp}.${JSON.stringify(payload)}`, secret);
  return sig === expected;
};

export default {
  WEBHOOK_EVENTS,
  registerWebhook,
  sendWebhook,
  deliverWebhook,
  verifyWebhookSignature
};
