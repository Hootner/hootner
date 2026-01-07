// Minimal Pub/Sub System
class PubSub {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(event, handler) {
    if (!this.subscribers.has(event)) this.subscribers.set(event, []);
    this.subscribers.get(event).push(handler);
    return () => this.unsubscribe(event, handler);
  }

  publish(event, data) {
    if (!this.subscribers.has(event)) return;
    this.subscribers.get(event).forEach(h => h(data));
  }

  unsubscribe(event, handler) {
    if (!this.subscribers.has(event)) return;
    const handlers = this.subscribers.get(event).filter(h => h !== handler);
    this.subscribers.set(event, handlers);
  }
}

const ps = new PubSub();
ps.subscribe('user.login', user => console.log('Login:', user));
ps.publish('user.login', { id: 1, name: 'Alice' });

export default PubSub;
