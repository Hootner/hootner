class PerformanceMonitor {
  constructor() {
    this.vitals = {};
    this.observers = [];
    this.init();
  }

  init() {
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      this.vitals.lcp = entries[entries.length - 1].startTime;
      this.notify();
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          this.vitals.cls = (this.vitals.cls || 0) + entry.value;
        }
      });
      this.notify();
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver(list => {
      const entry = list.getEntries()[0];
      if (entry) {
        this.vitals.fid = entry.processingStart - entry.startTime;
        this.notify();
      }
    }).observe({ type: 'first-input', buffered: true });
  }

  subscribe(callback) {
    this.observers.push(callback);
  }

  unsubscribe(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  notify() {
    this.observers.forEach(obs => obs(this.vitals));
  }

  getVitals() {
    return this.vitals;
  }
}

const monitor = new PerformanceMonitor();
if (typeof module !== 'undefined' && module.exports) module.exports = PerformanceMonitor;
