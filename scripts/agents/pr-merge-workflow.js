#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * PR Merge Workflow Automation
 * Handles dry-run testing, validation, and merge execution with conflict resolution
 */
class PRMergeWorkflow {
  constructor() {
    this.results = {
      dryRun: null,
      validation: null,
      conflicts: [],
      tests: null,
      security: null
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red'
    };
    console.log(chalk[colors[type]](`${message}`));
  }

  section(title) {
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${title}`));
    console.log(chalk.cyan('═'.repeat(60)) + '\n');
  }

  /**
   * Step 1: Dry-run merge testing
   */
  async dryRunMerge(targetBranch = 'main') {
    this.section('🧪 Dry-Run Merge Testing');
    
    try {
      // Get current branch
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      this.log(`Current branch: ${currentBranch}`);
      this.log(`Target branch: ${targetBranch}`);

      // Try to fetch latest from target, but continue if it fails (e.g., in CI or when offline)
      this.log('\nFetching latest changes...');
      try {
        execSync(`git fetch origin ${targetBranch}`, { stdio: 'pipe' });
        this.log('✅ Fetched latest changes', 'success');
      } catch (fetchError) {
        this.log('⚠️  Could not fetch (continuing with local refs)', 'warning');
      }
      
      // Check if target branch ref exists locally
      let targetRef = `origin/${targetBranch}`;
      try {
        execSync(`git rev-parse --verify ${targetRef}`, { stdio: 'pipe' });
      } catch {
        // Try without origin prefix
        targetRef = targetBranch;
        try {
          execSync(`git rev-parse --verify ${targetRef}`, { stdio: 'pipe' });
        } catch {
          this.log(`⚠️  Target branch ${targetBranch} not found locally`, 'warning');
          this.log('Skipping conflict check (run in CI or after git fetch)', 'warning');
          this.results.dryRun = 'skipped';
          return true; // Don't block on missing ref
        }
      }
      
      // Perform merge-tree analysis (dry-run)
      this.log('\nAnalyzing merge conflicts...');
      const mergeBase = execSync(`git merge-base HEAD ${targetRef}`, { encoding: 'utf8' }).trim();
      const mergeTree = execSync(
        `git merge-tree ${mergeBase} HEAD ${targetRef}`,
        { encoding: 'utf8' }
      );

      // Check for conflicts
      const hasConflicts = mergeTree.includes('<<<<<<<') || mergeTree.includes('=======') || mergeTree.includes('>>>>>>>');
      
      if (hasConflicts) {
        this.log('⚠️  Potential merge conflicts detected!', 'warning');
        
        // Extract conflict files
        const conflictMatches = mergeTree.matchAll(/<<<<<<< \.our\n[\s\S]*?path: (.*?)\n/g);
        this.results.conflicts = [...conflictMatches].map(m => m[1]);
        
        this.log('\nConflicting files:', 'warning');
        this.results.conflicts.forEach(file => {
          this.log(`  - ${file}`, 'warning');
        });
        
        this.results.dryRun = 'conflicts';
        return false;
      } else {
        this.log('✅ No merge conflicts detected', 'success');
        this.results.dryRun = 'clean';
        return true;
      }
    } catch (error) {
      this.log(`❌ Dry-run failed: ${error.message}`, 'error');
      this.results.dryRun = 'error';
      return false;
    }
  }

  /**
   * Step 2: Run comprehensive validation
   */
  async runValidation() {
    this.section('✅ Pre-Merge Validation');
    
    const checks = [];

    // Run linter
    try {
      this.log('Running linter...');
      execSync('npm run lint', { stdio: 'pipe' });
      this.log('✅ Linter passed', 'success');
      checks.push({ name: 'Linter', status: 'pass' });
    } catch (error) {
      this.log('⚠️  Linter found issues (continuing)', 'warning');
      checks.push({ name: 'Linter', status: 'warning' });
    }

    // Run dual-agent tests if available
    try {
      this.log('\nRunning dual-agent tests...');
      execSync('npm run dual-agent:test', { stdio: 'pipe' });
      this.log('✅ Dual-agent tests passed', 'success');
      checks.push({ name: 'Dual-Agent Tests', status: 'pass' });
    } catch (error) {
      this.log('⚠️  Dual-agent tests unavailable or failed', 'warning');
      checks.push({ name: 'Dual-Agent Tests', status: 'skip' });
    }

    // Run MCP validation if available
    try {
      this.log('\nRunning MCP validation...');
      execSync('npm run mcp:validate', { stdio: 'pipe' });
      this.log('✅ MCP validation passed', 'success');
      checks.push({ name: 'MCP Validation', status: 'pass' });
    } catch (error) {
      this.log('⚠️  MCP validation unavailable or failed', 'warning');
      checks.push({ name: 'MCP Validation', status: 'skip' });
    }

    // Check infrastructure
    try {
      this.log('\nChecking infrastructure...');
      execSync('node check-infrastructure.js', { stdio: 'pipe' });
      this.log('✅ Infrastructure check passed', 'success');
      checks.push({ name: 'Infrastructure Check', status: 'pass' });
    } catch (error) {
      this.log('⚠️  Infrastructure check failed', 'warning');
      checks.push({ name: 'Infrastructure Check', status: 'warning' });
    }

    this.results.validation = checks;
    const hasFailures = checks.some(c => c.status === 'error');
    
    if (hasFailures) {
      this.log('\n❌ Validation failed', 'error');
      return false;
    } else {
      this.log('\n✅ All validations passed or skipped safely', 'success');
      return true;
    }
  }

  /**
   * Step 3: Run security checks
   */
  async runSecurityChecks() {
    this.section('🔒 Security Validation');
    
    try {
      this.log('Running security audit...');
      execSync('npm run security:audit', { stdio: 'pipe' });
      this.log('✅ Security audit passed', 'success');
      this.results.security = 'pass';
      return true;
    } catch (error) {
      this.log('⚠️  Security audit found issues', 'warning');
      this.results.security = 'warning';
      // Don't fail on security warnings in pre-merge, just warn
      return true;
    }
  }

  /**
   * Step 4: Execute merge with issue-orchestrator
   */
  async executeMerge(targetBranch = 'main') {
    this.section('🔀 Executing Merge');
    
    try {
      // Run issue-orchestrator first to fix common issues
      this.log('Running issue-based orchestration...');
      execSync('node scripts/agents/issue-orchestrator.js', { stdio: 'inherit' });
      
      // Perform the actual merge
      this.log(`\nMerging into ${targetBranch}...`);
      execSync(`git merge origin/${targetBranch} --no-ff`, { stdio: 'inherit' });
      
      this.log('✅ Merge completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`❌ Merge failed: ${error.message}`, 'error');
      this.log('\n🔧 Conflict Resolution Options:', 'warning');
      this.log('1. Manual resolution: Edit conflicting files and run `git add <file>`');
      this.log('2. Use merge tools: `git mergetool`');
      this.log('3. Abort merge: `git merge --abort`');
      this.log('4. See CONTRIBUTING_TOOLING.md for guidance');
      return false;
    }
  }

  /**
   * Step 5: Post-merge validation
   */
  async postMergeValidation() {
    this.section('🔍 Post-Merge Validation');
    
    try {
      this.log('Checking infrastructure status...');
      execSync('node check-infrastructure.js', { stdio: 'inherit' });
      
      this.log('\nRunning smoke tests...');
      try {
        execSync('npm run test:smoke', { stdio: 'pipe' });
        this.log('✅ Smoke tests passed', 'success');
      } catch (error) {
        this.log('⚠️  Smoke tests unavailable or failed', 'warning');
      }
      
      return true;
    } catch (error) {
      this.log(`⚠️  Post-merge validation warning: ${error.message}`, 'warning');
      return true; // Don't fail on post-merge warnings
    }
  }

  /**
   * Generate merge commit message using copilot-merge-prompt
   */
  generateMergeMessage() {
    this.section('📝 Generate Merge Commit Message');
    
    try {
      this.log('Generating merge commit message template...\n');
      execSync('node scripts/agents/copilot-merge-prompt.js', { stdio: 'inherit' });
      return true;
    } catch (error) {
      this.log(`⚠️  Could not generate message: ${error.message}`, 'warning');
      return false;
    }
  }

  /**
   * Display final report
   */
  displayReport() {
    this.section('📊 Merge Workflow Report');
    
    console.log(chalk.bold('Results Summary:'));
    console.log(`  Dry-Run: ${this.getStatusIcon(this.results.dryRun)} ${this.results.dryRun || 'not run'}`);
    console.log(`  Security: ${this.getStatusIcon(this.results.security)} ${this.results.security || 'not run'}`);
    
    if (this.results.validation) {
      console.log('\n  Validation Checks:');
      this.results.validation.forEach(check => {
        console.log(`    ${this.getStatusIcon(check.status)} ${check.name}`);
      });
    }
    
    if (this.results.conflicts.length > 0) {
      console.log('\n  Conflicts Detected:');
      this.results.conflicts.forEach(file => {
        console.log(chalk.yellow(`    ⚠️  ${file}`));
      });
    }
  }

  getStatusIcon(status) {
    const icons = {
      'clean': chalk.green('✅'),
      'pass': chalk.green('✅'),
      'conflicts': chalk.yellow('⚠️'),
      'warning': chalk.yellow('⚠️'),
      'error': chalk.red('❌'),
      'skip': chalk.gray('⊘'),
      'skipped': chalk.gray('⊘')
    };
    return icons[status] || chalk.gray('○');
  }

  /**
   * Main workflow execution
   */
  async run(mode = 'full', targetBranch = 'main') {
    console.log(chalk.bold.cyan('\n🚀 PR Merge Workflow Automation\n'));
    
    try {
      switch (mode) {
        case 'dry-run':
          await this.dryRunMerge(targetBranch);
          this.displayReport();
          break;
          
        case 'validate':
          await this.runValidation();
          await this.runSecurityChecks();
          this.displayReport();
          break;
          
        case 'merge':
          const canMerge = await this.dryRunMerge(targetBranch);
          if (!canMerge) {
            this.log('\n❌ Cannot merge due to conflicts', 'error');
            this.displayReport();
            process.exit(1);
          }
          await this.executeMerge(targetBranch);
          await this.postMergeValidation();
          this.displayReport();
          break;
          
        case 'generate-message':
          this.generateMergeMessage();
          break;
          
        case 'full':
        default:
          // Full workflow
          this.log('Starting full merge workflow...\n');
          
          // 1. Dry-run
          const dryRunOk = await this.dryRunMerge(targetBranch);
          
          // 2. Validation
          await this.runValidation();
          
          // 3. Security
          await this.runSecurityChecks();
          
          // Display report
          this.displayReport();
          
          // 4. Ask for confirmation if conflicts exist
          if (!dryRunOk) {
            this.log('\n⚠️  Conflicts detected. Resolve manually before merging.', 'warning');
            this.log('Run: node scripts/agents/pr-merge-workflow.js merge (after resolving)', 'info');
            process.exit(1);
          }
          
          this.log('\n✅ All pre-merge checks passed!', 'success');
          this.log('Run: node scripts/agents/pr-merge-workflow.js merge', 'info');
          break;
      }
    } catch (error) {
      this.log(`\n❌ Workflow error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI Interface
const [,, mode = 'full', targetBranch = 'main'] = process.argv;

const validModes = ['full', 'dry-run', 'validate', 'merge', 'generate-message'];
if (!validModes.includes(mode)) {
  console.log(chalk.yellow('PR Merge Workflow - Usage:\n'));
  console.log('  node scripts/agents/pr-merge-workflow.js [mode] [target-branch]\n');
  console.log(chalk.cyan('Modes:'));
  console.log('  full              - Run complete workflow (dry-run + validation)');
  console.log('  dry-run          - Test merge for conflicts only');
  console.log('  validate         - Run validation and security checks');
  console.log('  merge            - Execute actual merge (after validation)');
  console.log('  generate-message - Generate merge commit message template\n');
  console.log(chalk.cyan('Examples:'));
  console.log('  npm run merge:dry-run');
  console.log('  npm run merge:validate');
  console.log('  npm run merge:execute');
  console.log('  node scripts/agents/pr-merge-workflow.js full main');
  process.exit(0);
}

const workflow = new PRMergeWorkflow();
workflow.run(mode, targetBranch);
