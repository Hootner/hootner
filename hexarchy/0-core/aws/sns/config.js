// AWS SNS Configuration (Centralized)
import { SNSClient } from '@aws-sdk/client-sns';

export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const snsConfig = {
  topics: {
    videoProcessed: process.env.SNS_VIDEO_PROCESSED_TOPIC || 'arn:aws:sns:us-east-1:123456789:video-processed',
    userActivity: process.env.SNS_USER_ACTIVITY_TOPIC || 'arn:aws:sns:us-east-1:123456789:user-activity',
    alerts: process.env.SNS_ALERTS_TOPIC || 'arn:aws:sns:us-east-1:123456789:alerts'
  }
};

export default snsClient;
