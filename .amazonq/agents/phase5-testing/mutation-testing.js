// Minimal Mutation Testing - Code Mutations, Test Effectiveness
class MutationTester {
  constructor() {
    this.mutations = [];
    this.killed = 0;
    this.survived = 0;
  }

  // Mutation operators
  mutateArithmetic(code) {
    return [
      code.replace(/\+/g, '-'),
      code.replace(/-/g, '+'),
      code.replace(/\*/g, '/'),
      code.replace(/\//g, '*')
    ];
  }

  mutateComparison(code) {
    return [
      code.replace(/===/g, '!=='),
      code.replace(/>/g, '<'),
      code.replace(/</g, '>'),
      code.replace(/>=/g, '<='),
      code.replace(/<=/g, '>=')
    ];
  }

  mutateLogical(code) {
    return [
      code.replace(/&&/g, '||'),
      code.replace(/\|\|/g, '&&'),
      code.replace(/!/g, '')
    ];
  }

  mutateConstants(code) {
    return [
      code.replace(/\b0\b/g, '1'),
      code.replace(/\b1\b/g, '0'),
      code.replace(/true/g, 'false'),
      code.replace(/false/g, 'true')
    ];
  }

  // Generate all mutations
  generateMutations(code) {
    const mutations = [
      ...this.mutateArithmetic(code),
      ...this.mutateComparison(code),
      ...this.mutateLogical(code),
      ...this.mutateConstants(code)
    ];

    return [...new Set(mutations)].filter(m => m !== code);
  }

  // Test mutation
  testMutation(mutatedCode, testSuite) {
    try {
      // Execute mutated code
      const mutatedFn = new Function('return ' + mutatedCode)();
      
      // Run tests
      for (const test of testSuite) {
        const result = test(mutatedFn);
        if (!result) {
          return 'killed'; // Test caught the mutation
        }
      }
      
      return 'survived'; // Mutation not detected
    } catch (error) {
      return 'killed'; // Mutation caused error
    }
  }

  // Run mutation testing
  run(originalCode, testSuite) {
    console.log('Generating mutations...');
    const mutations = this.generateMutations(originalCode);
    console.log(`Generated ${mutations.length} mutations\n`);

    this.killed = 0;
    this.survived = 0;
    this.mutations = [];

    mutations.forEach((mutation, i) => {
      const status = this.testMutation(mutation, testSuite);
      
      this.mutations.push({ id: i + 1, code: mutation, status });
      
      if (status === 'killed') {
        this.killed++;
      } else {
        this.survived++;
        console.log(`Mutation ${i + 1} survived: ${mutation.substring(0, 50)}...`);
      }
    });

    return this.getReport();
  }

  getReport() {
    const total = this.killed + this.survived;
    const score = total > 0 ? (this.killed / total * 100).toFixed(1) : 0;
    
    return {
      total,
      killed: this.killed,
      survived: this.survived,
      mutationScore: score + '%'
    };
  }
}

// Demo
console.log('=== Mutation Testing Demo ===\n');

const mt = new MutationTester();

// Original function
const originalCode = `
  function(x, y) {
    if (x > 0 && y > 0) {
      return x + y;
    }
    return 0;
  }
`;

// Test suite
const testSuite = [
  (fn) => fn(5, 3) === 8,
  (fn) => fn(-1, 5) === 0,
  (fn) => fn(0, 0) === 0
];

console.log('Original function:');
console.log(originalCode);

console.log('\nTest suite:');
testSuite.forEach((test, i) => {
  console.log(`  Test ${i + 1}: ${test.toString().split('=>')[1].trim()}`);
});

console.log('\n--- Running Mutation Tests ---\n');
const report = mt.run(originalCode, testSuite);

console.log('\n=== Mutation Testing Report ===');
console.log(`Total mutations: ${report.total}`);
console.log(`Killed: ${report.killed}`);
console.log(`Survived: ${report.survived}`);
console.log(`Mutation Score: ${report.mutationScore}`);

if (report.survived > 0) {
  console.log('\n⚠️  Some mutations survived - tests may be incomplete!');
} else {
  console.log('\n✓ All mutations killed - strong test suite!');
}

export default MutationTester;
