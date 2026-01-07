/**
 * Cleanup Utilities
 * Addresses 15 cleanup TODOs
 */

export class CleanupManager {
  constructor() {
    this.intervals = new Set();
    this.listeners = new Map();
  }

  registerInterval(id) {
    this.intervals.add(id);
  }

  clearAllIntervals() {
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();
  }

  registerListener(element, event, handler) {
    const key = `${element}-${event}`;
    this.listeners.set(key, { element, event, handler });
  }

  removeAllListeners() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners.clear();
  }

  cleanup() {
    this.clearAllIntervals();
    this.removeAllListeners();
  }
}

export default new CleanupManager();
