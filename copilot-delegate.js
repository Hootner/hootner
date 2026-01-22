#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_FILE = 'copilot-tasks.json';

class CopilotTaskManager {
  constructor() {
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    try {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    } catch {
      return { tasks: [], completed: [] };
    }
  }

  saveTasks() {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(this.tasks, null, 2));
  }

  delegate(description, files = [], priority = 'medium') {
    const task = {
      id: Date.now(),
      description,
      files,
      priority,
      status: 'pending',
      created: new Date().toISOString(),
      copilotInstructions: this.generateInstructions(description, files)
    };
    
    this.tasks.tasks.push(task);
    this.saveTasks();
    
    console.log(chalk.green(`✅ Task delegated: ${description}`));
    console.log(chalk.cyan('📋 Copilot Instructions:'));
    console.log(task.copilotInstructions);
    return task.id;
  }

  generateInstructions(description, files) {
    return `@workspace ${description}
Files to focus on: ${files.join(', ') || 'any relevant files'}
Use /fix for code issues
Use Ctrl+I for inline suggestions
Comment your changes with // COPILOT: [description]`;
  }

  monitor() {
    console.log(chalk.blue('🔍 Monitoring Copilot Progress...\n'));
    
    if (this.tasks.tasks.length === 0) {
      console.log(chalk.gray('No active tasks. Use "delegate" to create a task.'));
      return;
    }
    
    this.tasks.tasks.forEach(task => {
      const status = this.checkTaskStatus(task);
      console.log(`${this.getStatusIcon(status)} Task ${task.id}: ${task.description}`);
      console.log(`   Priority: ${task.priority} | Status: ${status}\n`);
    });
  }

  checkTaskStatus(task) {
    // Check if files have COPILOT comments indicating work
    const hasChanges = task.files.some(file => {
      try {
        const safeFilePath = path.resolve(file);
        const content = fs.readFileSync(safeFilePath, 'utf8');
        return content.includes('// COPILOT:');
      } catch {
        return false;
      }
    });
    
    return hasChanges ? 'in-progress' : 'pending';
  }

  getStatusIcon(status) {
    const icons = {
      'pending': '⏳',
      'in-progress': '🔄',
      'completed': '✅'
    };
    return icons[status] || '❓';
  }

  complete(taskId) {
    const taskIndex = this.tasks.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const task = this.tasks.tasks.splice(taskIndex, 1)[0];
      task.status = 'completed';
      task.completed = new Date().toISOString();
      this.tasks.completed.push(task);
      this.saveTasks();
      console.log(chalk.green(`✅ Task ${taskId} marked complete`));
    } else {
      console.log(chalk.red(`❌ Task ${taskId} not found`));
    }
  }

  // Code Analysis
  analyze(filePath) {
    console.log(chalk.blue('🔍 Running code analysis...\n'));
    
    if (!filePath) {
      console.log(chalk.red('❌ Error: File path is required'));
      console.log(chalk.yellow('Usage: node copilot-delegate.js analyze <file>'));
      return;
    }

    const safeFilePath = path.resolve(filePath);
    if (!fs.existsSync(safeFilePath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    const content = fs.readFileSync(safeFilePath, 'utf8');
    let issueCount = 0;

    console.log(chalk.cyan(`📄 Analyzing: ${filePath}\n`));

    // Security checks
    const securityPatterns = [
      { pattern: /eval\s*\(/gi, severity: '🔴', message: 'eval() usage detected - Remote Code Execution risk' },
      { pattern: /innerHTML\s*=/gi, severity: '🔴', message: 'innerHTML usage - XSS vulnerability risk' },
      { pattern: /dangerouslySetInnerHTML/gi, severity: '🔴', message: 'dangerouslySetInnerHTML - XSS risk' },
      { pattern: /(password|secret|api[_-]?key|token)\s*=\s*['"]/gi, severity: '🔴', message: 'Hardcoded credentials detected' },
      { pattern: /exec\s*\(|spawn\s*\(/gi, severity: '🟡', message: 'Command execution - potential injection risk' },
      { pattern: /localStorage\.setItem.*password/gi, severity: '🔴', message: 'Password stored in localStorage' }
    ];

    console.log(chalk.bold('🔒 Security Issues:'));
    securityPatterns.forEach(({ pattern, severity, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  ${severity} ${message} (${matches.length} occurrence(s))`);
        issueCount++;
      }
    });

    // Performance checks
    console.log(chalk.bold('\n⚡ Performance Concerns:'));
    const performancePatterns = [
      { pattern: /for\s*\([^)]*\)\s*{[^}]*for\s*\(/gi, message: 'Nested loops detected - O(n²) or worse complexity' },
      { pattern: /JSON\.parse\([^)]*JSON\.stringify/gi, message: 'Chained JSON parse/stringify - inefficient pattern' },
      { pattern: /\.map\([^)]*\)\.filter\([^)]*\)\.reduce/gi, message: 'Chained array operations - consider single iteration' },
      { pattern: /setInterval|setTimeout/gi, message: 'Timer usage - ensure cleanup in useEffect/componentWillUnmount' }
    ];

    performancePatterns.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  🟡 ${message}`);
        issueCount++;
      }
    });

    // Style/Quality checks
    console.log(chalk.bold('\n🔵 Code Quality:'));
    const lines = content.split('\n');
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 0) {
      console.log(`  🔵 ${longLines.length} line(s) exceed 120 characters`);
    }

    const complexityPattern = /if\s*\([^)]*&&[^)]*&&[^)]*\)/gi;
    const complexConditions = content.match(complexityPattern);
    if (complexConditions) {
      console.log(`  🔵 ${complexConditions.length} complex conditional(s) - consider refactoring`);
    }

    // Summary
    console.log(chalk.bold('\n📊 Analysis Summary:'));
    console.log(`  Total issues found: ${issueCount}`);
    
    if (issueCount > 0) {
      console.log(chalk.yellow('\n💡 Tip: Use Copilot Chat (Ctrl+I) to apply these suggestions'));
      console.log(chalk.cyan(`Run: node copilot-delegate.js delegate "Fix issues in ${filePath}" ${filePath}`));
    } else {
      console.log(chalk.green('\n✅ No major issues detected!'));
    }
  }

  // Security Audit
  security() {
    console.log(chalk.blue('🔒 Running Security Audit...\n'));

    const filesToScan = this.findJavaScriptFiles('.');
    let totalIssues = 0;

    const securityChecks = [
      { pattern: /(password|secret|api[_-]?key|token)\s*=\s*['"]/gi, message: 'Hardcoded crypto keys' },
      { pattern: /exec\s*\(|spawn\s*\(/gi, message: 'Potential command injection' },
      { pattern: /innerHTML\s*=|dangerouslySetInnerHTML/gi, message: 'Template injection risk' },
      { pattern: /eval\s*\(/gi, message: 'eval() usage - code injection risk' }
    ];

    filesToScan.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        securityChecks.forEach(({ pattern, message }) => {
          if (pattern.test(content)) {
            console.log(chalk.red(`  ❌ ${file}: ${message}`));
            totalIssues++;
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });

    if (totalIssues === 0) {
      console.log(chalk.green('✅ No security issues found'));
    } else {
      console.log(chalk.yellow(`\n⚠️  Audit complete: ${totalIssues} potential issue(s) found`));
    }
  }

  // Refactoring Suggestions
  refactor(filePath) {
    console.log(chalk.blue('♻️  Refactoring suggestions...\n'));

    if (!filePath) {
      console.log(chalk.red('❌ Error: File path is required'));
      console.log(chalk.yellow('Usage: node copilot-delegate.js refactor <file>'));
      return;
    }

    const safeFilePath = path.resolve(filePath);
    if (!fs.existsSync(safeFilePath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    const content = fs.readFileSync(safeFilePath, 'utf8');
    const suggestions = [];

    console.log(chalk.cyan(`📄 Analyzing: ${filePath}\n`));

    // Check for repeated patterns
    const filterMatches = content.match(/\.filter\(/g);
    if (filterMatches && filterMatches.length > 3) {
      suggestions.push(`Extract common pattern ".filter(" into utility function (appears ${filterMatches.length} times)`);
    }

    const mapMatches = content.match(/\.map\(/g);
    if (mapMatches && mapMatches.length > 5) {
      suggestions.push(`Consider extracting repeated ".map(" patterns into reusable functions (appears ${mapMatches.length} times)`);
    }

    // Single-line functions that could be arrow functions
    const functionPattern = /function\s+\w+\s*\([^)]*\)\s*{\s*return\s+[^;]+;\s*}/g;
    const singleLineFunctions = content.match(functionPattern);
    if (singleLineFunctions) {
      suggestions.push(`Convert ${singleLineFunctions.length} single-line function(s) to arrow functions`);
    }

    // Duplicate error handlers
    const catchBlocks = content.match(/catch\s*\([^)]*\)\s*{/g);
    if (catchBlocks && catchBlocks.length > 2) {
      suggestions.push(`Consolidate ${catchBlocks.length} error handlers into common error handling utility`);
    }

    // Complex conditionals
    const complexIf = content.match(/if\s*\([^)]*&&[^)]*&&[^)]*\)/g);
    if (complexIf && complexIf.length > 0) {
      suggestions.push(`Simplify ${complexIf.length} complex conditional(s) using guard clauses or extracted functions`);
    }

    // Magic numbers
    const magicNumbers = content.match(/\b(100|200|300|400|500|1000|3600|86400)\b/g);
    if (magicNumbers && magicNumbers.length > 3) {
      suggestions.push('Extract magic numbers into named constants');
    }

    // Display suggestions
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
      console.log(chalk.yellow('\n💡 Tip: Use Copilot Chat (Ctrl+I) to apply these suggestions'));
      console.log(chalk.cyan(`Run: node copilot-delegate.js delegate "Apply refactoring to ${filePath}" ${filePath}`));
    } else {
      console.log(chalk.green('✅ No major refactoring opportunities found'));
    }
  }

  // Performance Optimization
  optimize(filePath) {
    console.log(chalk.blue('⚡ Performance analysis...\n'));

    if (!filePath) {
      console.log(chalk.red('❌ Error: File path is required'));
      console.log(chalk.yellow('Usage: node copilot-delegate.js optimize <file>'));
      return;
    }

    const safeFilePath = path.resolve(filePath);
    if (!fs.existsSync(safeFilePath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    const content = fs.readFileSync(safeFilePath, 'utf8');
    const optimizations = [];

    console.log(chalk.cyan(`📄 Analyzing: ${filePath}\n`));

    // Nested loops
    if (/for\s*\([^)]*\)\s*{[^}]*for\s*\(/gi.test(content)) {
      optimizations.push('Nested loops detected - Consider using hash maps or Set for O(n) lookup');
    }

    // Chained array operations
    if (/\.map\([^)]*\)\.filter\([^)]*\)/gi.test(content)) {
      optimizations.push('Chain multiple .map() and .filter() calls; consider reducing to single iteration');
    }

    // Repeated JSON parsing
    if (/JSON\.parse.*JSON\.parse/gi.test(content)) {
      optimizations.push('Cache parsed JSON objects instead of parsing repeatedly');
    }

    // Timer cleanup
    const timerUsage = content.match(/setInterval|setTimeout/gi);
    const cleanupUsage = content.match(/clearInterval|clearTimeout/gi);
    if (timerUsage && (!cleanupUsage || cleanupUsage.length < timerUsage.length)) {
      optimizations.push('Ensure timers are cleared in cleanup functions (useEffect return)');
    }

    // Regex in loops
    if (/for\s*\([^)]*\)\s*{[^}]*new\s+RegExp/gi.test(content)) {
      optimizations.push('Move RegExp creation outside of loops for better performance');
    }

    // Display optimizations
    if (optimizations.length > 0) {
      optimizations.forEach((opt, index) => {
        console.log(`  ${index + 1}. ${opt}`);
      });
      console.log(chalk.yellow(`\nRun: node copilot-delegate.js delegate "Optimize ${filePath}" ${filePath}`));
    } else {
      console.log(chalk.green('✅ No obvious performance issues found'));
    }
  }

  // Generate Documentation
  docs(filePath) {
    console.log(chalk.blue('📚 Generating documentation suggestions...\n'));

    if (!filePath) {
      console.log(chalk.red('❌ Error: File path is required'));
      console.log(chalk.yellow('Usage: node copilot-delegate.js docs <file>'));
      return;
    }

    const safeFilePath = path.resolve(filePath);
    if (!fs.existsSync(safeFilePath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    const content = fs.readFileSync(safeFilePath, 'utf8');
    
    console.log(chalk.cyan(`📄 Analyzing: ${filePath}\n`));

    // Extract function signatures
    const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
    const arrowFunctionPattern = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    const classMethodPattern = /(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g;

    const functions = [];
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      functions.push({ name: match[1], params: match[2] || 'none' });
    }

    while ((match = arrowFunctionPattern.exec(content)) !== null) {
      functions.push({ name: match[1], params: match[2] || 'none' });
    }

    // Display exported functions
    if (functions.length > 0) {
      console.log(chalk.bold('📋 Exported Functions:\n'));
      functions.forEach(func => {
        console.log(chalk.cyan(`  • ${func.name}(${func.params})`));
        console.log(chalk.gray(`    JSDoc: /**\n     * @param {type} ${func.params || 'none'}\n     * @returns {type}\n     */\n`));
      });
    } else {
      console.log(chalk.yellow('No exported functions found'));
    }

    // Check for existing documentation
    const hasJSDoc = content.includes('/**');
    const hasTypeAnnotations = content.includes('@param') || content.includes('@returns');

    console.log(chalk.bold('📊 Documentation Status:'));
    console.log(`  JSDoc comments: ${hasJSDoc ? '✅ Present' : '❌ Missing'}`);
    console.log(`  Type annotations: ${hasTypeAnnotations ? '✅ Present' : '❌ Missing'}`);

    if (!hasJSDoc || !hasTypeAnnotations) {
      console.log(chalk.yellow('\n💡 Tip: Use Copilot Chat to generate comprehensive JSDoc comments'));
      console.log(chalk.cyan(`Run: node copilot-delegate.js delegate "Add JSDoc to ${filePath}" ${filePath}`));
    }
  }

  // Validate Commits
  validate() {
    console.log(chalk.blue('✅ Validating commit...\n'));
    
    try {
      // Import and run the commit validator
      import('./commit-validator.js').then(() => {
        console.log(chalk.green('Commit validation completed'));
      }).catch(error => {
        console.log(chalk.red('❌ Validation failed:'), error.message);
        process.exit(1);
      });
    } catch (error) {
      console.log(chalk.yellow('⚠️  Commit validator not available'));
      console.log(chalk.gray('Install: npm install --save-dev @commitlint/cli'));
    }
  }

  // Helper: Find JavaScript files
  findJavaScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && !file.includes('node_modules')) {
        this.findJavaScriptFiles(filePath, fileList);
      } else if (file.endsWith('.js') && !file.includes('.test.') && !file.includes('.spec.')) {
        fileList.push(filePath);
      }
    });
    
    return fileList.slice(0, 20); // Limit to first 20 files for performance
  }

  // Show help
  showHelp() {
    console.log(chalk.bold.blue('\n🤖 GitHub Copilot CLI - Enhanced Prompt Guide\n'));
    console.log(chalk.bold('Task Delegation:'));
    console.log('  node copilot-delegate.js delegate "Add retry logic" src/api.js');
    console.log('  node copilot-delegate.js monitor');
    console.log('  node copilot-delegate.js complete <taskId>\n');
    
    console.log(chalk.bold('Code Analysis:'));
    console.log('  node copilot-delegate.js analyze src/handlers/auth.js\n');
    
    console.log(chalk.bold('Security Audit:'));
    console.log('  node copilot-delegate.js security\n');
    
    console.log(chalk.bold('Refactoring:'));
    console.log('  node copilot-delegate.js refactor src/components/Player.js\n');
    
    console.log(chalk.bold('Performance:'));
    console.log('  node copilot-delegate.js optimize src/algorithms/search.js\n');
    
    console.log(chalk.bold('Documentation:'));
    console.log('  node copilot-delegate.js docs src/services/VideoPlayer.js\n');
    
    console.log(chalk.bold('Validation:'));
    console.log('  node copilot-delegate.js validate\n');
  }
}

// CLI Interface
const manager = new CopilotTaskManager();
const [,, command, ...args] = process.argv;

switch (command) {
  case 'delegate': {
    const [description, ...files] = args;
    if (!description) {
      console.log(chalk.red('❌ Error: Description is required'));
      console.log(chalk.yellow('Usage: node copilot-delegate.js delegate "description" [files...]'));
    } else {
      manager.delegate(description, files);
    }
    break;
  }
  case 'monitor': {
    manager.monitor();
    break;
  }
  case 'complete': {
    const taskId = parseInt(args[0]);
    if (isNaN(taskId)) {
      console.log(chalk.red('❌ Error: Invalid task ID'));
    } else {
      manager.complete(taskId);
    }
    break;
  }
  case 'analyze': {
    manager.analyze(args[0]);
    break;
  }
  case 'security': {
    manager.security();
    break;
  }
  case 'refactor': {
    manager.refactor(args[0]);
    break;
  }
  case 'optimize': {
    manager.optimize(args[0]);
    break;
  }
  case 'docs': {
    manager.docs(args[0]);
    break;
  }
  case 'validate': {
    manager.validate();
    break;
  }
  default: {
    manager.showHelp();
  }
}