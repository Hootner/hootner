// Optimization Analyzer - Find performance improvements
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class OptimizationAnalyzer {
  constructor() {
    this.results = { files: 0, issues: [] };
  }

  analyze() {
    console.log('=== Optimization Analysis ===\n');
    
    const categories = fs.readdirSync(__dirname)
      .filter(f => fs.statSync(path.join(__dirname, f)).isDirectory());

    categories.forEach(cat => this.analyzeCategory(cat));
    this.report();
  }

  analyzeCategory(category) {
    const dir = path.join(__dirname, category);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      this.analyzeFile(category, file, code);
    });
  }

  analyzeFile(category, file, code) {
    this.results.files++;
    const lines = code.split('\n');

    // Check for optimization opportunities
    if (code.includes('console.log') && !file.includes('demo')) {
      this.results.issues.push({
        file: `${category}/${file}`,
        type: 'performance',
        issue: 'Remove console.log in production',
        line: lines.findIndex(l => l.includes('console.log')) + 1
      });
    }

    // Check for inefficient loops
    if (code.match(/for.*\.length/g)) {
      this.results.issues.push({
        file: `${category}/${file}`,
        type: 'performance',
        issue: 'Cache array length in loops',
        line: lines.findIndex(l => l.includes('for') && l.includes('.length')) + 1
      });
    }

    // Check for repeated calculations
    const matches = code.match(/Date\.now\(\)/g);
    if (matches && matches.length > 3) {
      this.results.issues.push({
        file: `${category}/${file}`,
        type: 'performance',
        issue: 'Cache Date.now() calls',
        line: 0
      });
    }

    // Check file size
    if (lines.length > 150) {
      this.results.issues.push({
        file: `${category}/${file}`,
        type: 'size',
        issue: `File too large (${lines.length} lines)`,
        line: 0
      });
    }
  }

  report() {
    console.log(`Analyzed ${this.results.files} files\n`);
    console.log(`Found ${this.results.issues.length} optimization opportunities:\n`);

    const byType = {};
    this.results.issues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });

    Object.entries(byType).forEach(([type, count]) => {
      console.log(`${type}: ${count}`);
    });

    console.log('\nTop issues:');
    this.results.issues.slice(0, 10).forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
    });
  }
}

const analyzer = new OptimizationAnalyzer();
analyzer.analyze();
