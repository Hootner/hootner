// SQS Consumer (Background Job Processor)
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../0-core/logging/logger.js';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class SQSConsumer {
  constructor(queueUrl, handler) {
    this.queueUrl = queueUrl;
    this.handler = handler;
    this.isRunning = false;
  }

  // Start consuming messages
  async start() {
    this.isRunning = true;
    logger.info('SQS consumer started', { queueUrl: this.queueUrl });

    while (this.isRunning) {
      try {
        const messages = await this.receiveMessages();

        for (const message of messages) {
          await this.processMessage(message);
        }

        // Prevent tight loop
        if (messages.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('SQS consumer error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // Stop consuming
  stop() {
    this.isRunning = false;
    logger.info('SQS consumer stopped', { queueUrl: this.queueUrl });
  }

  // Receive messages
  async receiveMessages() {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      MessageAttributeNames: ['All']
    });

    const response = await sqsClient.send(command);
    return response.Messages || [];
  }

  // Process single message
  async processMessage(message) {
    try {
      const body = JSON.parse(message.Body);
      await this.handler(body);

      // Delete message after successful processing
      await this.deleteMessage(message.ReceiptHandle);
      logger.info('Message processed', { messageId: message.MessageId });
    } catch (error) {
      logger.error('Message processing failed:', error, { messageId: message.MessageId });
    }
  }

  // Delete message
  async deleteMessage(receiptHandle) {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    });

    await sqsClient.send(command);
  }
}

// Video processing consumer
export const videoProcessingConsumer = new SQSConsumer(
  process.env.VIDEO_PROCESSING_QUEUE_URL,
  async (job) => {
    logger.info('Processing video job', { job });
    // Process video encoding/transcoding
  }
);

// Email consumer
export const emailConsumer = new SQSConsumer(
  process.env.EMAIL_QUEUE_URL,
  async (job) => {
    logger.info('Processing email job', { job });
    // Send email via EmailClient
  }
);

// Notification consumer
export const notificationConsumer = new SQSConsumer(
  process.env.NOTIFICATION_QUEUE_URL,
  async (job) => {
    logger.info('Processing notification job', { job });
    // Send push notification
  }
);
