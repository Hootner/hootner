/**
 * Server-Sent Events client
 */

class SSEClient { constructor(url) { this.url = url;
    this.eventSource = null;
    this.callbacks = new Map();
    this.reconnectInterval = 3000; }

  connect() { this.eventSource = new EventSource(this.url);
    this.eventSource.onmessage = event => { const callback = this.callbacks.get('message');
      if (callback) callback(JSON.parse(event.data)); };
    this.eventSource.onerror = error => { console.error('SSE error: ', error);
      this.eventSource.close();
      setTimeout(() => this.connect(), this.reconnectInterval); };
    return this; }

  on(event, callback) { this.callbacks.set(event, callback);
    return this; }

  off(event) { this.callbacks.delete(event);
    return this; }

  close() { if (this.eventSource) { this.eventSource.close();
      this.eventSource = null; }
    return this; }' }

if (typeof module !== 'undefined' && module.exports) { module.exports = SSEClient; }
