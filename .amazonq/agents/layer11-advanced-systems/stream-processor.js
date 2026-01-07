#!/usr/bin/env node
/**
 * Layer 11: Stream Processing - Real-time data stream processing
 * Dependencies: Layer 5 (Message Broker), Layer 6 (Time-Series DB)
 */

class StreamProcessor {
  constructor() {
    this.streams = new Map();
    this.operators = new Map();
    this.windows = new Map();
  }

  // Create stream
  createStream(name) {
    this.streams.set(name, {
      name,
      events: [],
      subscribers: []
    });
    console.log(`[STREAM] Created ${name}`);
  }

  // Emit event to stream
  emit(streamName, event) {
    const stream = this.streams.get(streamName);
    if (!stream) return;
    
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      streamName
    };
    
    stream.events.push(enrichedEvent);
    
    // Notify subscribers
    for (const subscriber of stream.subscribers) {
      subscriber(enrichedEvent);
    }
  }

  // Map operator
  map(inputStream, outputStream, fn) {
    const input = this.streams.get(inputStream);
    
    input.subscribers.push((event) => {
      const transformed = fn(event);
      this.emit(outputStream, transformed);
    });
    
    console.log(`[MAP] ${inputStream} -> ${outputStream}`);
  }

  // Filter operator
  filter(inputStream, outputStream, predicate) {
    const input = this.streams.get(inputStream);
    
    input.subscribers.push((event) => {
      if (predicate(event)) {
        this.emit(outputStream, event);
      }
    });
    
    console.log(`[FILTER] ${inputStream} -> ${outputStream}`);
  }

  // Window operator (tumbling window)
  window(inputStream, windowSize, aggregateFn) {
    const windowId = `${inputStream}_window`;
    const buffer = [];
    
    this.windows.set(windowId, {
      buffer,
      size: windowSize,
      results: []
    });
    
    const input = this.streams.get(inputStream);
    
    input.subscribers.push((event) => {
      buffer.push(event);
      
      if (buffer.length >= windowSize) {
        const result = aggregateFn(buffer);
        this.windows.get(windowId).results.push({
          result,
          timestamp: Date.now()
        });
        
        console.log(`[WINDOW] Aggregated ${buffer.length} events: ${JSON.stringify(result)}`);
        buffer.length = 0;
      }
    });
    
    return windowId;
  }

  // Sliding window
  slidingWindow(inputStream, windowSize, slideSize, aggregateFn) {
    const windowId = `${inputStream}_sliding`;
    const buffer = [];
    
    this.windows.set(windowId, {
      buffer,
      windowSize,
      slideSize,
      results: []
    });
    
    const input = this.streams.get(inputStream);
    let count = 0;
    
    input.subscribers.push((event) => {
      buffer.push(event);
      count++;
      
      if (count >= slideSize) {
        const window = buffer.slice(-windowSize);
        if (window.length === windowSize) {
          const result = aggregateFn(window);
          this.windows.get(windowId).results.push({
            result,
            timestamp: Date.now()
          });
          
          console.log(`[SLIDING] Aggregated window: ${JSON.stringify(result)}`);
        }
        count = 0;
      }
    });
    
    return windowId;
  }

  // Join streams
  join(stream1Name, stream2Name, outputStream, joinFn, windowMs = 1000) {
    const stream1 = this.streams.get(stream1Name);
    const stream2 = this.streams.get(stream2Name);
    
    const buffer1 = [];
    const buffer2 = [];
    
    stream1.subscribers.push((event) => {
      buffer1.push(event);
      this.tryJoin(buffer1, buffer2, outputStream, joinFn, windowMs);
    });
    
    stream2.subscribers.push((event) => {
      buffer2.push(event);
      this.tryJoin(buffer1, buffer2, outputStream, joinFn, windowMs);
    });
    
    console.log(`[JOIN] ${stream1Name} + ${stream2Name} -> ${outputStream}`);
  }

  // Try to join events
  tryJoin(buffer1, buffer2, outputStream, joinFn, windowMs) {
    const now = Date.now();
    
    // Clean old events
    const cutoff = now - windowMs;
    buffer1.splice(0, buffer1.findIndex(e => e.timestamp >= cutoff));
    buffer2.splice(0, buffer2.findIndex(e => e.timestamp >= cutoff));
    
    // Join matching events
    for (const e1 of buffer1) {
      for (const e2 of buffer2) {
        if (Math.abs(e1.timestamp - e2.timestamp) <= windowMs) {
          const joined = joinFn(e1, e2);
          if (joined) {
            this.emit(outputStream, joined);
          }
        }
      }
    }
  }

  // Get window results
  getWindowResults(windowId) {
    const window = this.windows.get(windowId);
    return window ? window.results : [];
  }

  // Get stats
  stats() {
    const streamStats = Array.from(this.streams.values()).map(s => ({
      name: s.name,
      events: s.events.length,
      subscribers: s.subscribers.length
    }));
    
    return {
      streams: this.streams.size,
      windows: this.windows.size,
      streams: streamStats
    };
  }
}

// Demo
if (require.main === module) {
  const processor = new StreamProcessor();
  
  console.log('=== Stream Processing Demo ===\n');
  
  // Create streams
  processor.createStream('clicks');
  processor.createStream('filtered');
  processor.createStream('transformed');
  
  console.log();
  
  // Filter: only clicks with value > 50
  processor.filter('clicks', 'filtered', (event) => event.value > 50);
  
  // Map: transform events
  processor.map('filtered', 'transformed', (event) => ({
    ...event,
    value: event.value * 2
  }));
  
  // Window: aggregate every 3 events
  const windowId = processor.window('transformed', 3, (events) => ({
    count: events.length,
    sum: events.reduce((sum, e) => sum + e.value, 0),
    avg: events.reduce((sum, e) => sum + e.value, 0) / events.length
  }));
  
  console.log();
  
  // Emit events
  for (let i = 0; i < 10; i++) {
    processor.emit('clicks', { userId: `user${i % 3}`, value: Math.random() * 100 });
  }
  
  console.log();
  
  // Get window results
  const results = processor.getWindowResults(windowId);
  console.log('Window results:', results);
  
  console.log('\nStats:', processor.stats());
}

module.exports = StreamProcessor;
