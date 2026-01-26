/**
 * Lambda Handler for S3 Upload Events
 * Triggered when files are uploaded to the upload bucket
 */

const { processS3Event } = require('../../services/sqs-video-processor');

exports.handler = async (event, context) => {
  console.log('S3 Event received:', JSON.stringify(event, null, 2));

  try {
    await processS3Event(event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'S3 event processed successfully',
        processed: event.Records?.length || 0
      })
    };
  } catch (error) {
    console.error('Error processing S3 event:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing S3 event',
        error: error.message
      })
    };
  }
};
