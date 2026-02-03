#!/usr/bin/env node

/**
 * Merge All Branches Script
 * 
 * This script merges all feature branches into the main branch.
 * It handles conflicts gracefully and provides detailed reporting.
 * 
 * Usage:
 *   node scripts/merge-all-branches.js [--dry-run] [--branch=<branch-name>]
 * 
 * Options:
 *   --dry-run          Simulate merges without actually performing them
 *   --branch=<name>    Merge only a specific branch
 *   --skip-merged      Skip branches that are already merged
 *   --help             Show this help message
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

class BranchMerger {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.specificBranch = options.branch || null;
    this.skipMerged = options.skipMerged !== false;
    this.results = {
      success: [],
      conflict: [],
      skipped: [],
      alreadyMerged: []
    };
  }

  /**
   * Execute a git command safely
   */
  execGit(command, options = {}) {
    try {
      return execSync(`git ${command}`, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      }).trim();
    } catch (error) {
      if (!options.ignoreError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Get all remote branches
   */
  getAllBranches() {
    const branches = this.execGit('branch -r', { silent: true })
      .split('\n')
      .map(b => b.trim())
      .filter(b => b && !b.includes('HEAD') && !b.includes('main'))
      .map(b => b.replace('origin/', ''));

    return [...new Set(branches)]; // Remove duplicates
  }

  /**
   * Check if a branch is already merged
   */
  isBranchMerged(branch) {
    try {
      const mergedBranches = this.execGit('branch -r --merged origin/main', { silent: true });
      if (!mergedBranches) {
        return false;
      }

      const mergedList = mergedBranches
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      return mergedList.includes(`origin/${branch}`);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get branch information
   */
  getBranchInfo(branch) {
    try {
      const lastCommit = this.execGit(`log origin/${branch} --oneline -1`, { silent: true });
      const commitCount = this.execGit(`rev-list --count origin/main..origin/${branch}`, { 
        silent: true, 
        ignoreError: true 
      }) || '0';
      
      return {
        lastCommit,
        commitCount: parseInt(commitCount),
        exists: true
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Attempt to merge a branch
   */
  mergeBranch(branch) {
    console.log(chalk.blue(`\n${'='.repeat(60)}`));
    console.log(chalk.blue(`Processing: ${branch}`));
    console.log(chalk.blue('='.repeat(60)));

    // Check if branch exists
    const info = this.getBranchInfo(branch);
    if (!info.exists) {
      console.log(chalk.yellow(`⚠️  Branch ${branch} not found, skipping...`));
      this.results.skipped.push({ branch, reason: 'not found' });
      return false;
    }

    // Check if already merged
    if (this.skipMerged && this.isBranchMerged(branch)) {
      console.log(chalk.gray(`ℹ️  Branch ${branch} is already merged, skipping...`));
      this.results.alreadyMerged.push(branch);
      return true;
    }

    console.log(chalk.cyan(`Last commit: ${info.lastCommit}`));
    console.log(chalk.cyan(`Commits ahead: ${info.commitCount}`));

    if (this.dryRun) {
      console.log(chalk.yellow(`\n🔍 DRY RUN: Testing merge of ${branch}...`));
      try {
        this.execGit(`merge --no-commit --no-ff origin/${branch}`, { silent: true });
        this.execGit('merge --abort', { silent: true, ignoreError: true });
        console.log(chalk.green(`✅ Would merge successfully`));
        this.results.success.push(branch);
        return true;
      } catch (error) {
        this.execGit('merge --abort', { silent: true, ignoreError: true });
        console.log(chalk.red(`❌ Would have conflicts`));
        this.results.conflict.push({ branch, error: 'merge conflict' });
        return false;
      }
    }

    // Actual merge
    try {
      console.log(chalk.green(`\n🔄 Merging ${branch} into main...`));
      this.execGit(`merge --no-ff origin/${branch} -m "Merge branch '${branch}' into main"`);
      console.log(chalk.green(`✅ Successfully merged ${branch}`));
      this.results.success.push(branch);
      return true;
    } catch (error) {
      console.log(chalk.red(`❌ Merge conflict detected for ${branch}`));
      this.execGit('merge --abort', { silent: true, ignoreError: true });
      this.results.conflict.push({ 
        branch, 
        error: 'merge conflict',
        message: error.message
      });
      return false;
    }
  }

  /**
   * Print final summary
   */
  printSummary() {
    console.log(chalk.blue(`\n${'='.repeat(60)}`));
    console.log(chalk.blue.bold('MERGE SUMMARY'));
    console.log(chalk.blue('='.repeat(60)));

    if (this.dryRun) {
      console.log(chalk.yellow('⚠️  DRY RUN MODE - No actual merges performed\n'));
    }

    console.log(chalk.green(`✅ Successfully merged: ${this.results.success.length}`));
    if (this.results.success.length > 0) {
      this.results.success.forEach(b => console.log(chalk.green(`   - ${b}`)));
    }

    console.log(chalk.gray(`\nℹ️  Already merged: ${this.results.alreadyMerged.length}`));
    if (this.results.alreadyMerged.length > 0) {
      this.results.alreadyMerged.forEach(b => console.log(chalk.gray(`   - ${b}`)));
    }

    console.log(chalk.red(`\n❌ Merge conflicts: ${this.results.conflict.length}`));
    if (this.results.conflict.length > 0) {
      this.results.conflict.forEach(c => console.log(chalk.red(`   - ${c.branch}`)));
    }

    console.log(chalk.yellow(`\n⚠️  Skipped: ${this.results.skipped.length}`));
    if (this.results.skipped.length > 0) {
      this.results.skipped.forEach(s => console.log(chalk.yellow(`   - ${s.branch} (${s.reason})`)));
    }

    if (this.results.conflict.length > 0 && !this.dryRun) {
      console.log(chalk.yellow(`\n⚠️  Manual intervention required for conflict resolution`));
      console.log(chalk.cyan(`\nTo resolve conflicts manually:`));
      this.results.conflict.forEach(c => {
        console.log(chalk.white(`\n  For ${c.branch}:`));
        console.log(chalk.gray(`    git checkout main`));
        console.log(chalk.gray(`    git merge ${c.branch}`));
        console.log(chalk.gray(`    # Resolve conflicts`));
        console.log(chalk.gray(`    git commit`));
        console.log(chalk.gray(`    git push origin main`));
      });
    }

    console.log(chalk.blue(`\n${'='.repeat(60)}\n`));
  }

  /**
   * Main execution
   */
  async run() {
    console.log(chalk.bold.blue('\n🦉 HOOTNER Branch Merger\n'));

    // Ensure we're on main branch
    try {
      const currentBranch = this.execGit('rev-parse --abbrev-ref HEAD', { silent: true });
      if (currentBranch !== 'main') {
        console.log(chalk.yellow(`⚠️  Not on main branch, checking out main...`));
        this.execGit('checkout main');
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to checkout main branch'));
      console.error(error.message);
      process.exit(1);
    }

    // Update main branch
    console.log(chalk.cyan('📥 Updating main branch...'));
    try {
      this.execGit('fetch origin main');
      this.execGit('pull origin main');
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not update main branch, continuing...'));
    }

    // Fetch all branches
    console.log(chalk.cyan('📥 Fetching all branches...'));
    try {
      this.execGit('fetch --all');
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not fetch all branches, working with existing refs...'));
    }

    // Get branches to merge
    const branches = this.specificBranch 
      ? [this.specificBranch]
      : this.getAllBranches();

    console.log(chalk.cyan(`\n📋 Found ${branches.length} branch(es) to process\n`));

    // Merge each branch
    for (const branch of branches) {
      this.mergeBranch(branch);
    }

    // Print summary
    this.printSummary();

    // Exit with error if there were conflicts
    if (this.results.conflict.length > 0 && !this.dryRun) {
      process.exit(1);
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    branch: null,
    skipMerged: true
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--branch=')) {
      options.branch = arg.split('=')[1];
    } else if (arg === '--skip-merged') {
      options.skipMerged = true;
    } else if (arg === '--no-skip-merged') {
      options.skipMerged = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Merge All Branches Script

Usage:
  node scripts/merge-all-branches.js [options]

Options:
  --dry-run            Simulate merges without actually performing them
  --branch=<name>      Merge only a specific branch
  --skip-merged        Skip branches that are already merged (default)
  --no-skip-merged     Include already merged branches
  --help, -h           Show this help message

Examples:
  node scripts/merge-all-branches.js --dry-run
  node scripts/merge-all-branches.js --branch=feature/my-feature
  node scripts/merge-all-branches.js --no-skip-merged
      `);
      process.exit(0);
    }
  }

  return options;
}

// Run the script
const options = parseArgs();
const merger = new BranchMerger(options);
merger.run().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
