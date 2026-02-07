// Event Bus for Pub/Sub
import EventEmitter from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase for high-traffic apps
  }

  // Publish event
  publish(event, data) {
    console.log(`📤 Event published: ${event}`);
    this.emit(event, data);
  }

  // Subscribe to event
  subscribe(event, handler) {
    console.log(`📥 Subscribed to: ${event}`);
    this.on(event, handler);

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
      console.log(`🔕 Unsubscribed from: ${event}`);
    };
  }

  // Subscribe once
  subscribeOnce(event, handler) {
    this.once(event, handler);
  }

  // Clear all listeners for an event
  clearEvent(event) {
    this.removeAllListeners(event);
    console.log(`🧹 Cleared all listeners for: ${event}`);
  }
}

export const eventBus = new EventBus();

// Common events
export const EVENTS = {
  VIDEO_UPLOADED: 'video:uploaded',
  VIDEO_PROCESSED: 'video:processed',
  USER_REGISTERED: 'user:registered',
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  NOTIFICATION_SENT: 'notification:sent',
  WATCH_PARTY_STARTED: 'party:started',
  COMMENT_ADDED: 'comment:added'
};

export default eventBus;
