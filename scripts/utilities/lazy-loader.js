/**
 * Zed-inspired Lazy Loading System
 * Target: <100ms startup time
 */

class LazyLoader { constructor() { this.loaded = new Set();
    this.pending = new Map();
    this.startTime = performance.now(); }

  async loadModule(name, path) { if (this.loaded.has(name)) {return;}
    if (this.pending.has(name)) {return this.pending.get(name);}

    const promise = new Promise((resolve, reject) => { const script = document.createElement('script');
      script.src = path;
      script.async = true;
      script.onload = () => { this.loaded.add(name);
        this.pending.delete(name);
        resolve(); };
      script.onerror = reject;
      document.head.appendChild(script); });

    this.pending.set(name, promise);
    return promise; }

  async loadOnDemand(modules) { const promises = modules.map(m => this.loadModule(m.name, m.path));
    await Promise.all(promises); }

  getStartupTime() { return performance.now() - this.startTime; } }

if (typeof module !== 'undefined' && module.exports) { module.exports = LazyLoader; }
