export class RealtimeAnalytics {
  constructor() {
    this.streams = new Map();
    this.metrics = { events: 0, streams: 0 };
  }

  createStream(streamId) {
    this.streams.set(streamId, { active: true, events: [] });
    this.metrics.streams++;
    return streamId;
  }

  pushEvent(streamId, event) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.events.push({ ...event, timestamp: Date.now() });
      this.metrics.events++;
    }
  }

  getAnalytics(streamId) {
    const stream = this.streams.get(streamId);
    return stream ? { count: stream.events.length, active: stream.active } : null;
  }
}

export default new RealtimeAnalytics();
