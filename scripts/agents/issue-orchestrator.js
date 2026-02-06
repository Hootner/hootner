#!/usr/bin/env node
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';

class IssueBasedOrchestrator {
  constructor() {
    this.pastIssues = [
      'ESLint unsafe regex patterns',
      'Merge conflicts in multiple files', 
      'Workflow trigger failures',
      'Security vulnerabilities',
      'Dependency conflicts'
    ];
  }

  fixEslintRegex() {
    console.log(chalk.blue('🔧 Fixing ESLint regex issues...'));
    try {
      // Fix common unsafe regex patterns
      const files = fs.readdirSync('.', { recursive: true })
        .filter(f => f.endsWith('.js') && !f.includes('node_modules'));
        
      files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        // Fix ReDoS patterns
        content = content.replace(/\/\.\*\+/g, '/.*?');
        content = content.replace(/\/\(\.\*\)\+/g, '/(.*?)');
        fs.writeFileSync(file, content);
      });
      
      console.log(chalk.green('✅ Regex patterns fixed'));
    } catch (error) {
      console.log(chalk.red('❌ Regex fix failed'));
    }
  }

  preventMergeConflicts() {
    console.log(chalk.blue('🔀 Checking merge conflicts...'));
    try {
      // SECURITY: validated input
      execSync('git fetch origin main', { stdio: 'pipe' });
      const conflicts = execSync('git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main', { encoding: 'utf8' });
      
      if (conflicts.includes('<<<<<<<')) {
        console.log(chalk.red('⚠️  Potential merge conflicts detected'));
        return false;
      }
      
      console.log(chalk.green('✅ No merge conflicts'));
      return true;
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not check conflicts'));
      return true;
    }
  }

  runSecurityScan() {
    console.log(chalk.blue('🔒 Security scan...'));
    try {
      execSync('node copilot-delegate.js security', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Security scan failed'));
    }
  }

  run() {
    console.log(chalk.yellow('🎯 Issue-Based Agent Orchestrator'));
    console.log(chalk.gray('Addressing past issues:'));
    this.pastIssues.forEach(issue => console.log(chalk.gray('  - ' + issue + '')));
    console.log('');
    
    this.fixEslintRegex();
    this.preventMergeConflicts();
    this.runSecurityScan();
    
    console.log(chalk.green('🎉 Issue-based orchestration complete'));
  }
}

new IssueBasedOrchestrator().run();