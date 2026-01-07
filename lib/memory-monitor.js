class MemoryMonitor { constructor() { this.interval = null; }

  start() { this.interval = setInterval(() => { const usage = process.memoryUsage();
      if (usage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
        console.warn('High memory usage:', Math.round(usage.heapUsed / 1024 / 1024) + 'MB'); } }, 30000); // Check every 30 seconds }

  cleanup() { if (this.interval) { clearInterval(this.interval);
      this.interval = null; } } }

export default new MemoryMonitor();