// AWS CloudFront Configuration
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';

const cloudfrontConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
};

const cloudfrontClient = new CloudFrontClient(cloudfrontConfig);

export const distributionConfig = {
  videoDistribution: process.env.CLOUDFRONT_VIDEO_DIST || 'EV15I3TSUE9A1',
  assetsDistribution: process.env.CLOUDFRONT_ASSETS_DIST || '',
  domain: process.env.CLOUDFRONT_DOMAIN || 'd2xg9k8zu8m8bh.cloudfront.net'
};

export { cloudfrontClient };
export default cloudfrontClient;
