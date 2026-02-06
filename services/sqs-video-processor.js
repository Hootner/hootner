/**
 * SQS Video Processing Service
 * Handles video processing queue messages
 */

const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { moveToVideoStorage } = require('./s3-upload-service');

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:4566'
  })
});

const QUEUE_URL = process.env.VIDEO_QUEUE_URL;
const DLQ_URL = process.env.DLQ_URL;

/**
 * Send video processing job to queue
 * @param {object} jobData - Job data
 * @returns {Promise<string>} Message ID
 */
async function sendProcessingJob(jobData) {
  const command = new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(jobData),
    MessageAttributes: {
      jobType: {
        DataType: 'String',
        StringValue: jobData.type || 'video-processing'
      },
      userId: {
        DataType: 'String',
        StringValue: jobData.userId
      },
      priority: {
        DataType: 'Number',
        StringValue: String(jobData.priority || 5)
      }
    }
  });

  const response = await sqsClient.send(command);
  console.log(`Sent processing job to queue: ${response.MessageId}`);
  return response.MessageId;
}

/**
 * Process S3 upload event from queue
 * @param {object} event - SQS event
 */
async function processS3Event(event) {
  const records = event.Records || [];

  for (const record of records) {
    try {
      const body = JSON.parse(record.body);

      // Handle S3 event notification
      if (body.Records && body.Records[0]?.eventName?.startsWith('ObjectCreated')) {
        const s3Event = body.Records[0];
        const bucket = s3Event.s3.bucket.name;
        const key = decodeURIComponent(s3Event.s3.object.key.replace(/\+/g, ' '));

        console.log(`Processing S3 upload: ${bucket}/${key}`);

        // Extract metadata from key
        const pathParts = key.split('/');
        const userId = pathParts[1]; // uploads/{userId}/{file}

        // TODO: Integrate with your video model
        const videoId = generateVideoId();

        // Move file to video storage
        const newKey = await moveToVideoStorage(key, userId, videoId);

        // Send to video processing pipeline
        await sendProcessingJob({
          type: 'transcode',
          userId,
          videoId,
          sourceKey: newKey,
          sourceBucket: process.env.VIDEO_BUCKET,
          priority: 5
        });

        console.log(`Video moved and processing job queued: ${videoId}`);
      }

      // Delete message from queue
      await deleteMessage(record.receiptHandle);

    } catch (error) {
      console.error('Error processing queue message:', error);
      // Message will be retried or moved to DLQ
      throw error;
    }
  }
}

/**
 * Poll queue for messages (for worker processes)
 * @param {function} processor - Message processor function
 */
async function pollQueue(processor) {
  const command = new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,
    MessageAttributeNames: ['All']
  });

  try {
    const response = await sqsClient.send(command);
    const messages = response.Messages || [];

    for (const message of messages) {
      try {
        const body = JSON.parse(message.Body);
        await processor(body);
        await deleteMessage(message.ReceiptHandle);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  } catch (error) {
    console.error('Error polling queue:', error);
  }
}

/**
 * Delete message from queue
 * @param {string} receiptHandle - Message receipt handle
 */
async function deleteMessage(receiptHandle) {
  const command = new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle
  });

  await sqsClient.send(command);
}

/**
 * Generate unique video ID
 * @returns {string} Video ID
 */
function generateVideoId() {
  return `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Start queue worker (for long-running processes)
 */
async function startWorker(processor) {
  console.log('Starting SQS queue worker...');

  while (true) {
    try {
      await pollQueue(processor);
    } catch (error) {
      console.error('Worker error:', error);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s on error
    }
  }
}

module.exports = {
  sendProcessingJob,
  processS3Event,
  pollQueue,
  startWorker,
  sqsClient
};
