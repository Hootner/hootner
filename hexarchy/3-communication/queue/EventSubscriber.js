// Event Subscriber
import { logger } from '../../0-core/logging/logger.js';

export class EventSubscriber {
  constructor() {
    this.handlers = new Map();
  }

  // Subscribe to event
  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
    logger.info('Subscribed to event', { eventType });
  }

  // Unsubscribe
  unsubscribe(eventType, handler) {
    if (this.handlers.has(eventType)) {
      const handlers = this.handlers.get(eventType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Handle event
  async handle(event) {
    const eventType = event.DetailType || event['detail-type'];

    if (!this.handlers.has(eventType)) {
      return;
    }

    const handlers = this.handlers.get(eventType);
    const detail = typeof event.Detail === 'string' ? JSON.parse(event.Detail) : event.Detail;

    for (const handler of handlers) {
      try {
        await handler(detail);
      } catch (error) {
        logger.error('Event handler failed:', error, { eventType });
      }
    }
  }
}

// Global event subscriber
const eventSubscriber = new EventSubscriber();

// Register handlers
eventSubscriber.subscribe('UserRegistered', async (detail) => {
  logger.info('User registered event received', detail);
  // Send welcome email
});

eventSubscriber.subscribe('VideoProcessed', async (detail) => {
  logger.info('Video processed event received', detail);
  // Send notification to user
});

eventSubscriber.subscribe('PaymentReceived', async (detail) => {
  logger.info('Payment received event received', detail);
  // Update user subscription
});

export default eventSubscriber;
