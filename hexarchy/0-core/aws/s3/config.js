// AWS S3 Configuration
import { S3Client } from '@aws-sdk/client-s3';

const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
};

const s3Client = new S3Client(s3Config);

export const bucketConfig = {
  videoBucket: process.env.S3_VIDEO_BUCKET || 'hootner-videos',
  assetsBucket: process.env.S3_ASSETS_BUCKET || 'hootner-assets',
  uploadBucket: process.env.S3_UPLOAD_BUCKET || 'hootner-uploads'
};

export { s3Client };
export default s3Client;
