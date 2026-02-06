// SQS Producer (Job Queue)
import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { logger } from '../../0-core/logging/logger.js';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class SQSProducer {
  // Send single message
  static async sendMessage(queueUrl, messageBody, messageAttributes = {}) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(messageBody),
        MessageAttributes: messageAttributes
      });

      const response = await sqsClient.send(command);
      logger.info('Message sent to SQS', { queueUrl, messageId: response.MessageId });
      return response;
    } catch (error) {
      logger.error('SQS send failed:', error);
      throw error;
    }
  }

  // Send batch messages
  static async sendBatch(queueUrl, messages) {
    try {
      const entries = messages.map((msg, index) => ({
        Id: `msg-${index}`,
        MessageBody: JSON.stringify(msg)
      }));

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries
      });

      const response = await sqsClient.send(command);
      logger.info('Batch messages sent to SQS', {
        queueUrl,
        successful: response.Successful?.length || 0,
        failed: response.Failed?.length || 0
      });
      return response;
    } catch (error) {
      logger.error('SQS batch send failed:', error);
      throw error;
    }
  }

  // Queue video processing job
  static async queueVideoProcessing(videoId, userId, inputPath, outputPath) {
    return await this.sendMessage(
      process.env.VIDEO_PROCESSING_QUEUE_URL,
      {
        type: 'VIDEO_PROCESSING',
        videoId,
        userId,
        inputPath,
        outputPath,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Queue email
  static async queueEmail(to, subject, body, html) {
    return await this.sendMessage(
      process.env.EMAIL_QUEUE_URL,
      {
        type: 'EMAIL',
        to,
        subject,
        body,
        html,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Queue notification
  static async queueNotification(userId, notification) {
    return await this.sendMessage(
      process.env.NOTIFICATION_QUEUE_URL,
      {
        type: 'NOTIFICATION',
        userId,
        notification,
        timestamp: new Date().toISOString()
      }
    );
  }
}

export default SQSProducer;
