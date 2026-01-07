#!/usr/bin/env node
/**
 * Layer 8: Event System - DOM event handling
 * Dependencies: Layer 8 (Virtual DOM)
 */

class EventSystem {
  constructor() {
    this.listeners = new Map();
    this.delegated = new Map();
    this.eventLog = [];
  }

  // Add event listener
  on(target, event, handler, options = {}) {
    const key = `${target}:${event}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key).push({
      handler,
      capture: options.capture || false,
      once: options.once || false,
      passive: options.passive || false
    });
    
    console.log(`[ON] ${target} ${event}`);
  }

  // Remove event listener
  off(target, event, handler) {
    const key = `${target}:${event}`;
    const listeners = this.listeners.get(key);
    
    if (listeners) {
      const index = listeners.findIndex(l => l.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
        console.log(`[OFF] ${target} ${event}`);
      }
    }
  }

  // Emit event
  emit(target, event, data = {}) {
    const eventObj = {
      type: event,
      target,
      data,
      timestamp: Date.now(),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      propagationStopped: false
    };
    
    eventObj.preventDefault = () => {
      if (eventObj.cancelable) {
        eventObj.defaultPrevented = true;
      }
    };
    
    eventObj.stopPropagation = () => {
      eventObj.propagationStopped = true;
    };
    
    console.log(`[EMIT] ${target} ${event}`);
    this.eventLog.push(eventObj);
    
    // Capture phase
    this.dispatchPhase(target, event, eventObj, 'capture');
    
    // Target phase
    if (!eventObj.propagationStopped) {
      this.dispatchPhase(target, event, eventObj, 'target');
    }
    
    // Bubble phase
    if (!eventObj.propagationStopped && eventObj.bubbles) {
      this.dispatchPhase(target, event, eventObj, 'bubble');
    }
    
    return eventObj;
  }

  // Dispatch phase
  dispatchPhase(target, event, eventObj, phase) {
    const key = `${target}:${event}`;
    const listeners = this.listeners.get(key) || [];
    
    for (const listener of listeners) {
      if (phase === 'capture' && !listener.capture) continue;
      if (phase === 'bubble' && listener.capture) continue;
      
      listener.handler(eventObj);
      
      if (listener.once) {
        this.off(target, event, listener.handler);
      }
      
      if (eventObj.propagationStopped) break;
    }
  }

  // Event delegation
  delegate(parent, event, selector, handler) {
    const key = `${parent}:${event}`;
    
    if (!this.delegated.has(key)) {
      this.delegated.set(key, []);
    }
    
    this.delegated.get(key).push({ selector, handler });
    
    // Add listener to parent
    this.on(parent, event, (e) => {
      const delegates = this.delegated.get(key);
      for (const { selector, handler } of delegates) {
        if (this.matchesSelector(e.target, selector)) {
          handler(e);
        }
      }
    });
    
    console.log(`[DELEGATE] ${parent} ${event} -> ${selector}`);
  }

  // Match selector (simplified)
  matchesSelector(target, selector) {
    if (selector.startsWith('.')) {
      return target.includes(selector.slice(1));
    }
    if (selector.startsWith('#')) {
      return target === selector.slice(1);
    }
    return target === selector;
  }

  // Custom events
  createEvent(name, data = {}) {
    return {
      type: name,
      detail: data,
      timestamp: Date.now()
    };
  }

  // Once helper
  once(target, event, handler) {
    this.on(target, event, handler, { once: true });
  }

  // Throttle helper
  throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn(...args);
      }
    };
  }

  // Debounce helper
  debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // Get event log
  getLog(filter = {}) {
    let log = this.eventLog;
    
    if (filter.type) {
      log = log.filter(e => e.type === filter.type);
    }
    
    if (filter.target) {
      log = log.filter(e => e.target === filter.target);
    }
    
    return log;
  }

  // Clear log
  clearLog() {
    this.eventLog = [];
    console.log('[CLEAR] Event log cleared');
  }

  // Stats
  stats() {
    const byType = {};
    for (const event of this.eventLog) {
      byType[event.type] = (byType[event.type] || 0) + 1;
    }
    
    return {
      listeners: this.listeners.size,
      delegated: this.delegated.size,
      events: this.eventLog.length,
      byType
    };
  }
}

// Demo
if (require.main === module) {
  const events = new EventSystem();
  
  console.log('=== Event System Demo ===\n');
  
  // Add listeners
  events.on('button', 'click', (e) => {
    console.log(`  Handler 1: Button clicked`);
  });
  
  events.on('button', 'click', (e) => {
    console.log(`  Handler 2: Button clicked`);
    e.stopPropagation();
  });
  
  console.log();
  
  // Emit event
  events.emit('button', 'click', { x: 100, y: 200 });
  
  console.log();
  
  // Once listener
  events.once('form', 'submit', (e) => {
    console.log(`  Form submitted (once)`);
  });
  
  events.emit('form', 'submit');
  events.emit('form', 'submit'); // Won't trigger
  
  console.log();
  
  // Event delegation
  events.delegate('list', 'click', '.item', (e) => {
    console.log(`  Delegated: Item clicked`);
  });
  
  events.emit('item-1', 'click');
  
  console.log();
  
  // Throttle
  const throttled = events.throttle(() => {
    console.log('  Throttled function');
  }, 100);
  
  throttled();
  throttled(); // Won't execute
  
  console.log('\nStats:', events.stats());
}

module.exports = EventSystem;
