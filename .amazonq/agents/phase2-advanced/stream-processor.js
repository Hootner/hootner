// Minimal Stream Processing - Real-time Data, Windows, Aggregations
class Stream {
  constructor(name) {
    this.name = name;
    this.operators = [];
  }

  // Map transformation
  map(fn) {
    this.operators.push({ type: 'map', fn });
    return this;
  }

  // Filter
  filter(fn) {
    this.operators.push({ type: 'filter', fn });
    return this;
  }

  // Window (tumbling)
  window(size, fn) {
    this.operators.push({ type: 'window', size, fn, buffer: [] });
    return this;
  }

  // Aggregate
  aggregate(fn, initial) {
    this.operators.push({ type: 'aggregate', fn, accumulator: initial });
    return this;
  }

  // Sink (output)
  sink(fn) {
    this.operators.push({ type: 'sink', fn });
    return this;
  }

  // Process event
  process(event) {
    let data = event;

    for (const op of this.operators) {
      switch (op.type) {
        case 'map':
          data = op.fn(data);
          break;

        case 'filter':
          if (!op.fn(data)) return;
          break;

        case 'window':
          op.buffer.push(data);
          if (op.buffer.length >= op.size) {
            data = op.fn(op.buffer);
            op.buffer = [];
          } else {
            return; // Wait for window to fill
          }
          break;

        case 'aggregate':
          op.accumulator = op.fn(op.accumulator, data);
          data = op.accumulator;
          break;

        case 'sink':
          op.fn(data);
          break;
      }
    }
  }
}

class StreamProcessor {
  constructor() {
    this.streams = new Map();
  }

  createStream(name) {
    const stream = new Stream(name);
    this.streams.set(name, stream);
    return stream;
  }

  emit(streamName, event) {
    const stream = this.streams.get(streamName);
    if (stream) {
      stream.process(event);
    }
  }
}

// Demo: Real-time Analytics
console.log('=== Stream Processing Demo ===\n');

const processor = new StreamProcessor();

// Stream 1: Click events with windowing
console.log('--- Stream 1: Click Analytics (5-event window) ---');
processor.createStream('clicks')
  .map(event => ({ ...event, timestamp: Date.now() }))
  .filter(event => event.userId !== 'bot')
  .window(5, (events) => {
    return {
      count: events.length,
      users: new Set(events.map(e => e.userId)).size,
      pages: events.map(e => e.page)
    };
  })
  .sink(result => {
    console.log(`Window: ${result.count} clicks, ${result.users} unique users`);
    console.log(`Pages: ${result.pages.join(', ')}\n`);
  });

// Stream 2: Temperature monitoring with aggregation
console.log('--- Stream 2: Temperature Monitoring ---');
processor.createStream('temperature')
  .map(event => event.value)
  .filter(temp => temp > 0)
  .aggregate((acc, temp) => {
    acc.count++;
    acc.sum += temp;
    acc.avg = acc.sum / acc.count;
    acc.min = Math.min(acc.min, temp);
    acc.max = Math.max(acc.max, temp);
    return acc;
  }, { count: 0, sum: 0, avg: 0, min: Infinity, max: -Infinity })
  .sink(stats => {
    console.log(`Stats: avg=${stats.avg.toFixed(1)}°C, min=${stats.min}°C, max=${stats.max}°C`);
  });

// Emit events
console.log('\nEmitting click events...');
['alice', 'bob', 'alice', 'charlie', 'bot', 'alice', 'bob', 'dave'].forEach((userId, i) => {
  processor.emit('clicks', { userId, page: `/page${i % 3}` });
});

console.log('\nEmitting temperature readings...');
[22.5, 23.1, 22.8, 24.2, 23.5].forEach(temp => {
  processor.emit('temperature', { sensor: 'room-1', value: temp });
});

export default StreamProcessor;
