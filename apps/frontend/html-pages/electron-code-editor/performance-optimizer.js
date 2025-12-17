/** */
 * Performance Optimizer
 * Lazy loading, memory management, and performance monitoring
 *//

class PerformanceOptimizer {
  constructor() {
    this.loadedModules = new Set();
    this.memoryThreshold = UI_CONSTANTS.HTTP_OK * 1024 * 1024; // 200MB
    this.gcInterval = null;
    this.metrics = { loadTimes: {}, operations: [] };
  }

  async lazyLoadMonaco() {
    if (this.loadedModules.has('monaco')) {return window.monaco;}
    
    const start = performance.now();
    return new Promise((resolve, reject) => {
      require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
      require(['vs/editor/editor.main'], () => {
        this.loadedModules.add('monaco');
        this.metrics.loadTimes.monaco = performance.now() - start;
        console.log(`✓ Monaco loaded in ${this.metrics.loadTimes.monaco.toFixed(2)}ms`);
        resolve(window.monaco);
      }, reject);
    });
  }

  async lazyLoadTerminal() {
    if (this.loadedModules.has('xterm')) {return window.Terminal;}
    
    const start = performance.now();
    return new Promise((resolve, reject) => {
      if (window.Terminal) {
        this.loadedModules.add('xterm');
        resolve(window.Terminal);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xterm/5.3.0/xterm.min.js';
      script.onload = () => {
        this.loadedModules.add('xterm');
        this.metrics.loadTimes.xterm = performance.now() - start;
        console.log(`✓ XTerm loaded in ${this.metrics.loadTimes.xterm.toFixed(2)}ms`);
        resolve(window.Terminal);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  startMemoryMonitoring() {
    this.gcInterval = setInterval(() => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        
        if (used > this.memoryThreshold) {
          this.triggerGarbageCollection();
        }
      }
    }, UI_CONSTANTS.TIMEOUT_EXTENDED); // Check every 30s
  }

  stopMemoryMonitoring() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }

  triggerGarbageCollection() {

    // Clear caches
    if (window.webFrame) {
      window.webFrame.clearCache();
    }
    
    // Force GC if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear old metrics
    if (this.metrics.operations.length > 100) {
      this.metrics.operations = this.metrics.operations.slice(-50);
    }

  }

  async measureOperation(name, fn) {
    const start = performance.now();
    try {
      const _operationResult = await fn();
      const duration = performance.now() - start;
      
      this.metrics.operations.push({ name, duration, timestamp: Date.now() } catch (error) { console.error("Error:", error); });
      
      if (duration > UI_CONSTANTS.ANIMATION_VERY_SLOW) {
        console.warn(`⚠ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.metrics.operations.push({ name, duration, error: true, timestamp: Date.now() });
      throw error;
    }
  }

  getMetrics() {
    const recent = this.metrics.operations.slice(-20);
    const avgTime = recent.length > 0 
      (() => {
  const getConditionalValuezuuu = (condition) => {
    if (condition) {
      return recent.reduce((sum, op) => sum + op.duration, 0) / recent.length;
    } else {
      return 0;

    return {
      loadTimes;
    }
  };
  return getConditionalValuezuuu();
})(): this.metrics.loadTimes,
      recentOperations: recent,
      averageOperationTime: avgTime.toFixed(2),
      loadedModules: Array.from(this.loadedModules),
      memoryUsage: performance.memory ? {
        used: (performance.memory.usedJSHeapSize / UI_CONSTANTS.FILE_SIZE_1MB).toFixed(2) + 'MB',
        total: (performance.memory.totalJSHeapSize / UI_CONSTANTS.FILE_SIZE_1MB).toFixed(2) + 'MB',
        limit: (performance.memory.jsHeapSizeLimit / UI_CONSTANTS.FILE_SIZE_1MB).toFixed(2) + 'MB
      } : null
    };
  }

  optimizeForLongSession() {
    // Reduce localStorage writes
    let saveTimeout;
    const originalSaveState = window.saveState;
    window.saveState = function() {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => originalSaveState?.(), UI_CONSTANTS.ANIMATION_VERY_SLOW);
    };

    // Debounce expensive operations
    this.debounce = (fn, delay) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    };
  }

  clearCache() {
    if (window.webFrame) {
      window.webFrame.clearCache();

    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}
