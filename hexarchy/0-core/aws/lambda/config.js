// AWS Lambda Configuration
import { LambdaClient } from '@aws-sdk/client-lambda';

const lambdaConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
};

const lambdaClient = new LambdaClient(lambdaConfig);

export const functionConfig = {
  videoProcessor: process.env.LAMBDA_VIDEO_PROCESSOR || 'hootner-video-processor',
  thumbnailGenerator: process.env.LAMBDA_THUMBNAIL_GEN || 'hootner-thumbnail-generator',
  notificationHandler: process.env.LAMBDA_NOTIFICATION || 'hootner-notification-handler'
};

export { lambdaClient };
export default lambdaClient;
