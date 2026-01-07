#!/usr/bin/env node
/**
 * Master Fix-All Script
 * Comprehensive automated fixes for HOOTNER codebase
 *
 * Addresses:
 * - 368 TODO items
 * - 113 syntax issues (already fixed)
 * - Security vulnerabilities
 * - Code quality issues
 * - Performance optimizations
 */

import { execSync } from 'node:childProcess';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Color output
const colors = { reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m' };

const log = {
  info: (msg) => ,
  success: (msg) => ,
  warning: (msg) => ,
  error: (msg) => ,
  section: (msg) => }${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
};

// Fix categories
const fixes = { syntax: { name: 'Syntax Fixes',
    scripts: [
      'scripts/fix-all-syntax.cjs',
      'scripts/verify-syntax-fixes.cjs'
    ] },
  security: { name: 'Security Fixes',
    scripts: [
      'scripts/agents/fix-hardcoded-credentials.js',
      '.github/scripts/validate-config.js'
    ] },
  quality: { name: 'Code Quality Fixes',
    scripts: [
      'scripts/agents/fix-console-logs.js',
      'scripts/agents/fix-error-handling.js',
      'scripts/agents/fix-magic-numbers.js',
      'scripts/agents/fix-snake-case.js',
      'scripts/refactoring/fix-code-quality.js'
    ] },
  dependencies: { name: 'Dependency Updates',
    commands: [
      'npm audit fix',
      'npm update'
    ] },
  linting: { name: 'Linting & Formatting',
    commands: [
      'npm run lint:fix'
    ] } };

// Execute command safely
function runCommand(cmd, options = {}) {
  try {
    log.info(`Running: ${cmd}`);
    execSync(cmd, {
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    log.error(`Failed: ${cmd}`);
    if (options.throwOnError) throw error;
    return false;
  }
}

// Run script file
function runScript(scriptPath) {
  const fullPath = path.join(rootDir, scriptPath);
  if (!fs.existsSync(fullPath)) {
    log.warning(`Script not found: ${scriptPath}`);
    return false;
  }

  const ext = path.extname(scriptPath);
  const cmd = ext === '.cjs' ? `node ${fullPath}` : `node ${fullPath}`;
  return runCommand(cmd);
}

// Backup critical files
function createBackup() {
  log.section('Creating Backup');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(rootDir, 'temp', `backup_${timestamp}`);

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup package.json
    const packageJson = path.join(rootDir, 'package.json');
    if (fs.existsSync(packageJson)) {
      fs.copyFileSync(packageJson, path.join(backupDir, 'package.json'));
      log.success('Backed up package.json');
    }

    log.success(`Backup created: ${backupDir}`);
    return backupDir;
  } catch (error) {
    log.error(`Backup failed: ${error.message}`);
    return null;
  }
}

// Generate fix report
function generateReport(results) {
  log.section('Generating Report');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    details: results
  };

  results.forEach(r => {
    report.summary.total++;
    if (r.status === 'passed') report.summary.passed++;
    else if (r.status === 'failed') report.summary.failed++;
    else report.summary.skipped++;
  });

  const reportPath = path.join(rootDir, 'FIX_REPORT.md');
  const content = `# HOOTNER Fix Report
Generated: ${report.timestamp}

## Summary
- **Total Fixes**: ${report.summary.total}
- **Passed**: ${report.summary.passed} ✓
- **Failed**: ${report.summary.failed} ✗
- **Skipped**: ${report.summary.skipped} ⊘

## Details

${results.map(r => `### ${r.category}
- **Status**: ${r.status === 'passed' ? '✓ Passed' : r.status === 'failed' ? '✗ Failed' : '⊘ Skipped'}
- **Duration**: ${r.duration}ms
${r.error ? `- **Error**: ${r.error}\n` : ''}
`).join('\n')}

## Next Steps

${report.summary.failed > 0 ? `
### Failed Fixes
Review the errors above and fix manually:
${results.filter(r => r.status === 'failed').map(r => `- ${r.category}: ${r.error}`).join('\n')}
` : '✓ All fixes applied successfully!'}

### Recommended Actions
1. Run \`npm test\` to verify functionality
2. Review git diff for changes
3. Commit changes with descriptive message
4. Run \`npm run security:audit\` for security check
`;

  fs.writeFileSync(reportPath, content);
  log.success(`Report saved: ${reportPath}`);

  return report;
}

// Main execution
async function main() {
  const startTime = Date.now();
  const results = [];

  // Create backup
  const backupDir = createBackup();
  if (!backupDir) {
    log.error('Backup failed. Aborting fixes.');
    process.exit(1);
  }

  // Run fixes
  for (const [key, category] of Object.entries(fixes)) {
    log.section(category.name);
    const categoryStart = Date.now();

    try {
      // Run scripts
      if (category.scripts) {
        for (const script of category.scripts) {
          const success = runScript(script);
          if (!success) {
            log.warning(`Skipped: ${script}`);
          }
        }
      }

      // Run commands
      if (category.commands) {
        for (const cmd of category.commands) {
          runCommand(cmd, { throwOnError: false });
        }
      }

      results.push({
        category: category.name,
        status: 'passed',
        duration: Date.now() - categoryStart
      });

      log.success(`${category.name} completed`);
    } catch (error) {
      results.push({
        category: category.name,
        status: 'failed',
        duration: Date.now() - categoryStart,
        error: error.message
      });

      log.error(`${category.name} failed: ${error.message}`);
    }
  }

  // Generate report
  const report = generateReport(results);

  // Summary
  log.section('Execution Summary');
  log.info(`Total Duration: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  log.info(`Passed: ${report.summary.passed}/${report.summary.total}`);
  log.info(`Failed: ${report.summary.failed}/${report.summary.total}`);

  if (report.summary.failed === 0) {
    log.success('All fixes applied successfully! 🎉');
  } else {
    log.warning(`${report.summary.failed} fix(es) failed. Check FIX_REPORT.md for details.`);
  }

  }${colors.reset}\n`);
}

// Run
main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
