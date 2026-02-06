// AWS CloudWatch Logging
import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

const client = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const LOG_GROUP = process.env.CLOUDWATCH_LOG_GROUP || '/hootner/application';
const LOG_STREAM = process.env.CLOUDWATCH_LOG_STREAM || `instance-${Date.now()}`;

export const initCloudWatchStream = async () => {
  try {
    await client.send(new CreateLogStreamCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM
    }));
    console.log('✅ CloudWatch log stream created');
  } catch (error) {
    if (error.name !== 'ResourceAlreadyExistsException') {
      console.error('❌ CloudWatch stream creation failed:', error);
    }
  }
};

export const sendToCloudWatch = async (message, level = 'info') => {
  try {
    const logEvent = {
      message: JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        service: 'hootner'
      }),
      timestamp: Date.now()
    };

    await client.send(new PutLogEventsCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [logEvent]
    }));
  } catch (error) {
    console.error('CloudWatch logging failed:', error);
  }
};

export default { initCloudWatchStream, sendToCloudWatch };
