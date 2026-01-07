class MetricsTracker { constructor() { this.observers = [];
    this.metrics = { pageViews: 0, timeOnPage: 0, customEvents: {} };
    this.startTime = Date.now();
    this.init(); }

  init() { this.metrics.pageViews = 1;
    setInterval(() => { this.metrics.timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);
      this.notify(); }, 1000);
    window.addEventListener('beforeunload', () => this.track('sessionEnd')); }

  subscribe(callback) { this.observers.push(callback); }

  unsubscribe(callback) { this.observers = this.observers.filter(obs => obs !== callback); }

  notify() { this.observers.forEach(obs => obs(this.metrics)); }

  track(eventName, data = {}) { if (!this.metrics.customEvents[eventName]) this.metrics.customEvents[eventName] = 0;
    this.metrics.customEvents[eventName]++;
    this.notify(); } }

const tracker = new MetricsTracker();
if (typeof module !== 'undefined' && module.exports) module.exports = MetricsTracker;
