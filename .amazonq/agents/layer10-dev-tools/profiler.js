#!/usr/bin/env node
/**
 * Layer 10: Profiler - Performance profiling and analysis
 * Dependencies: Layer 4 (Runtime), Layer 9 (Game Engine)
 */

class Profiler {
  constructor() {
    this.samples = [];
    this.marks = new Map();
    this.measures = [];
    this.memorySnapshots = [];
    this.active = false;
  }

  // Start profiling
  start() {
    this.active = true;
    this.startTime = Date.now();
    console.log('[PROFILER] Started');
  }

  // Stop profiling
  stop() {
    this.active = false;
    console.log('[PROFILER] Stopped');
  }

  // Record sample
  sample(name, duration) {
    if (!this.active) return;
    
    this.samples.push({
      name,
      duration,
      timestamp: Date.now()
    });
  }

  // Mark point in time
  mark(name) {
    this.marks.set(name, Date.now());
  }

  // Measure between marks
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (!start || !end) {
      console.log(`[ERROR] Marks not found`);
      return;
    }
    
    const duration = end - start;
    this.measures.push({ name, duration, start, end });
    console.log(`[MEASURE] ${name}: ${duration}ms`);
    return duration;
  }

  // Profile function
  profile(fn, name = 'anonymous') {
    return (...args) => {
      const start = Date.now();
      const result = fn(...args);
      const duration = Date.now() - start;
      
      this.sample(name, duration);
      return result;
    };
  }

  // Profile async function
  profileAsync(fn, name = 'anonymous') {
    return async (...args) => {
      const start = Date.now();
      const result = await fn(...args);
      const duration = Date.now() - start;
      
      this.sample(name, duration);
      return result;
    };
  }

  // Take memory snapshot
  snapshot() {
    const snapshot = {
      timestamp: Date.now(),
      heapUsed: process.memoryUsage?.().heapUsed || 0,
      heapTotal: process.memoryUsage?.().heapTotal || 0,
      external: process.memoryUsage?.().external || 0
    };
    
    this.memorySnapshots.push(snapshot);
    return snapshot;
  }

  // Analyze samples
  analyze() {
    const byName = new Map();
    
    for (const sample of this.samples) {
      if (!byName.has(sample.name)) {
        byName.set(sample.name, {
          name: sample.name,
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity
        });
      }
      
      const stats = byName.get(sample.name);
      stats.count++;
      stats.total += sample.duration;
      stats.min = Math.min(stats.min, sample.duration);
      stats.max = Math.max(stats.max, sample.duration);
    }
    
    // Calculate averages
    const results = [];
    for (const stats of byName.values()) {
      results.push({
        name: stats.name,
        count: stats.count,
        avg: (stats.total / stats.count).toFixed(2),
        min: stats.min.toFixed(2),
        max: stats.max.toFixed(2),
        total: stats.total.toFixed(2)
      });
    }
    
    // Sort by total time
    results.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
    
    return results;
  }

  // Find bottlenecks
  bottlenecks(threshold = 100) {
    const analysis = this.analyze();
    return analysis.filter(stat => parseFloat(stat.avg) > threshold);
  }

  // Memory leak detection
  detectLeaks() {
    if (this.memorySnapshots.length < 2) return null;
    
    const first = this.memorySnapshots[0];
    const last = this.memorySnapshots[this.memorySnapshots.length - 1];
    
    const growth = last.heapUsed - first.heapUsed;
    const rate = growth / (last.timestamp - first.timestamp);
    
    return {
      growth: (growth / 1024 / 1024).toFixed(2) + ' MB',
      rate: (rate * 1000).toFixed(2) + ' bytes/sec',
      snapshots: this.memorySnapshots.length
    };
  }

  // Generate report
  report() {
    const analysis = this.analyze();
    const leaks = this.detectLeaks();
    
    return {
      samples: this.samples.length,
      functions: analysis.length,
      topFunctions: analysis.slice(0, 5),
      bottlenecks: this.bottlenecks(),
      memory: leaks
    };
  }

  // Clear data
  clear() {
    this.samples = [];
    this.marks.clear();
    this.measures = [];
    this.memorySnapshots = [];
    console.log('[PROFILER] Cleared');
  }
}

// Demo
if (require.main === module) {
  const profiler = new Profiler();
  
  console.log('=== Profiler Demo ===\n');
  
  profiler.start();
  
  // Profile functions
  const slowFunction = profiler.profile(() => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) sum += i;
    return sum;
  }, 'slowFunction');
  
  const fastFunction = profiler.profile(() => {
    return 42;
  }, 'fastFunction');
  
  // Run functions
  for (let i = 0; i < 5; i++) {
    slowFunction();
    fastFunction();
  }
  
  console.log();
  
  // Marks and measures
  profiler.mark('start');
  setTimeout(() => {
    profiler.mark('end');
    profiler.measure('operation', 'start', 'end');
  }, 50);
  
  // Memory snapshots
  profiler.snapshot();
  setTimeout(() => {
    profiler.snapshot();
    
    console.log();
    
    // Analysis
    console.log('Analysis:', profiler.analyze());
    
    console.log();
    
    // Report
    console.log('Report:', profiler.report());
    
    profiler.stop();
  }, 100);
}

module.exports = Profiler;
