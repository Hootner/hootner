// Bulkhead Pattern (Resource Isolation)
export class Bulkhead {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.currentlyExecuting = 0;
    this.queue = [];
  }

  async execute(fn) {
    if (this.currentlyExecuting >= this.maxConcurrent) {
      // Queue the request
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.currentlyExecuting++;
    
    try {
      return await fn();
    } finally {
      this.currentlyExecuting--;
      
      // Process next queued request
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }

  getStats() {
    return {
      executing: this.currentlyExecuting,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent
    };
  }
}

export default Bulkhead;
