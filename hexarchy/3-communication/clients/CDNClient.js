// CDN Client (CloudFront)
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { logger } from '../../0-core/logging/logger.js';

const cloudFrontClient = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class CDNClient {
  static DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

  // Invalidate cache
  static async invalidateCache(paths) {
    try {
      const command = new CreateInvalidationCommand({
        DistributionId: this.DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: `${Date.now()}`,
          Paths: {
            Quantity: paths.length,
            Items: paths
          }
        }
      });

      const response = await cloudFrontClient.send(command);
      logger.info('CloudFront cache invalidated', { paths });
      return response;
    } catch (error) {
      logger.error('Cache invalidation failed:', error);
      throw error;
    }
  }

  // Invalidate all
  static async invalidateAll() {
    return await this.invalidateCache(['/*']);
  }

  // Invalidate video
  static async invalidateVideo(videoKey) {
    return await this.invalidateCache([`/videos/${videoKey}`, `/videos/${videoKey}/*`]);
  }

  // Get CDN URL
  static getCDNUrl(path) {
    const domain = process.env.CLOUDFRONT_DOMAIN;
    return `https://${domain}${path}`;
  }

  // Get signed URL (for private content)
  static getSignedUrl(url, expiresIn = 3600) {
    // Implementation depends on CloudFront key pair
    // This is a placeholder
    return url;
  }
}

export default CDNClient;
