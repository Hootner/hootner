// AWS SQS Configuration
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const queueConfig = {
  videoProcessing: process.env.SQS_VIDEO_QUEUE || 'hootner-video-processing',
  notifications: process.env.SQS_NOTIFICATIONS_QUEUE || 'hootner-notifications',
  dlq: process.env.SQS_DLQ || 'hootner-dead-letter-queue'
};

// Send message to queue
export const sendMessage = async (queueUrl, messageBody, attributes = {}) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      MessageAttributes: attributes
    });

    const response = await sqsClient.send(command);
    console.log('✅ Message sent to SQS:', response.MessageId);
    return response;
  } catch (error) {
    console.error('❌ SQS send failed:', error);
    throw error;
  }
};

// Receive messages
export const receiveMessages = async (queueUrl, maxMessages = 1) => {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20, // Long polling
      MessageAttributeNames: ['All']
    });

    const response = await sqsClient.send(command);
    return response.Messages || [];
  } catch (error) {
    console.error('❌ SQS receive failed:', error);
    throw error;
  }
};

// Delete message
export const deleteMessage = async (queueUrl, receiptHandle) => {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle
    });

    await sqsClient.send(command);
    console.log('✅ Message deleted from SQS');
  } catch (error) {
    console.error('❌ SQS delete failed:', error);
    throw error;
  }
};

export { sqsClient };
export default sqsClient;
