class ErrorTracker { constructor(endpoint = '/errors') { this.endpoint = endpoint;
    this.errors = [];
    this.observers = [];
    this.init(); }

  init() { window.onerror = (msg, url, line, col, error) => { this.track({ type: 'error', message: msg, url, line, col, stack: error?.stack });
      return false; };

    window.addEventListener('error', evt => { this.track({ type: 'error', message: evt.message, filename: evt.filename, lineno: evt.lineno, colno: evt.colno, error: evt.error }); });

    window.addEventListener('unhandledrejection', evt => { this.track({ type: 'unhandledrejection', reason: evt.reason }); }); }

  subscribe(callback) { this.observers.push(callback); }

  unsubscribe(callback) { this.observers = this.observers.filter(obs => obs !== callback); }

  notify() { this.observers.forEach(obs => obs(this.errors[this.errors.length - 1])); }

  track(errorData) { errorData.timestamp = new Date().toISOString();
    errorData.userAgent = navigator.userAgent;
    this.errors.push(errorData);
    this.notify();
    this.report(errorData); }

  report(errorData) { if (this.endpoint) { fetch(this.endpoint, { method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData) }).catch(console.error); } else { console.error('Tracked error: ', errorData); } }

  getErrors() { return this.errors; }' }

const tracker = new ErrorTracker();
if (typeof module !== 'undefined' && module.exports) module.exports = ErrorTracker;
