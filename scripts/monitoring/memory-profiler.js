/**
 * Memory Profiler with Auto Cache Clearing
 */

class MemoryProfiler { constructor() { this.threshold = 100 * 1024 * 1024; // 100MB
    this.interval = null;
    this.history = []; }

  start() { this.interval = setInterval(() => this.check(), UI_CONSTANTS.TIMEOUT_EXTENDED); }

  async check() { const usage = await this.getUsage();
    this.history.push({ timestamp: Date.now(), ...usage });

    if (this.history.length > 20) {this.history.shift();}

    if (usage.heapUsed > this.threshold) { await this.clearCache(); } }

  async getUsage() { if (window.electronAPI) { return window.electronAPI.getMemoryUsage(); }
    return performance.memory || { heapUsed: 0, heapTotal: 0 }; }

  async clearCache() { if (window.electronAPI) { await window.electronAPI.clearCache(); }

    if ('caches' in window) { const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name))); } }

  getReport() { return { current: this.history[this.history.length - 1],
      history: this.history,
      threshold: this.threshold }; }

  stop() { if (this.interval) {clearInterval(this.interval);} } }

if (typeof module !== 'undefined' && module.exports) { module.exports = MemoryProfiler; }
