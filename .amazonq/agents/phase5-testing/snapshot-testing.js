// Minimal Snapshot Testing - Serialization, Comparison, Updates
class SnapshotTester {
  constructor() {
    this.snapshots = new Map();
    this.failures = [];
  }

  // Serialize value to comparable string
  serialize(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (value instanceof RegExp) return value.toString();
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return '[' + value.map(v => this.serialize(v)).join(', ') + ']';
      }
      const keys = Object.keys(value).sort();
      return '{' + keys.map(k => `${k}: ${this.serialize(value[k])}`).join(', ') + '}';
    }
    
    return JSON.stringify(value);
  }

  // Match snapshot
  toMatchSnapshot(name, value) {
    const serialized = this.serialize(value);
    
    if (!this.snapshots.has(name)) {
      this.snapshots.set(name, serialized);
      console.log(`✓ Snapshot created: ${name}`);
      return true;
    }

    const existing = this.snapshots.get(name);
    if (existing === serialized) {
      console.log(`✓ Snapshot matched: ${name}`);
      return true;
    }

    this.failures.push({
      name,
      expected: existing,
      received: serialized,
      diff: this.diff(existing, serialized)
    });
    
    console.log(`✗ Snapshot mismatch: ${name}`);
    return false;
  }

  // Simple diff
  diff(expected, received) {
    const expLines = expected.split('\n');
    const recLines = received.split('\n');
    const maxLen = Math.max(expLines.length, recLines.length);
    
    const changes = [];
    for (let i = 0; i < maxLen; i++) {
      if (expLines[i] !== recLines[i]) {
        changes.push({
          line: i + 1,
          expected: expLines[i] || '(empty)',
          received: recLines[i] || '(empty)'
        });
      }
    }
    return changes;
  }

  // Update snapshots
  updateSnapshots() {
    console.log('\nUpdating snapshots...');
    this.failures.forEach(f => {
      this.snapshots.set(f.name, f.received);
      console.log(`  Updated: ${f.name}`);
    });
    this.failures = [];
  }

  // Report
  report() {
    if (this.failures.length === 0) {
      console.log('\n✓ All snapshots matched');
      return;
    }

    console.log(`\n✗ ${this.failures.length} snapshot(s) failed:\n`);
    this.failures.forEach(f => {
      console.log(`${f.name}:`);
      console.log(`  Expected: ${f.expected.substring(0, 50)}...`);
      console.log(`  Received: ${f.received.substring(0, 50)}...`);
      if (f.diff.length > 0) {
        console.log(`  Differences at lines: ${f.diff.map(d => d.line).join(', ')}`);
      }
      console.log();
    });
  }
}

// Demo
console.log('=== Snapshot Testing Demo ===\n');

const tester = new SnapshotTester();

// Test 1: Object snapshot
console.log('--- Test 1: User Object ---');
const user = { id: 1, name: 'Alice', email: 'alice@example.com' };
tester.toMatchSnapshot('user-object', user);

// Test 2: Array snapshot
console.log('\n--- Test 2: Numbers Array ---');
const numbers = [1, 2, 3, 4, 5];
tester.toMatchSnapshot('numbers-array', numbers);

// Test 3: Nested structure
console.log('\n--- Test 3: Nested Structure ---');
const nested = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ],
  meta: { count: 2, page: 1 }
};
tester.toMatchSnapshot('nested-structure', nested);

// Test 4: Re-run with same data (should match)
console.log('\n--- Re-running Tests ---');
tester.toMatchSnapshot('user-object', user);
tester.toMatchSnapshot('numbers-array', numbers);

// Test 5: Changed data (should fail)
console.log('\n--- Test with Changed Data ---');
const changedUser = { id: 1, name: 'Alice', email: 'alice@newdomain.com' };
tester.toMatchSnapshot('user-object', changedUser);

// Report
tester.report();

// Update snapshots
console.log('\n--- Update Mode ---');
tester.updateSnapshots();

// Re-run after update
console.log('\n--- After Update ---');
tester.toMatchSnapshot('user-object', changedUser);
tester.report();

export default SnapshotTester;
