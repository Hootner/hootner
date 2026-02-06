#!/usr/bin/env node
/**
 * Git Repository Health Monitor
 * Continuous monitoring script for repository integrity
 * Run: node scripts/git-health-monitor.js
 */

import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';

class GitHealthMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      checks: {}
    };
  }

  /**
   * Check repository size
   */
  checkRepoSize() {
    try {
      const output = execSync('du -sh .git', { encoding: 'utf8' });
      const size = output.split('\t')[0];
      this.metrics.checks.gitSize = size;
      return size;
    } catch (err) {
      return 'unknown';
    }
  }

  /**
   * Count commits
   */
  countCommits() {
    try {
      const output = execSync('git rev-list --count --all', { encoding: 'utf8' }).trim();
      this.metrics.checks.totalCommits = parseInt(output);
      return parseInt(output);
    } catch (err) {
      return 0;
    }
  }

  /**
   * Check for uncommitted changes
   */
  checkUncommitted() {
    try {
      const output = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
      const count = output.split('\n').filter(l => l.length > 0).length;
      this.metrics.checks.uncommittedFiles = count;
      return count;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Check LFS status
   */
  checkLFSStatus() {
    try {
      if (!fs.existsSync('.gitattributes')) {
        this.metrics.checks.lfsEnabled = false;
        return 'not configured';
      }

      const content = fs.readFileSync('.gitattributes', 'utf8');
      const lfsLines = content.split('\n').filter(l => l.includes('filter=lfs')).length;
      this.metrics.checks.lfsEnabled = lfsLines > 0;
      this.metrics.checks.lfsPatterns = lfsLines;
      return `${lfsLines} patterns`;
    } catch (err) {
      return 'error';
    }
  }

  /**
   * Find largest files in working directory
   */
  findLargeFiles() {
    try {
      const output = execSync(
        'find . -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" ! -path "*/.venv/*" -size +5M 2>/dev/null | head -5',
        { encoding: 'utf8' }
      ).trim();

      const files = output.split('\n').filter(Boolean);
      this.metrics.checks.largeFiles = files.length;
      return files;
    } catch (err) {
      return [];
    }
  }

  /**
   * Check for staged files ready to commit
   */
  checkStaged() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
      const count = output.split('\n').filter(l => l.length > 0).length;
      this.metrics.checks.stagedFiles = count;
      return count;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Generate health report
   */
  report() {
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('📊 Git Repository Health Check'));
    console.log(chalk.cyan('='.repeat(60) + '\n'));

    console.log(chalk.yellow(`Timestamp: ${new Date().toLocaleString()}\n`));

    // Run all checks
    const gitSize = this.checkRepoSize();
    const commits = this.countCommits();
    const uncommitted = this.checkUncommitted();
    const staged = this.checkStaged();
    const lfs = this.checkLFSStatus();
    const largeFiles = this.findLargeFiles();

    // Display results
    console.log(chalk.cyan('Repository Metrics:'));
    console.log(`  .git size:          ${chalk.green(gitSize)}`);
    console.log(`  Total commits:      ${chalk.green(commits)}`);
    console.log(`  Staged files:       ${staged > 0 ? chalk.yellow(staged) : chalk.gray('0')}`);
    console.log(`  Uncommitted files:  ${uncommitted > 0 ? chalk.yellow(uncommitted) : chalk.gray('0')}`);

    console.log(chalk.cyan('\nLFS Configuration:'));
    console.log(`  Enabled:            ${this.metrics.checks.lfsEnabled ? chalk.green('yes') : chalk.yellow('no')}`);
    console.log(`  Patterns tracked:   ${chalk.green(lfs)}`);

    console.log(chalk.cyan('\nLarge Files (>5MB):'));
    if (largeFiles.length === 0) {
      console.log(chalk.green('  ✅ None found'));
    } else {
      console.log(chalk.yellow(`  ⚠️  ${largeFiles.length} file(s):`));
      largeFiles.forEach(file => {
        try {
          const stats = fs.statSync(file);
          const mb = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(chalk.yellow(`     ${file} (${mb} MB)`));
        } catch (e) {
          // File may have been deleted
        }
      });
    }

    console.log('\n' + chalk.cyan('='.repeat(60)) + '\n');

    // Health status
    const health = this.getHealthStatus();
    console.log(chalk.bold(`Overall Status: ${health}\n`));

    return this.metrics;
  }

  /**
   * Determine overall health
   */
  getHealthStatus() {
    const gitSizeStr = this.metrics.checks.gitSize;
    const gitSizeMB = parseInt(gitSizeStr) || 0;

    if (gitSizeMB > 500) {
      return chalk.red('🔴 CRITICAL - Git history too large');
    }
    if (gitSizeMB > 100) {
      return chalk.yellow('🟡 WARNING - Git size growing');
    }
    if (!this.metrics.checks.lfsEnabled) {
      return chalk.yellow('🟡 WARNING - LFS not fully configured');
    }
    if (this.metrics.checks.largeFiles > 0) {
      return chalk.yellow('🟡 WARNING - Large files detected');
    }
    return chalk.green('🟢 HEALTHY - Repository in good shape');
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    const metricsFile = '.git-health-metrics.json';
    const history = [];

    if (fs.existsSync(metricsFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
        history.push(...existing);
      } catch (e) {
        // File corrupted, start fresh
      }
    }

    history.push(this.metrics);

    // Keep last 30 days of history
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filtered = history.filter(m => new Date(m.timestamp) > thirtyDaysAgo);

    fs.writeFileSync(metricsFile, JSON.stringify(filtered, null, 2));
    console.log(chalk.gray(`Metrics saved to ${metricsFile}`));
  }

  /**
   * Show metrics history
   */
  showHistory() {
    const metricsFile = '.git-health-metrics.json';
    
    if (!fs.existsSync(metricsFile)) {
      console.log(chalk.yellow('No metrics history found'));
      return;
    }

    try {
      const history = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      
      console.log(chalk.cyan('\n📈 Metrics History (Last 30 Days)\n'));
      console.log(chalk.gray('Date                  | Git Size | Commits | Uncommitted'));
      console.log(chalk.gray('-'.repeat(55)));

      history.slice(-10).forEach(m => {
        const date = new Date(m.timestamp).toLocaleDateString();
        const gitSize = m.checks.gitSize || 'N/A';
        const commits = m.checks.totalCommits || 'N/A';
        const uncommitted = m.checks.uncommittedFiles || '0';
        console.log(`${date.padEnd(20)} | ${gitSize.padEnd(8)} | ${String(commits).padEnd(7)} | ${uncommitted}`);
      });

      console.log();
    } catch (err) {
      console.error(chalk.red(`Error reading metrics: ${err.message}`));
    }
  }
}

// CLI
const monitor = new GitHealthMonitor();
const [,, command] = process.argv;

switch (command) {
  case 'history':
    monitor.report();
    monitor.showHistory();
    break;
  case 'save':
    monitor.report();
    monitor.saveMetrics();
    break;
  default:
    monitor.report();
}
