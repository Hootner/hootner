// Minimal Coroutines - Yield, Resume, Cooperative Multitasking
class Coroutine {
  constructor(generator) {
    this.generator = generator;
    this.iterator = null;
    this.status = 'suspended';
  }

  start(...args) {
    this.iterator = this.generator(...args);
    this.status = 'running';
    return this.resume();
  }

  resume(value) {
    if (this.status === 'dead') {
      throw new Error('Cannot resume dead coroutine');
    }

    this.status = 'running';
    const result = this.iterator.next(value);

    if (result.done) {
      this.status = 'dead';
      return { done: true, value: result.value };
    }

    this.status = 'suspended';
    return { done: false, value: result.value };
  }

  isDead() {
    return this.status === 'dead';
  }
}

class Scheduler {
  constructor() {
    this.coroutines = [];
    this.current = 0;
  }

  spawn(generator, ...args) {
    const co = new Coroutine(generator);
    this.coroutines.push(co);
    co.start(...args);
  }

  run() {
    while (this.coroutines.some(co => !co.isDead())) {
      const co = this.coroutines[this.current];

      if (!co.isDead()) {
        const result = co.resume();
        if (result.value !== undefined) {
          console.log(`Coroutine ${this.current}: ${result.value}`);
        }
      }

      this.current = (this.current + 1) % this.coroutines.length;
    }
  }
}

// Demo
console.log('=== Coroutines Demo ===\n');

console.log('--- Simple coroutine ---');
function* counter(start, end) {
  for (let i = start; i <= end; i++) {
    yield `Count: ${i}`;
  }
  return 'Done';
}

const co = new Coroutine(counter);
console.log(co.start(1, 3));
console.log(co.resume());
console.log(co.resume());
console.log(co.resume());

console.log('\n--- Producer-Consumer ---');
function* producer() {
  for (let i = 1; i <= 5; i++) {
    yield `Produced: ${i}`;
  }
}

function* consumer() {
  for (let i = 1; i <= 5; i++) {
    yield `Consumed: ${i}`;
  }
}

const scheduler = new Scheduler();
scheduler.spawn(producer);
scheduler.spawn(consumer);
scheduler.run();

console.log('\n--- Cooperative tasks ---');
function* task(name, count) {
  for (let i = 1; i <= count; i++) {
    yield `${name}: step ${i}`;
  }
}

const scheduler2 = new Scheduler();
scheduler2.spawn(task, 'Task A', 3);
scheduler2.spawn(task, 'Task B', 3);
scheduler2.spawn(task, 'Task C', 3);
scheduler2.run();

export { Coroutine, Scheduler };
