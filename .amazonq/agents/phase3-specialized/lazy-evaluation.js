// Minimal Lazy Evaluation - Thunks, Memoization, Infinite Sequences
class Thunk {
  constructor(fn) {
    this.fn = fn;
    this.evaluated = false;
    this.value = null;
  }

  force() {
    if (!this.evaluated) {
      this.value = this.fn();
      this.evaluated = true;
    }
    return this.value;
  }
}

class LazyList {
  constructor(head, tailThunk) {
    this.head = head;
    this.tailThunk = tailThunk;
  }

  tail() {
    return this.tailThunk.force();
  }

  take(n) {
    if (n === 0) return [];
    return [this.head, ...this.tail().take(n - 1)];
  }

  map(fn) {
    return new LazyList(
      fn(this.head),
      new Thunk(() => this.tail().map(fn))
    );
  }

  filter(pred) {
    if (pred(this.head)) {
      return new LazyList(
        this.head,
        new Thunk(() => this.tail().filter(pred))
      );
    }
    return this.tail().filter(pred);
  }

  static range(start = 0) {
    return new LazyList(
      start,
      new Thunk(() => LazyList.range(start + 1))
    );
  }

  static fibonacci() {
    const fib = (a, b) => new LazyList(
      a,
      new Thunk(() => fib(b, a + b))
    );
    return fib(0, 1);
  }

  static primes() {
    const sieve = list => {
      const p = list.head;
      return new LazyList(
        p,
        new Thunk(() => sieve(list.tail().filter(n => n % p !== 0)))
      );
    };
    return sieve(LazyList.range(2));
  }
}

class Lazy {
  static delay(fn) {
    return new Thunk(fn);
  }

  static force(thunk) {
    return thunk.force();
  }

  static memoize(fn) {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (!cache.has(key)) {
        cache.set(key, fn(...args));
      }
      return cache.get(key);
    };
  }
}

// Demo
console.log('=== Lazy Evaluation Demo ===\n');

console.log('--- Infinite range (first 10) ---');
const numbers = LazyList.range(1);
console.log(numbers.take(10));

console.log('\n--- Fibonacci sequence (first 15) ---');
const fibs = LazyList.fibonacci();
console.log(fibs.take(15));

console.log('\n--- Prime numbers (first 10) ---');
const primes = LazyList.primes();
console.log(primes.take(10));

console.log('\n--- Lazy map and filter ---');
const evens = LazyList.range(1)
  .filter(n => n % 2 === 0)
  .map(n => n * n);
console.log('First 5 even squares:', evens.take(5));

console.log('\n--- Thunk with side effects ---');
let count = 0;
const expensive = Lazy.delay(() => {
  console.log('Computing...');
  count++;
  return 42;
});

console.log('Thunk created (not evaluated yet)');
console.log('Force 1:', Lazy.force(expensive));
console.log('Force 2:', Lazy.force(expensive)); // Cached
console.log('Evaluation count:', count);

export { Lazy, LazyList, Thunk };
