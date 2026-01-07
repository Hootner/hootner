// Minimal Contract Testing - Provider/Consumer, Schema Validation
class ContractTester {
  constructor() {
    this.contracts = new Map();
    this.violations = [];
  }

  // Define contract
  defineContract(name, schema) {
    this.contracts.set(name, schema);
  }

  // Validate response against contract
  validate(contractName, response) {
    const schema = this.contracts.get(contractName);
    if (!schema) {
      throw new Error(`Contract ${contractName} not found`);
    }

    const violations = this.checkSchema(schema, response, contractName);
    
    if (violations.length > 0) {
      this.violations.push(...violations);
      console.log(`✗ Contract violated: ${contractName}`);
      return false;
    }

    console.log(`✓ Contract satisfied: ${contractName}`);
    return true;
  }

  checkSchema(schema, data, path = '') {
    const violations = [];

    // Check type
    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        violations.push({
          path,
          expected: `type: ${schema.type}`,
          actual: `type: ${actualType}`
        });
      }
    }

    // Check required fields
    if (schema.required && schema.type === 'object') {
      schema.required.forEach(field => {
        if (!(field in data)) {
          violations.push({
            path: `${path}.${field}`,
            expected: 'required field',
            actual: 'missing'
          });
        }
      });
    }

    // Check properties
    if (schema.properties && schema.type === 'object') {
      Object.entries(schema.properties).forEach(([key, propSchema]) => {
        if (key in data) {
          violations.push(...this.checkSchema(propSchema, data[key], `${path}.${key}`));
        }
      });
    }

    // Check array items
    if (schema.items && schema.type === 'array') {
      data.forEach((item, i) => {
        violations.push(...this.checkSchema(schema.items, item, `${path}[${i}]`));
      });
    }

    // Check enum
    if (schema.enum && !schema.enum.includes(data)) {
      violations.push({
        path,
        expected: `one of: ${schema.enum.join(', ')}`,
        actual: data
      });
    }

    return violations;
  }

  // Report violations
  report() {
    if (this.violations.length === 0) {
      console.log('\n✓ All contracts satisfied');
      return;
    }

    console.log(`\n✗ ${this.violations.length} contract violation(s):\n`);
    this.violations.forEach(v => {
      console.log(`  ${v.path}:`);
      console.log(`    Expected: ${v.expected}`);
      console.log(`    Actual: ${v.actual}`);
    });
  }
}

// Demo: API contract testing
console.log('=== Contract Testing Demo ===\n');

const tester = new ContractTester();

// Define contracts
tester.defineContract('getUserResponse', {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'user', 'guest'] }
  }
});

tester.defineContract('getPostsResponse', {
  type: 'array',
  items: {
    type: 'object',
    required: ['id', 'title', 'author'],
    properties: {
      id: { type: 'number' },
      title: { type: 'string' },
      author: { type: 'string' }
    }
  }
});

// Test 1: Valid response
console.log('--- Test 1: Valid User Response ---');
const validUser = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin'
};
tester.validate('getUserResponse', validUser);

// Test 2: Missing required field
console.log('\n--- Test 2: Missing Email ---');
const invalidUser = {
  id: 2,
  name: 'Bob',
  role: 'user'
};
tester.validate('getUserResponse', invalidUser);

// Test 3: Wrong type
console.log('\n--- Test 3: Wrong ID Type ---');
const wrongType = {
  id: '3',
  name: 'Charlie',
  email: 'charlie@example.com',
  role: 'guest'
};
tester.validate('getUserResponse', wrongType);

// Test 4: Invalid enum
console.log('\n--- Test 4: Invalid Role ---');
const invalidEnum = {
  id: 4,
  name: 'Dave',
  email: 'dave@example.com',
  role: 'superadmin'
};
tester.validate('getUserResponse', invalidEnum);

// Test 5: Valid array
console.log('\n--- Test 5: Valid Posts Array ---');
const validPosts = [
  { id: 1, title: 'First Post', author: 'Alice' },
  { id: 2, title: 'Second Post', author: 'Bob' }
];
tester.validate('getPostsResponse', validPosts);

// Report
tester.report();

export default ContractTester;
