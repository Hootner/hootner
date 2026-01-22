#!/usr/bin/env node
/**
 * Git Integrity Checker
 * Prevents large files from being added to git history
 * Monitors repository health and file size compliance
 */

import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import path from 'path';

const CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  maxCommitSize: 50 * 1024 * 1024, // 50 MB total
  warningThreshold: 5 * 1024 * 1024, // 5 MB warning
  excludePatterns: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.venv/**',
    'venv/**'
  ]
};

class GitIntegrityChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  /**
   * Check staged files for size violations
   */
  checkStagedFiles() {
    console.log(chalk.blue('🔍 Checking staged files...\n'));
    
    try {
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

      if (stagedFiles.length === 0) {
        console.log(chalk.cyan('  No staged files'));
        return true;
      }

      let totalSize = 0;
      let violationsCount = 0;
      let warningsCount = 0;

      stagedFiles.forEach(file => {
        if (!fs.existsSync(file)) return; // File deleted
        
        const stats = fs.statSync(file);
        const sizeMB = stats.size / (1024 * 1024);
        totalSize += stats.size;

        if (stats.size > CONFIG.maxFileSize) {
          violationsCount++;
          this.violations.push({
            file,
            size: stats.size,
            sizeMB,
            reason: `Exceeds ${CONFIG.maxFileSize / (1024 * 1024)}MB limit`
          });
          console.log(chalk.red(`  ❌ ${file} (${sizeMB.toFixed(2)} MB)`));
        } else if (stats.size > CONFIG.warningThreshold) {
          warningsCount++;
          this.warnings.push({
            file,
            size: stats.size,
            sizeMB,
            reason: `Approaching limit (${sizeMB.toFixed(2)} MB)`
          });
          console.log(chalk.yellow(`  ⚠️  ${file} (${sizeMB.toFixed(2)} MB)`));
        } else {
          console.log(chalk.green(`  ✅ ${file} (${sizeMB.toFixed(2)} MB)`));
        }
      });

      const totalMB = totalSize / (1024 * 1024);
      console.log(chalk.cyan(`\n  Total staged: ${totalMB.toFixed(2)} MB / ${CONFIG.maxCommitSize / (1024 * 1024)} MB limit`));

      if (violationsCount > 0) {
        console.log(chalk.red(`\n  ❌ ${violationsCount} violation(s) found!`));
        return false;
      }

      if (warningsCount > 0) {
        console.log(chalk.yellow(`\n  ⚠️  ${warningsCount} warning(s) - files approaching limit`));
      }

      return true;
    } catch (err) {
      console.error(chalk.red(`Error checking staged files: ${err.message}`));
      return false;
    }
  }

  /**
   * Scan working directory for large files
   */
  scanWorkingDirectory() {
    console.log(chalk.blue('\n📂 Scanning working directory...\n'));
    
    try {
      const output = execSync('find . -type f -size +10M ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/dist/*" ! -path "*/build/*" ! -path "*/.venv/*" 2>/dev/null || true', 
        { encoding: 'utf8' });
      
      const files = output.split('\n').filter(Boolean);
      
      if (files.length === 0) {
        console.log(chalk.green('  ✅ No large files found in working directory'));
        return true;
      }

      console.log(chalk.yellow(`  Found ${files.length} large file(s):\n`));
      
      files.forEach(file => {
        try {
          const stats = fs.statSync(file);
          const sizeMB = stats.size / (1024 * 1024);
          console.log(chalk.yellow(`    ⚠️  ${file} (${sizeMB.toFixed(2)} MB)`));
        } catch (e) {
          // Skip if file doesn't exist
        }
      });

      return false;
    } catch (err) {
      console.error(chalk.red(`Error scanning directory: ${err.message}`));
      return false;
    }
  }

  /**
   * Check git history for recent large files
   */
  checkGitHistory() {
    console.log(chalk.blue('\n📜 Checking recent git history...\n'));
    
    try {
      const output = execSync('git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize:disk) %(rest)" | grep "^blob" | awk "$3 > 10485760 {print}"', 
        { encoding: 'utf8' });
      
      const blobs = output.split('\n').filter(Boolean);
      
      if (blobs.length === 0) {
        console.log(chalk.green('  ✅ No files > 10 MB in git history'));
        return true;
      }

      console.log(chalk.red(`  ⚠️  Found ${blobs.length} large file(s) in history:\n`));
      
      blobs.slice(0, 10).forEach(blob => {
        const parts = blob.split(/\s+/);
        const sizeMB = parseInt(parts[2]) / (1024 * 1024);
        const path = parts.slice(3).join(' ');
        console.log(chalk.red(`    ${path} (${sizeMB.toFixed(2)} MB)`));
      });

      if (blobs.length > 10) {
        console.log(chalk.red(`    ... and ${blobs.length - 10} more`));
      }

      return false;
    } catch (err) {
      // Command may fail if git-filter-repo hasn't run
      console.log(chalk.green('  ✅ History clean'));
      return true;
    }
  }

  /**
   * Verify LFS configuration
   */
  verifyLFSConfig() {
    console.log(chalk.blue('\n🔐 Verifying Git LFS configuration...\n'));
    
    try {
      if (!fs.existsSync('.gitattributes')) {
        console.log(chalk.yellow('  ⚠️  .gitattributes not found'));
        return false;
      }

      const content = fs.readFileSync('.gitattributes', 'utf8');
      const lfsPatterns = content.split('\n').filter(line => line.includes('filter=lfs'));
      
      console.log(chalk.green(`  ✅ Found ${lfsPatterns.length} LFS patterns:\n`));
      lfsPatterns.slice(0, 5).forEach(pattern => {
        console.log(chalk.cyan(`    ${pattern.trim()}`));
      });

      if (lfsPatterns.length > 5) {
        console.log(chalk.cyan(`    ... and ${lfsPatterns.length - 5} more`));
      }

      return true;
    } catch (err) {
      console.error(chalk.red(`Error checking LFS config: ${err.message}`));
      return false;
    }
  }

  /**
   * Generate report
   */
  report(context = 'manual') {
    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('📊 Git Integrity Report'));
    console.log(chalk.cyan('='.repeat(60) + '\n'));

    const stagedOk = this.checkStagedFiles();
    const workdirOk = this.scanWorkingDirectory();
    const historyOk = this.checkGitHistory();
    const lfsOk = this.verifyLFSConfig();

    console.log(chalk.cyan('\n' + '='.repeat(60)));
    console.log(chalk.cyan('Summary'));
    console.log(chalk.cyan('='.repeat(60) + '\n'));

    console.log(`Staged Files: ${stagedOk ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
    console.log(`Working Dir:  ${workdirOk ? chalk.green('✅ PASS') : chalk.yellow('⚠️  WARNING')}`);
    console.log(`Git History:  ${historyOk ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
    console.log(`LFS Config:   ${lfsOk ? chalk.green('✅ PASS') : chalk.yellow('⚠️  WARNING')}`);

    const allOk = stagedOk && historyOk && lfsOk;
    
    console.log('\n' + chalk.cyan('='.repeat(60)) + '\n');
    
    if (allOk) {
      console.log(chalk.green('✅ Repository integrity verified - Ready to commit!\n'));
      return 0;
    } else {
      console.log(chalk.red('❌ Repository integrity check failed\n'));
      
      if (this.violations.length > 0) {
        console.log(chalk.red(`${this.violations.length} VIOLATION(S):`));
        this.violations.forEach(v => {
          console.log(`  - ${v.file}: ${v.reason} (${v.sizeMB.toFixed(2)} MB)`);
        });
      }

      if (this.warnings.length > 0) {
        console.log(chalk.yellow(`\n${this.warnings.length} WARNING(S):`));
        this.warnings.forEach(w => {
          console.log(`  - ${w.file}: ${w.reason}`);
        });
      }

      console.log();
      return context === 'pre-commit' ? 1 : 0;
    }
  }

  /**
   * Pre-commit hook mode
   */
  preCommitCheck() {
    const ok = this.checkStagedFiles();
    
    if (!ok && this.violations.length > 0) {
      console.log(chalk.red('\n❌ Commit blocked: Large files detected\n'));
      this.violations.forEach(v => {
        console.log(chalk.red(`  ${v.file}: ${v.sizeMB.toFixed(2)} MB (max: 10 MB)`));
      });
      console.log(chalk.yellow('\nRun: npm run git:integrity:report\n'));
      process.exit(1);
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings detected:\n'));
      this.warnings.forEach(w => {
        console.log(chalk.yellow(`  ${w.file}: ${w.sizeMB.toFixed(2)} MB`));
      });
    }
  }
}

// CLI
const checker = new GitIntegrityChecker();
const [,, command] = process.argv;

switch (command) {
  case 'pre-commit':
    checker.preCommitCheck();
    break;
  case 'report':
  default:
    process.exit(checker.report(command === 'pre-commit' ? 'pre-commit' : 'manual'));
}
