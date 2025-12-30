class BehaviorAnalytics {
  constructor() {
    this.clicks = [];
    this.scrolls = { maxDepth: 0 };
    this.sessionEvents = [];
    this.sessionStart = Date.now();
    this.init();
  }

  init() {
    document.addEventListener('click', evt => {
      this.trackClick(evt.clientX, evt.clientY, evt.target.tagName);
    });

    document.addEventListener('scroll', () => {
      const depth = Math.floor((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
      if (depth > this.scrolls.maxDepth) {
        this.scrolls.maxDepth = depth;
        this.trackEvent('scroll', { depth });
      }
    });

    let lastMove = 0;
    document.addEventListener('mousemove', evt => {
      if (Date.now() - lastMove > 200) {
        this.trackEvent('mousemove', { x: evt.clientX, y: evt.clientY });
        lastMove = Date.now();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.trackEvent('sessionEnd', { duration: Math.floor((Date.now() - this.sessionStart) / 1000) });
      this.report();
    });
  }

  trackClick(x, y, element) {
    this.clicks.push({ x, y, element, time: Date.now() - this.sessionStart });
    this.trackEvent('click', { x, y, element });
  }

  trackEvent(type, data) {
    this.sessionEvents.push({ type, data, time: Date.now() - this.sessionStart });
  }

  getData() {
    return { clicks: this.clicks, scrolls: this.scrolls, sessionEvents: this.sessionEvents };
  }

  report() {
    console.log('Behavior data:', this.getData());
  }
}

const analytics = new BehaviorAnalytics();
if (typeof module !== 'undefined' && module.exports) module.exports = BehaviorAnalytics;
