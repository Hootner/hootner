#!/usr/bin/env node
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { execSync } from 'child_process';

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

  // Code Analysis & Review
  analyze(filePath) {
    console.log(chalk.blue(`🔍 Analyzing ${filePath}...\n`));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];

      // Security checks
      if (content.includes('eval(') || content.includes('Function(')) {
        issues.push({ type: 'SECURITY', msg: '⚠️  eval() or Function() detected - potential code injection' });
      }
      if (content.match(/password|secret|key|token|api_key/i) && !content.includes('process.env')) {
        issues.push({ type: 'SECURITY', msg: '⚠️  Hardcoded credentials detected' });
      }

      // Performance checks
      const nestedLoops = (content.match(/for.*for|while.*while/g) || []).length;
      if (nestedLoops > 0) {
        issues.push({ type: 'PERFORMANCE', msg: `⚠️  ${nestedLoops} nested loop(s) detected - consider optimization` });
      }

      // Code quality checks
      const longLines = content.split('\n').filter(l => l.length > 120).length;
      if (longLines > 0) {
        issues.push({ type: 'STYLE', msg: `⚠️  ${longLines} lines exceed 120 chars - consider refactoring` });
      }

      if (issues.length === 0) {
        console.log(chalk.green('✅ No major issues found'));
      } else {
        issues.forEach(issue => {
          const color = issue.type === 'SECURITY' ? 'red' : issue.type === 'PERFORMANCE' ? 'yellow' : 'cyan';
          console.log(chalk[color](`${issue.type}: ${issue.msg}`));
        });
      }
    } catch (err) {
      console.error(chalk.red(`Error analyzing ${filePath}: ${err.message}`));
    }
  }

  // Security Audit
  securityAudit() {
    console.log(chalk.blue('🔒 Running Security Audit...\n'));
    
    const patterns = [
      { pattern: /require\(['"]crypto['"]\).*hardcoded/i, msg: 'Hardcoded crypto keys' },
      { pattern: /\.exec\(|\.shell\(|spawn\(/i, msg: 'Potential command injection' },
      { pattern: /\$\{.*\}|`.*\$\{/i, msg: 'Template injection risk' },
      { pattern: /localStorage\.setItem.*password|password.*localStorage/i, msg: 'Password stored in localStorage' }
    ];

    try {
      const files = execSync('find . -name "*.js" -type f 2>/dev/null | head -20', { encoding: 'utf8' }).split('\n').filter(Boolean);
      let vulnerabilities = 0;

      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          patterns.forEach(({ pattern, msg }) => {
            if (pattern.test(content)) {
              console.log(chalk.red(`  ❌ ${file}: ${msg}`));
              vulnerabilities++;
            }
          });
        } catch (e) {
          // Skip binary or inaccessible files
        }
      });

      console.log(chalk.green(`\n✅ Audit complete: ${vulnerabilities} potential issue(s) found`));
    } catch (err) {
      console.error(chalk.red(`Audit failed: ${err.message}`));
    }
  }

  // Refactoring Suggestions
  suggestRefactoring(filePath) {
    console.log(chalk.blue(`♻️  Refactoring suggestions for ${filePath}...\n`));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const suggestions = [];

      // Extract duplicate patterns
      const functionCalls = (content.match(/\.\w+\(/g) || []);
      const callCounts = {};
      functionCalls.forEach(call => {
        callCounts[call] = (callCounts[call] || 0) + 1;
      });
      
      for (const [call, count] of Object.entries(callCounts)) {
        if (count > 3) {
          suggestions.push(`Extract common pattern "${call}" into utility function (appears ${count} times)`);
        }
      }

      // Suggest arrow functions for single-line functions
      const singleLineFunctions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+[^}]+;\s*\}/g) || [];
      if (singleLineFunctions.length > 0) {
        suggestions.push(`Convert ${singleLineFunctions.length} single-line function(s) to arrow functions`);
      }

      if (suggestions.length === 0) {
        console.log(chalk.green('✅ No major refactoring needed'));
      } else {
        suggestions.forEach((sug, i) => {
          console.log(chalk.cyan(`  ${i + 1}. ${sug}`));
        });
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
    }
  }

  // Generate Documentation
  generateDocs(filePath) {
    console.log(chalk.blue(`📚 Generating documentation for ${filePath}...\n`));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const functions = content.match(/(?:export\s+)?function\s+(\w+)|const\s+(\w+)\s*=/g) || [];
      
      if (functions.length === 0) {
        console.log(chalk.yellow('No functions found to document'));
        return;
      }

      console.log(chalk.cyan('# Documentation\n'));
      console.log(`File: ${filePath}`);
      console.log(`Functions: ${functions.length}\n`);
      
      functions.slice(0, 5).forEach((fn, i) => {
        console.log(chalk.green(`${i + 1}. ${fn.match(/\w+/)[0]}`));
        console.log('   - Add JSDoc comment above this function');
      });

      if (functions.length > 5) {
        console.log(chalk.gray(`   ... and ${functions.length - 5} more`));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
    }
  }

  // Performance Optimization Suggestions
  suggestOptimizations(filePath) {
    console.log(chalk.blue(`⚡ Performance analysis for ${filePath}...\n`));
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const suggestions = [];

      if (content.includes('JSON.stringify') && content.includes('JSON.parse')) {
        suggestions.push('Cache parsed JSON objects instead of parsing repeatedly');
      }
      
      if ((content.match(/\.map\(/g) || []).length > 1) {
        suggestions.push('Chain multiple .map() calls; consider reducing to single iteration');
      }

      if (content.includes('setInterval') || content.includes('setTimeout')) {
        suggestions.push('Ensure timers are cleared in cleanup functions (useEffect return)');
      }

      if (suggestions.length === 0) {
        console.log(chalk.green('✅ No obvious performance issues'));
      } else {
        suggestions.forEach((sug, i) => {
          console.log(chalk.yellow(`  ${i + 1}. ${sug}`));
        });
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
    }
  }

  monitor() {
    console.log(chalk.blue('🔍 Monitoring Copilot Progress...\n'));
    
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
    }
  }

  // Validate Commits
  validateCommit() {
    console.log(chalk.blue('🔐 Validating commit...\n'));
    try {
      const msg = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
      const files = execSync('git diff --cached --name-only', { encoding: 'utf8' }).split('\n').filter(Boolean);
      
      // Conventional commits check
      const valid = /^(feat|fix|docs|style|refactor|test|chore):\s+.{10,}/.test(msg);
      if (!valid) {
        console.log(chalk.red('❌ Use conventional commits: feat/fix/docs/style/refactor/test/chore: description'));
        return false;
      }

      // Check for secrets (simplified pattern)
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const secretPattern = new RegExp('(password|secret|key|token|api_key)\\s*=\\s*[\'"]\\w+[\'"]', 'i');
        if (secretPattern.test(content)) {
          console.log(chalk.red(`❌ Potential secret in ${file}`));
          return false;
        }
      }

      console.log(chalk.green('✅ Commit validation passed'));
      console.log(chalk.cyan(`📋 Message: ${msg.substring(0, 60)}...`));
      console.log(chalk.cyan(`📝 Files: ${files.length} staged`));
      return true;
    } catch (err) {
      console.error(chalk.red(`Validation failed: ${err.message}`));
      return false;
    }
  }

  // Generate Merge Commit Prompt
  mergePrompt() {
    console.log(chalk.blue('🔀 Merge Commit Prompt\n'));
    try {
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const commits = execSync('git log --oneline --no-merges origin/main..HEAD 2>/dev/null || git log --oneline -5', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      const files = execSync('git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~5..HEAD', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      
      console.log(chalk.cyan(`Branch: ${branch} → main`));
      console.log(chalk.cyan(`Commits: ${commits.length} | Files: ${files.length}\n`));
      console.log(chalk.green('Copilot Prompt:'));
      console.log(`\nMerge ${branch}: [summary]\n\n${commits.slice(0, 8).map(c => `- ${c}`).join('\n')}\n\nFiles: ${files.slice(0, 10).join(', ')}\n`);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
    }
  }
}

// CLI Interface
const manager = new CopilotTaskManager();
const [,, command, ...args] = process.argv;

switch (command) {
  case 'delegate': {
    const [description, ...files] = args;
    manager.delegate(description, files);
    break;
  }
  case 'monitor': {
    manager.monitor();
    break;
  }
  case 'complete': {
    manager.complete(parseInt(args[0]));
    break;
  }
  case 'analyze': {
    const filePath = args[0];
    if (!filePath) {
      console.log(chalk.red('Usage: node copilot-delegate.js analyze <file.js>'));
      process.exit(1);
    }
    manager.analyze(filePath);
    break;
  }
  case 'security': {
    manager.securityAudit();
    break;
  }
  case 'refactor': {
    const filePath = args[0];
    if (!filePath) {
      console.log(chalk.red('Usage: node copilot-delegate.js refactor <file.js>'));
      process.exit(1);
    }
    manager.suggestRefactoring(filePath);
    break;
  }
  case 'docs': {
    const filePath = args[0];
    if (!filePath) {
      console.log(chalk.red('Usage: node copilot-delegate.js docs <file.js>'));
      process.exit(1);
    }
    manager.generateDocs(filePath);
    break;
  }
  case 'optimize': {
    const filePath = args[0];
    if (!filePath) {
      console.log(chalk.red('Usage: node copilot-delegate.js optimize <file.js>'));
      process.exit(1);
    }
    manager.suggestOptimizations(filePath);
    break;
  }
  case 'validate': {
    manager.validateCommit();
    break;
  }
  case 'merge': {
    manager.mergePrompt();
    break;
  }
  default: {
    console.log(chalk.yellow('🤖 Copilot CLI - Enhanced Code Assistant\n'));
    console.log(chalk.cyan('Task Delegation:'));
    console.log('  node copilot-delegate.js delegate "Fix security issues" file1.js file2.js');
    console.log('  node copilot-delegate.js monitor');
    console.log('  node copilot-delegate.js complete <taskId>\n');
    console.log(chalk.cyan('Code Analysis:'));
    console.log('  node copilot-delegate.js analyze <file.js>          # Code review');
    console.log('  node copilot-delegate.js security                   # Security audit');
    console.log('  node copilot-delegate.js refactor <file.js>         # Refactoring suggestions');
    console.log('  node copilot-delegate.js optimize <file.js>         # Performance tips');
    console.log('  node copilot-delegate.js docs <file.js>             # Generate documentation\n');
    console.log(chalk.cyan('Validation:'));
    console.log('  node copilot-delegate.js validate                   # Validate commit');
    console.log('  node copilot-delegate.js merge                      # Generate merge commit prompt');
  }
}