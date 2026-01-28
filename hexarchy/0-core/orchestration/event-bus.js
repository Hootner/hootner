class EventBus {
  constructor() {
    this.subscribers = new Map()
    this.logger = console
  }

  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    
    this.subscribers.get(eventType).push(handler)
    
    this.logger.info({
      timestamp: new Date().toISOString(),
      level: 'info',
      domain: 'core',
      component: 'event-bus',
      message: `Subscribed to event: ${eventType}`,
      correlationId: null
    })
  }

  publish(event) {
    const { type, payload, correlationId } = event
    
    if (!this.subscribers.has(type)) {
      return
    }

    const handlers = this.subscribers.get(type)
    
    handlers.forEach(async (handler) => {
      try {
        await handler({ type, payload, correlationId })
      } catch (error) {
        this.logger.error(`Event handler error for ${type}:`, error)
      }
    })
  }

  unsubscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      return
    }

    const handlers = this.subscribers.get(eventType)
    const index = handlers.indexOf(handler)
    
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  clear() {
    this.subscribers.clear()
  }
}

export const eventBus = new EventBus()
export default eventBus