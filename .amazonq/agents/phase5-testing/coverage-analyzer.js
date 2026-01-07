// Minimal Coverage Analyzer - Line, Branch, Function Coverage
class CoverageAnalyzer {
  constructor() {
    this.coverage = {
      lines: new Set(),
      branches: new Map(),
      functions: new Set()
    };
    this.totalLines = 0;
    this.totalBranches = 0;
    this.totalFunctions = 0;
  }

  // Instrument code with coverage tracking
  instrument(code, name = 'anonymous') {
    const lines = code.split('\n');
    this.totalLines = lines.length;
    
    // Count branches (if/else, ternary, switch)
    const branchMatches = code.match(/\b(if|else|switch|\?)\b/g) || [];
    this.totalBranches = branchMatches.length;
    
    // Count functions
    const fnMatches = code.match(/function\s+\w+|=>\s*{|^\s*\w+\s*\(/gm) || [];
    this.totalFunctions = fnMatches.length;

    // Wrap with coverage tracking
    const instrumented = lines.map((line, i) => {
      const lineNum = i + 1;
      if (line.trim() && !line.trim().startsWith('//')) {
        return `__coverage.trackLine(${lineNum}); ${line}`;
      }
      return line;
    }).join('\n');

    return instrumented;
  }

  trackLine(lineNum) {
    this.coverage.lines.add(lineNum);
  }

  trackBranch(branchId, taken) {
    if (!this.coverage.branches.has(branchId)) {
      this.coverage.branches.set(branchId, { true: 0, false: 0 });
    }
    this.coverage.branches.get(branchId)[taken]++;
  }

  trackFunction(fnName) {
    this.coverage.functions.add(fnName);
  }

  // Calculate coverage
  getReport() {
    const lineCoverage = (this.coverage.lines.size / this.totalLines * 100).toFixed(1);
    
    let branchCoverage = 0;
    if (this.totalBranches > 0) {
      const coveredBranches = Array.from(this.coverage.branches.values())
        .filter(b => b.true > 0 && b.false > 0).length;
      branchCoverage = (coveredBranches / this.totalBranches * 100).toFixed(1);
    }

    const fnCoverage = (this.coverage.functions.size / this.totalFunctions * 100).toFixed(1);

    return {
      lines: {
        covered: this.coverage.lines.size,
        total: this.totalLines,
        percentage: lineCoverage + '%'
      },
      branches: {
        covered: this.coverage.branches.size,
        total: this.totalBranches,
        percentage: branchCoverage + '%'
      },
      functions: {
        covered: this.coverage.functions.size,
        total: this.totalFunctions,
        percentage: fnCoverage + '%'
      }
    };
  }

  // Visual coverage map
  getCoverageMap(code) {
    const lines = code.split('\n');
    return lines.map((line, i) => {
      const lineNum = i + 1;
      const covered = this.coverage.lines.has(lineNum);
      const marker = covered ? '✓' : '✗';
      return `${marker} ${lineNum.toString().padStart(3)}: ${line}`;
    }).join('\n');
  }
}

// Demo
console.log('=== Coverage Analyzer Demo ===\n');

const analyzer = new CoverageAnalyzer();

// Sample code
const code = `
function add(a, b) {
  return a + b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

function max(a, b) {
  return a > b ? a : b;
}
`;

console.log('Original code:');
console.log(code);

// Instrument code
const instrumented = analyzer.instrument(code, 'math.js');

// Simulate test execution
console.log('\n--- Running Tests ---');
global.__coverage = analyzer;

try {
  eval(instrumented);
  
  // Test 1: Call add
  console.log('Test 1: add(2, 3)');
  add(2, 3);
  
  // Test 2: Call divide (success path)
  console.log('Test 2: divide(10, 2)');
  divide(10, 2);
  
  // Test 3: Call max
  console.log('Test 3: max(5, 3)');
  max(5, 3);
  
} catch (error) {
  console.error('Error:', error.message);
}

// Generate report
console.log('\n=== Coverage Report ===');
const report = analyzer.getReport();
console.log('Lines:', report.lines);
console.log('Branches:', report.branches);
console.log('Functions:', report.functions);

// Coverage map
console.log('\n=== Coverage Map ===');
console.log(analyzer.getCoverageMap(code));

console.log('\n⚠️  Note: divide error path not covered!');

export default CoverageAnalyzer;
