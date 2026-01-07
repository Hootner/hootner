// Runtime Environment - Layer 4.5
// Node.js-like runtime with event loop

class Runtime {
  constructor() {
    this.eventLoop = [];
    this.timers = [];
    this.microtasks = [];
    this.macrotasks = [];
    this.running = false;
    this.time = 0;
  }

  // setTimeout
  setTimeout(fn, delay) {
    const id = this.timers.length;
    this.timers.push({
      id,
      fn,
      time: this.time + delay,
      type: 'timeout'
    });
    return id;
  }

  // setInterval
  setInterval(fn, delay) {
    const id = this.timers.length;
    this.timers.push({
      id,
      fn,
      time: this.time + delay,
      interval: delay,
      type: 'interval'
    });
    return id;
  }

  // clearTimeout/clearInterval
  clear(id) {
    this.timers = this.timers.filter(t => t.id !== id);
  }

  // setImmediate (macrotask)
  setImmediate(fn) {
    this.macrotasks.push(fn);
  }

  // process.nextTick (microtask)
  nextTick(fn) {
    this.microtasks.push(fn);
  }

  // Promise (microtask)
  Promise(executor) {
    return new Promise((resolve, reject) => {
      executor(
        (value) => this.nextTick(() => resolve(value)),
        (error) => this.nextTick(() => reject(error))
      );
    });
  }

  // Event loop phases
  tick() {
    this.time++;

    // 1. Timers phase
    this.processTimers();

    // 2. I/O callbacks
    // (simulated)

    // 3. Idle, prepare
    // (internal)

    // 4. Poll
    // (simulated)

    // 5. Check (setImmediate)
    this.processMacrotasks();

    // 6. Close callbacks
    // (simulated)

    // Process microtasks after each phase
    this.processMicrotasks();
  }

  processTimers() {
    const ready = this.timers.filter(t => t.time <= this.time);
    
    ready.forEach(timer => {
      timer.fn();
      
      if (timer.type === 'interval') {
        timer.time = this.time + timer.interval;
      } else {
        this.timers = this.timers.filter(t => t.id !== timer.id);
      }
    });
  }

  processMicrotasks() {
    while (this.microtasks.length > 0) {
      const fn = this.microtasks.shift();
      fn();
    }
  }

  processMacrotasks() {
    if (this.macrotasks.length > 0) {
      const fn = this.macrotasks.shift();
      fn();
    }
  }

  // Run event loop
  run(maxTicks = 100) {
    this.running = true;
    let ticks = 0;

    while (this.running && ticks < maxTicks) {
      if (this.timers.length === 0 && 
          this.microtasks.length === 0 && 
          this.macrotasks.length === 0) {
        break;
      }

      this.tick();
      ticks++;
    }

    console.log(`[RUNTIME] Completed ${ticks} ticks`);
  }

  // Stop runtime
  stop() {
    this.running = false;
  }
}

// Demo
const runtime = new Runtime();

console.log('=== Runtime Demo ===\n');

// Microtask (nextTick)
runtime.nextTick(() => console.log('1. nextTick'));

// Macrotask (setImmediate)
runtime.setImmediate(() => console.log('2. setImmediate'));

// Timer
runtime.setTimeout(() => console.log('3. setTimeout 10ms'), 10);
runtime.setTimeout(() => console.log('4. setTimeout 5ms'), 5);

// Interval
let count = 0;
const interval = runtime.setInterval(() => {
  console.log(`5. setInterval (${++count})`);
  if (count >= 3) runtime.clear(interval);
}, 15);

// Nested
runtime.setTimeout(() => {
  console.log('6. Outer timeout');
  runtime.nextTick(() => console.log('7. Inner nextTick'));
}, 20);

console.log('Starting event loop...\n');
runtime.run();

export default Runtime;
