// Minimal Fuzzer - Random Input Generation, Crash Detection
class Fuzzer {
  constructor(config = {}) {
    this.maxIterations = config.maxIterations || 1000;
    this.timeout = config.timeout || 100;
    this.crashes = [];
    this.coverage = new Set();
  }

  // Generate random string
  randomString(maxLen = 20) {
    const len = Math.floor(Math.random() * maxLen) + 1;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !@#$%^&*()';
    return Array(len).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  // Generate random number
  randomNumber(min = -1000, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random array
  randomArray(maxLen = 10) {
    const len = Math.floor(Math.random() * maxLen);
    return Array(len).fill(0).map(() => this.randomNumber());
  }

  // Generate random object
  randomObject() {
    return {
      id: this.randomNumber(1, 100),
      name: this.randomString(10),
      value: this.randomNumber()
    };
  }

  // Mutate input (bit flipping, boundary values)
  mutate(input) {
    if (typeof input === 'string') {
      const mutations = [
        () => input + this.randomString(5),
        () => input.slice(0, -1),
        () => input.replace(/./g, 'A'),
        () => '',
        () => 'A'.repeat(1000)
      ];
      return mutations[Math.floor(Math.random() * mutations.length)]();
    }
    
    if (typeof input === 'number') {
      const mutations = [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, NaN, Infinity];
      return mutations[Math.floor(Math.random() * mutations.length)];
    }
    
    return input;
  }

  // Fuzz target function
  fuzz(targetFn, inputGenerator) {
    console.log(`Fuzzing with ${this.maxIterations} iterations...\n`);
    
    for (let i = 0; i < this.maxIterations; i++) {
      const input = inputGenerator();
      
      try {
        const result = targetFn(input);
        this.coverage.add(typeof result);
      } catch (error) {
        this.crashes.push({
          iteration: i,
          input,
          error: error.message,
          stack: error.stack
        });
      }
    }

    return this.getReport();
  }

  getReport() {
    return {
      iterations: this.maxIterations,
      crashes: this.crashes.length,
      crashRate: (this.crashes.length / this.maxIterations * 100).toFixed(2) + '%',
      uniqueCrashes: new Set(this.crashes.map(c => c.error)).size,
      coverage: this.coverage.size
    };
  }
}

// Demo: Fuzz vulnerable functions
console.log('=== Fuzzer Demo ===\n');

const fuzzer = new Fuzzer({ maxIterations: 1000 });

// Vulnerable function 1: Division
console.log('--- Fuzzing Division ---');
const divide = (x) => 100 / x;
const report1 = fuzzer.fuzz(divide, () => fuzzer.randomNumber(-10, 10));
console.log(report1);
console.log('Sample crashes:', fuzzer.crashes.slice(0, 3).map(c => c.input));

// Vulnerable function 2: Array access
console.log('\n--- Fuzzing Array Access ---');
fuzzer.crashes = [];
const arrayAccess = (arr) => arr[arr.length];
const report2 = fuzzer.fuzz(arrayAccess, () => fuzzer.randomArray(5));
console.log(report2);

// Vulnerable function 3: JSON parse
console.log('\n--- Fuzzing JSON Parse ---');
fuzzer.crashes = [];
const jsonParse = (str) => JSON.parse(str);
const report3 = fuzzer.fuzz(jsonParse, () => fuzzer.randomString(20));
console.log(report3);
console.log('Sample crash inputs:', fuzzer.crashes.slice(0, 3).map(c => c.input));

export default Fuzzer;
