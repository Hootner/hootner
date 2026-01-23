#!/usr/bin/env node
/**
 * Copilot Merge Prompt Generator
 * Generates professional merge commit messages following conventional commit format
 * for the HOOTNER enterprise platform
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';

class MergePromptGenerator {
  constructor() {
    this.commits = [];
    this.files = [];
  }

  /**
   * Fetch recent commits from a branch
   */
  getRecentCommits(branch = 'HEAD', count = 10) {
    try {
      // Validate branch name to prevent command injection
      const safeBranch = branch.replace(/[^a-zA-Z0-9_\-./]/g, '');
      if (safeBranch !== branch) {
        console.error(chalk.yellow('Warning: Invalid branch name characters detected'));
        return [];
      }
      
      // Validate count is a positive integer
      const safeCount = Math.max(1, Math.min(parseInt(count, 10) || 10, 100));
      
      const output = execSync(`git log ${safeBranch} --oneline -${safeCount}`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      
      this.commits = output.split('\n').map(line => {
        const match = line.match(/^([a-f0-9]+)\s+(.+)$/);
        if (match) {
          return { hash: match[1], message: match[2] };
        }
        return null;
      }).filter(Boolean);
      
      return this.commits;
    } catch (error) {
      console.error(chalk.red(`Error fetching commits: ${error.message}`));
      return [];
    }
  }

  /**
   * Get changed files in the current branch compared to base
   */
  getChangedFiles(base = 'main') {
    try {
      // Validate base branch name to prevent command injection
      const safeBranch = base.replace(/[^a-zA-Z0-9_\-./]/g, '');
      if (safeBranch !== base) {
        console.error(chalk.yellow('Warning: Invalid branch name characters detected'));
        return [];
      }
      
      const output = execSync(`git diff --name-only ${safeBranch}...HEAD 2>/dev/null || git diff --name-only --cached`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      
      this.files = output ? output.split('\n').filter(Boolean) : [];
      return this.files;
    } catch (error) {
      // If comparison fails, try to get staged files
      try {
        const staged = execSync('git diff --cached --name-only', {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        this.files = staged ? staged.split('\n').filter(Boolean) : [];
        return this.files;
      } catch (e) {
        console.error(chalk.yellow(`Warning: Could not fetch changed files`));
        return [];
      }
    }
  }

  /**
   * Categorize files by type
   */
  categorizeFiles(files) {
    const categories = {
      cli: [],
      scripts: [],
      database: [],
      docs: [],
      config: [],
      hooks: [],
      other: []
    };

    files.forEach(file => {
      if (file.includes('copilot-') && file.endsWith('.js')) {
        categories.cli.push(file);
      } else if (file.startsWith('scripts/')) {
        categories.scripts.push(file);
      } else if (file.includes('database') || file.includes('dynamodb')) {
        categories.database.push(file);
      } else if (file.endsWith('.md') || file.startsWith('docs/')) {
        categories.docs.push(file);
      } else if (file.includes('.husky/') || file.includes('pre-commit')) {
        categories.hooks.push(file);
      } else if (file.endsWith('.json') || file.endsWith('.config.js')) {
        categories.config.push(file);
      } else {
        categories.other.push(file);
      }
    });

    return categories;
  }

  /**
   * Determine the primary commit type
   */
  determineCommitType(commits, categories) {
    const types = {
      feat: 0,
      fix: 0,
      refactor: 0,
      chore: 0,
      docs: 0
    };

    // Count commit types
    commits.forEach(commit => {
      const msg = commit.message.toLowerCase();
      if (msg.startsWith('feat')) types.feat++;
      else if (msg.startsWith('fix')) types.fix++;
      else if (msg.startsWith('refactor')) types.refactor++;
      else if (msg.startsWith('chore')) types.chore++;
      else if (msg.startsWith('docs')) types.docs++;
    });

    // Determine primary type
    if (types.feat > 0) return 'feat';
    if (types.fix > 0) return 'fix';
    if (types.refactor > 0) return 'refactor';
    if (types.chore > 0) return 'chore';
    if (types.docs > 0) return 'docs';
    
    // Default based on file changes
    if (categories.cli.length > 0 || categories.scripts.length > 0) return 'feat';
    if (categories.database.length > 0) return 'refactor';
    if (categories.docs.length > 0) return 'docs';
    
    return 'chore';
  }

  /**
   * Generate key bullet points from changes
   */
  generateBulletPoints(categories, commits) {
    const points = [];

    // CLI tools
    if (categories.cli.length > 0) {
      const tools = categories.cli
        .map(f => f.split('/').pop().replace('.js', ''))
        .join(', ');
      points.push(`Add GitHub Copilot CLI tools (${tools})`);
    }

    // Git hooks
    if (categories.hooks.length > 0) {
      points.push('Implement husky pre-commit hooks for git integrity checks');
    }

    // Database changes
    if (categories.database.length > 0) {
      points.push('Complete DynamoDB migration and database manager refactoring');
    }

    // Scripts
    if (categories.scripts.length > 0 && !categories.database.length) {
      points.push(`Update platform scripts (${categories.scripts.length} files)`);
    }

    // Documentation
    if (categories.docs.length > 0) {
      points.push(`Update documentation and configuration files`);
    }

    // If we don't have enough points, extract from commits
    if (points.length < 3) {
      commits.slice(0, 5).forEach(commit => {
        const msg = commit.message.replace(/^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?:\s*/i, '');
        if (!points.some(p => p.toLowerCase().includes(msg.toLowerCase().substring(0, 20)))) {
          points.push(msg.charAt(0).toUpperCase() + msg.slice(1));
        }
      });
    }

    // Limit to 5 points
    return points.slice(0, 5);
  }

  /**
   * Generate the complete merge commit message
   */
  generateMessage(options = {}) {
    const {
      branch = 'HEAD',
      baseBranch = 'main',
      commitCount = 10,
      customType = null,
      customSummary = null
    } = options;

    console.log(chalk.blue('🔍 Analyzing repository changes...\n'));

    // Fetch data
    const commits = this.getRecentCommits(branch, commitCount);
    const files = this.getChangedFiles(baseBranch);
    const categories = this.categorizeFiles(files);

    if (commits.length === 0 && files.length === 0) {
      console.log(chalk.yellow('⚠️  No commits or changes found'));
      return null;
    }

    // Determine commit type
    const type = customType || this.determineCommitType(commits, categories);

    // Generate summary
    let summary = customSummary;
    if (!summary) {
      if (type === 'feat') {
        summary = 'enhance platform with CLI tools and git integrity checks';
      } else if (type === 'refactor') {
        summary = 'improve database migration and platform configuration';
      } else {
        summary = 'update platform infrastructure and tooling';
      }
    }

    // Generate bullet points
    const bullets = this.generateBulletPoints(categories, commits);

    // Build message
    const message = this.formatMessage(type, summary, bullets, commits, files);

    return message;
  }

  /**
   * Format the final message
   */
  formatMessage(type, summary, bullets, commits, files) {
    const lines = [];
    
    // Header with conventional commit format
    lines.push(`${type}: ${summary}`);
    lines.push('');

    // Bullet points
    bullets.forEach(bullet => {
      lines.push(`- ${bullet}`);
    });

    // Add metadata
    lines.push('');
    lines.push(`Merged ${commits.length} commit(s) with ${files.length} file change(s)`);

    return lines.join('\n');
  }

  /**
   * Display the generated message
   */
  display(message) {
    if (!message) {
      return;
    }

    console.log(chalk.green('\n✅ Generated Merge Commit Message:\n'));
    console.log(chalk.cyan('─'.repeat(60)));
    
    const lines = message.split('\n');
    lines.forEach((line, index) => {
      if (index === 0) {
        // Highlight the header
        console.log(chalk.bold.green(line));
      } else if (line.startsWith('-')) {
        // Highlight bullet points
        console.log(chalk.yellow(line));
      } else if (line.trim()) {
        console.log(chalk.white(line));
      } else {
        console.log('');
      }
    });
    
    console.log(chalk.cyan('─'.repeat(60)));
    console.log('');

    // Line count check
    const lineCount = lines.filter(l => l.trim()).length;
    if (lineCount <= 10) {
      console.log(chalk.green(`✅ Length: ${lineCount} lines (within 10-line limit)`));
    } else {
      console.log(chalk.red(`⚠️  Length: ${lineCount} lines (exceeds 10-line limit)`));
    }
  }

  /**
   * Copy message to clipboard (if possible)
   */
  copyToClipboard(message) {
    try {
      // Try to use pbcopy (macOS), xclip (Linux), or clip (Windows)
      const platform = process.platform;
      let cmd;
      
      if (platform === 'darwin') {
        cmd = 'pbcopy';
      } else if (platform === 'linux') {
        cmd = 'xclip -selection clipboard';
      } else if (platform === 'win32') {
        cmd = 'clip';
      }

      if (cmd) {
        execSync(cmd, { input: message });
        console.log(chalk.green('📋 Message copied to clipboard!'));
      }
    } catch (error) {
      // Silently fail - clipboard is optional
    }
  }

  /**
   * Save message to file
   */
  saveToFile(message, filename = 'MERGE_MSG.txt') {
    try {
      fs.writeFileSync(filename, message, 'utf8');
      console.log(chalk.green(`💾 Message saved to ${filename}`));
    } catch (error) {
      console.error(chalk.red(`Error saving file: ${error.message}`));
    }
  }
}

// CLI Interface
function main() {
  const args = process.argv.slice(2);
  const generator = new MergePromptGenerator();

  // Parse arguments
  const options = {
    branch: 'HEAD',
    baseBranch: 'main',
    commitCount: 10,
    customType: null,
    customSummary: null,
    save: false,
    copy: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--branch':
      case '-b':
        if (i + 1 < args.length) {
          options.branch = args[++i];
        } else {
          console.error(chalk.red('Error: --branch requires a value'));
          process.exit(1);
        }
        break;
      case '--base':
        if (i + 1 < args.length) {
          options.baseBranch = args[++i];
        } else {
          console.error(chalk.red('Error: --base requires a value'));
          process.exit(1);
        }
        break;
      case '--count':
      case '-n':
        if (i + 1 < args.length) {
          const count = parseInt(args[++i], 10);
          if (isNaN(count) || count < 1) {
            console.error(chalk.red('Error: --count must be a positive integer'));
            process.exit(1);
          }
          options.commitCount = count;
        } else {
          console.error(chalk.red('Error: --count requires a numeric value'));
          process.exit(1);
        }
        break;
      case '--type':
      case '-t':
        if (i + 1 < args.length) {
          const type = args[++i];
          if (!['feat', 'fix', 'refactor', 'chore', 'docs'].includes(type)) {
            console.error(chalk.red('Error: --type must be one of: feat, fix, refactor, chore, docs'));
            process.exit(1);
          }
          options.customType = type;
        } else {
          console.error(chalk.red('Error: --type requires a value'));
          process.exit(1);
        }
        break;
      case '--summary':
      case '-s':
        if (i + 1 < args.length) {
          options.customSummary = args[++i];
        } else {
          console.error(chalk.red('Error: --summary requires a value'));
          process.exit(1);
        }
        break;
      case '--save':
        options.save = true;
        break;
      case '--copy':
      case '-c':
        options.copy = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
      default:
        if (!arg.startsWith('-')) {
          options.customSummary = args.slice(i).join(' ');
          i = args.length; // break loop
        }
    }
  }

  // Generate message
  const message = generator.generateMessage(options);
  
  if (message) {
    generator.display(message);
    
    if (options.save) {
      generator.saveToFile(message);
    }
    
    if (options.copy) {
      generator.copyToClipboard(message);
    }
  }
}

function showHelp() {
  console.log(chalk.yellow('\n🤖 Copilot Merge Prompt Generator\n'));
  console.log(chalk.cyan('Usage:'));
  console.log('  node copilot-merge-prompt.js [options]\n');
  console.log(chalk.cyan('Options:'));
  console.log('  -b, --branch <name>      Branch to analyze (default: HEAD)');
  console.log('  --base <name>            Base branch for comparison (default: main)');
  console.log('  -n, --count <number>     Number of commits to analyze (default: 10)');
  console.log('  -t, --type <type>        Force commit type (feat|fix|refactor|chore|docs)');
  console.log('  -s, --summary <text>     Custom summary text');
  console.log('  --save                   Save message to MERGE_MSG.txt');
  console.log('  -c, --copy               Copy message to clipboard');
  console.log('  -h, --help               Show this help\n');
  console.log(chalk.cyan('Examples:'));
  console.log('  node copilot-merge-prompt.js');
  console.log('  node copilot-merge-prompt.js --type feat --save');
  console.log('  node copilot-merge-prompt.js --branch feature/new --base develop');
  console.log('  node copilot-merge-prompt.js --summary "add new features" --copy\n');
}

// Run CLI
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}

export default MergePromptGenerator;
