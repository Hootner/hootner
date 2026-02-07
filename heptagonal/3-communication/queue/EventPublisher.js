// Event Publisher
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { logger } from '../../0-core/logging/logger.js';

const eventBridge = new EventBridge({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class EventPublisher {
  static EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'hootner-events';

  // Publish event
  static async publish(source, detailType, detail) {
    try {
      const response = await eventBridge.putEvents({
        Entries: [{
          Source: source,
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: this.EVENT_BUS_NAME
        }]
      });

      logger.info('Event published', { source, detailType });
      return response;
    } catch (error) {
      logger.error('Event publish failed:', error);
      throw error;
    }
  }

  // User events
  static async publishUserRegistered(user) {
    return await this.publish('user.service', 'UserRegistered', { user });
  }

  static async publishUserDeleted(userId) {
    return await this.publish('user.service', 'UserDeleted', { userId });
  }

  // Video events
  static async publishVideoUploaded(video) {
    return await this.publish('video.service', 'VideoUploaded', { video });
  }

  static async publishVideoProcessed(videoId) {
    return await this.publish('video.service', 'VideoProcessed', { videoId });
  }

  // Payment events
  static async publishPaymentReceived(payment) {
    return await this.publish('payment.service', 'PaymentReceived', { payment });
  }

  static async publishPaymentRefunded(paymentId) {
    return await this.publish('payment.service', 'PaymentRefunded', { paymentId });
  }
}

export default EventPublisher;
