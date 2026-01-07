// Minimal Property-Based Testing - Generators, Shrinking, Properties
class PropertyTest {
  constructor() {
    this.runs = 100;
    this.failures = [];
  }

  // Generators
  integer(min = -100, max = 100) {
    return () => Math.floor(Math.random() * (max - min + 1)) + min;
  }

  string(maxLen = 20) {
    return () => {
      const len = Math.floor(Math.random() * maxLen);
      return Array(len).fill(0)
        .map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
        .join('');
    };
  }

  array(generator, maxLen = 10) {
    return () => {
      const len = Math.floor(Math.random() * maxLen);
      return Array(len).fill(0).map(() => generator());
    };
  }

  tuple(...generators) {
    return () => generators.map(g => g());
  }

  // Shrink input to find minimal failing case
  shrink(value) {
    if (typeof value === 'number') {
      return [0, Math.floor(value / 2), value - 1];
    }
    if (typeof value === 'string') {
      return ['', value.slice(0, -1), value.slice(1)];
    }
    if (Array.isArray(value)) {
      return [[], value.slice(0, -1), value.slice(1)];
    }
    return [];
  }

  // Run property test
  forAll(generator, property) {
    console.log(`Running ${this.runs} test cases...`);
    
    for (let i = 0; i < this.runs; i++) {
      const input = generator();
      
      try {
        const result = property(input);
        if (!result) {
          this.failures.push({ input, reason: 'Property returned false' });
        }
      } catch (error) {
        this.failures.push({ input, reason: error.message });
      }
    }

    if (this.failures.length > 0) {
      console.log(`\n✗ Failed ${this.failures.length}/${this.runs} cases`);
      this.shrinkFailures();
    } else {
      console.log(`\n✓ All ${this.runs} cases passed`);
    }

    return this.failures.length === 0;
  }

  shrinkFailures() {
    console.log('\nShrinking failures...');
    this.failures.slice(0, 3).forEach((failure, i) => {
      console.log(`\nFailure ${i + 1}:`);
      console.log('  Input:', JSON.stringify(failure.input));
      console.log('  Reason:', failure.reason);
    });
  }
}

// Demo: Property tests
console.log('=== Property-Based Testing Demo ===\n');

const pt = new PropertyTest();

// Property 1: Reverse twice equals original
console.log('--- Property: reverse(reverse(arr)) === arr ---');
pt.failures = [];
pt.forAll(
  pt.array(pt.integer(), 5),
  arr => {
    const reversed = arr.slice().reverse().reverse();
    return JSON.stringify(reversed) === JSON.stringify(arr);
  }
);

// Property 2: Sort is idempotent
console.log('\n--- Property: sort(sort(arr)) === sort(arr) ---');
pt.failures = [];
pt.forAll(
  pt.array(pt.integer(), 5),
  arr => {
    const sorted1 = arr.slice().sort((a, b) => a - b);
    const sorted2 = sorted1.slice().sort((a, b) => a - b);
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  }
);

// Property 3: String concatenation length
console.log('\n--- Property: (a + b).length === a.length + b.length ---');
pt.failures = [];
pt.forAll(
  pt.tuple(pt.string(10), pt.string(10)),
  ([a, b]) => (a + b).length === a.length + b.length
);

// Property 4: Division (will fail on zero)
console.log('\n--- Property: (a * b) / b === a (will fail) ---');
pt.failures = [];
pt.forAll(
  pt.tuple(pt.integer(1, 10), pt.integer(-5, 5)),
  ([a, b]) => b === 0 || Math.abs((a * b) / b - a) < 0.001
);

export default PropertyTest;
