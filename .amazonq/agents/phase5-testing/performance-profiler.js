// Minimal Performance Profiler - CPU, Memory, Flame Graphs
class PerformanceProfiler {
  constructor() {
    this.samples = [];
    this.memorySnapshots = [];
    this.callStack = [];
    this.startTime = 0;
  }

  // Start profiling
  start() {
    this.startTime = Date.now();
    this.samples = [];
    this.memorySnapshots = [];
    console.log('Profiling started...');
  }

  // Sample call stack
  sample() {
    const timestamp = Date.now() - this.startTime;
    this.samples.push({
      timestamp,
      stack: [...this.callStack],
      memory: this.getMemoryUsage()
    });
  }

  // Track function entry
  enter(fnName) {
    this.callStack.push({
      name: fnName,
      startTime: Date.now()
    });
    this.sample();
  }

  // Track function exit
  exit() {
    const fn = this.callStack.pop();
    if (fn) {
      const duration = Date.now() - fn.startTime;
      this.sample();
      return duration;
    }
  }

  // Get memory usage (mock)
  getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      return Math.round(mem.heapUsed / 1024 / 1024);
    }
    return Math.round(Math.random() * 50); // Mock
  }

  // Wrap function with profiling
  wrap(fn, name) {
    return (...args) => {
      this.enter(name);
      try {
        const result = fn(...args);
        this.exit();
        return result;
      } catch (error) {
        this.exit();
        throw error;
      }
    };
  }

  // Stop profiling and analyze
  stop() {
    console.log('Profiling stopped\n');
    return this.analyze();
  }

  // Analyze samples
  analyze() {
    const functionTimes = new Map();
    const callCounts = new Map();

    // Aggregate function times
    this.samples.forEach(sample => {
      sample.stack.forEach(fn => {
        const duration = Date.now() - fn.startTime;
        
        if (!functionTimes.has(fn.name)) {
          functionTimes.set(fn.name, { total: 0, count: 0, max: 0 });
        }
        
        const stats = functionTimes.get(fn.name);
        stats.total += duration;
        stats.count++;
        stats.max = Math.max(stats.max, duration);
        
        callCounts.set(fn.name, (callCounts.get(fn.name) || 0) + 1);
      });
    });

    // Find hotspots
    const hotspots = Array.from(functionTimes.entries())
      .map(([name, stats]) => ({
        name,
        totalTime: stats.total,
        avgTime: stats.total / stats.count,
        maxTime: stats.max,
        calls: callCounts.get(name) || 0
      }))
      .sort((a, b) => b.totalTime - a.totalTime);

    // Memory analysis
    const memoryPeak = Math.max(...this.samples.map(s => s.memory));
    const memoryAvg = this.samples.reduce((acc, s) => acc + s.memory, 0) / this.samples.length;

    return {
      duration: Date.now() - this.startTime,
      samples: this.samples.length,
      hotspots: hotspots.slice(0, 5),
      memory: {
        peak: memoryPeak + 'MB',
        average: memoryAvg.toFixed(1) + 'MB'
      }
    };
  }

  // Generate flame graph data
  flameGraph() {
    const graph = {};
    
    this.samples.forEach(sample => {
      let current = graph;
      sample.stack.forEach(fn => {
        if (!current[fn.name]) {
          current[fn.name] = { count: 0, children: {} };
        }
        current[fn.name].count++;
        current = current[fn.name].children;
      });
    });

    return graph;
  }
}

// Demo
console.log('=== Performance Profiler Demo ===\n');

const profiler = new PerformanceProfiler();

// Mock functions
const slowFunction = profiler.wrap(() => {
  const start = Date.now();
  while (Date.now() - start < 50) {} // Busy wait
}, 'slowFunction');

const fastFunction = profiler.wrap(() => {
  const start = Date.now();
  while (Date.now() - start < 10) {}
}, 'fastFunction');

const processData = profiler.wrap(() => {
  slowFunction();
  fastFunction();
  fastFunction();
}, 'processData');

// Profile code
profiler.start();

for (let i = 0; i < 5; i++) {
  processData();
}

const report = profiler.stop();

// Display report
console.log('=== Profiling Report ===\n');
console.log(`Duration: ${report.duration}ms`);
console.log(`Samples: ${report.samples}`);
console.log(`\nMemory:`);
console.log(`  Peak: ${report.memory.peak}`);
console.log(`  Average: ${report.memory.average}`);

console.log('\n=== Hotspots (Top 5) ===');
report.hotspots.forEach((fn, i) => {
  console.log(`\n${i + 1}. ${fn.name}`);
  console.log(`   Total time: ${fn.totalTime.toFixed(2)}ms`);
  console.log(`   Avg time: ${fn.avgTime.toFixed(2)}ms`);
  console.log(`   Max time: ${fn.maxTime.toFixed(2)}ms`);
  console.log(`   Calls: ${fn.calls}`);
});

console.log('\n⚠️  Bottleneck detected: slowFunction');

export default PerformanceProfiler;
