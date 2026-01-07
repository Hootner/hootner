// Minimal Profiler - Performance Measurement & Analysis
class Profiler {
  constructor() {
    this.metrics = new Map();
    this.stack = [];
  }

  start(label) {
    this.stack.push({ label, start: performance.now() });
  }

  end(label) {
    const entry = this.stack.pop();
    if (!entry || entry.label !== label) {
      throw new Error(`Profiler mismatch: expected ${entry?.label}, got ${label}`);
    }

    const duration = performance.now() - entry.start;
    if (!this.metrics.has(label)) {
      this.metrics.set(label, { count: 0, total: 0, min: Infinity, max: 0, durations: [] });
    }

    const metric = this.metrics.get(label);
    metric.count++;
    metric.total += duration;
    metric.min = Math.min(metric.min, duration);
    metric.max = Math.max(metric.max, duration);
    metric.durations.push(duration);
  }

  // Wrap function with profiling
  wrap(label, fn) {
    return (...args) => {
      this.start(label);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(() => this.end(label));
        }
        this.end(label);
        return result;
      } catch (error) {
        this.end(label);
        throw error;
      }
    };
  }

  getStats(label) {
    const metric = this.metrics.get(label);
    if (!metric) return null;

    const avg = metric.total / metric.count;
    const sorted = [...metric.durations].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: metric.count,
      total: metric.total.toFixed(2),
      avg: avg.toFixed(2),
      min: metric.min.toFixed(2),
      max: metric.max.toFixed(2),
      p50: p50.toFixed(2),
      p95: p95.toFixed(2),
      p99: p99.toFixed(2)
    };
  }

  report() {
    console.log('\n=== Performance Report ===');
    for (const [label, _] of this.metrics) {
      const stats = this.getStats(label);
      console.log(`\n${label}:`);
      console.log(`  Calls: ${stats.count}`);
      console.log(`  Total: ${stats.total}ms`);
      console.log(`  Avg: ${stats.avg}ms`);
      console.log(`  Min: ${stats.min}ms | Max: ${stats.max}ms`);
      console.log(`  P50: ${stats.p50}ms | P95: ${stats.p95}ms | P99: ${stats.p99}ms`);
    }
  }

  reset() {
    this.metrics.clear();
    this.stack = [];
  }
}

// Demo: Profile Database Operations
const profiler = new Profiler();

// Simulate database operations
const dbQuery = profiler.wrap('db.query', (query) => {
  const delay = Math.random() * 50 + 10;
  const start = Date.now();
  while (Date.now() - start < delay) {} // Busy wait
  return { rows: [] };
});

const apiCall = profiler.wrap('api.call', (endpoint) => {
  const delay = Math.random() * 100 + 20;
  const start = Date.now();
  while (Date.now() - start < delay) {} // Busy wait
  return { status: 200 };
});

// Run operations
for (let i = 0; i < 100; i++) {
  dbQuery('SELECT * FROM users');
}

for (let i = 0; i < 50; i++) {
  apiCall('/api/data');
}

// Manual profiling
profiler.start('complex-operation');
dbQuery('SELECT * FROM orders');
apiCall('/api/process');
profiler.end('complex-operation');

profiler.report();

export default Profiler;
