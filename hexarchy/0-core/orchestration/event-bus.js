/**
 * Event Bus for Inter-Domain Communication
 * Implements pub/sub pattern for domain events
 */

import { createLogger } from '../utils/logger.js';
import { DomainEvent } from '../contracts/domain-events.js';

const logger = createLogger('core', 'event-bus');

class EventBus {
  constructor() {
    this.subscribers = new Map(); // eventType -> Set of handlers
    this.eventHistory = []; // For debugging/replay
    this.maxHistorySize = 1000;
  }

  /**
   * Subscribe to an event type
   */
  subscribe(eventType, handler, options = {}) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    const wrappedHandler = async (event) => {
      try {
        logger.debug(`Handling event: ${eventType}`, {
          eventId: event.id,
          correlationId: event.correlationId
        });
        await handler(event);
      } catch (error) {
        logger.error(`Error handling event: ${eventType}`, {
          eventId: event.id,
          error: error.message
        });
        if (!options.ignoreErrors) {
          throw error;
        }
      }
    };

    this.subscribers.get(eventType).add(wrappedHandler);

    logger.info(`Subscribed to event: ${eventType}`);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(eventType).delete(wrappedHandler);
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish(event) {
    if (!(event instanceof DomainEvent)) {
      throw new Error('Event must be an instance of DomainEvent');
    }

    logger.info(`Publishing event: ${event.type}`, {
      eventId: event.id,
      correlationId: event.correlationId
    });

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify subscribers
    const handlers = this.subscribers.get(event.type) || new Set();
    const promises = Array.from(handlers).map(handler => handler(event));

    await Promise.allSettled(promises);
  }

  /**
   * Get event history for debugging
   */
  getHistory(filters = {}) {
    let history = this.eventHistory;

    if (filters.type) {
      history = history.filter(e => e.type === filters.type);
    }

    if (filters.correlationId) {
      history = history.filter(e => e.correlationId === filters.correlationId);
    }

    if (filters.since) {
      history = history.filter(e => new Date(e.timestamp) >= new Date(filters.since));
    }

    return history;
  }

  /**
   * Get subscriber count for monitoring
   */
  getStats() {
    const stats = {};
    for (const [eventType, handlers] of this.subscribers.entries()) {
      stats[eventType] = handlers.size;
    }
    return stats;
  }
}

// Singleton instance
export const eventBus = new EventBus();
export default eventBus;
