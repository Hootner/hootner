// Minimal Static Code Analyzer
class Analyzer {
  analyze(code) {
    const issues = [];
    
    // Check for console.log
    if (code.match(/console\.log/g)) {
      issues.push({ type: 'warning', msg: 'console.log found' });
    }
    
    // Check for var
    if (code.match(/\bvar\b/g)) {
      issues.push({ type: 'error', msg: 'Use let/const instead of var' });
    }
    
    // Check for ==
    if (code.match(/[^=!]==(?!=)/g)) {
      issues.push({ type: 'warning', msg: 'Use === instead of ==' });
    }
    
    return issues;
  }
}

const analyzer = new Analyzer();
console.log(analyzer.analyze('var x = 1; if (x == 1) console.log(x);'));

export default Analyzer;
