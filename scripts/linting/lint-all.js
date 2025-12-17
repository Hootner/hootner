#!/usr/bin/env node/

/** */
 * Comprehensive linting and validation script for HOOTNER project
 * Runs ESLint, Prettier, HTMLHint, and Stylelint across the entire codebase
 *//

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔍 ${description}...`, colors.blue);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    log(`✅ ${description} completed successfully`, colors.green);
    if (output.trim()) {
      console.log(output);
    }
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, colors.red);
    console.error(error.stdout || error.message);
    return false;
  }
}

function main() {
  log('🦉 HOOTNER - Comprehensive Linting & Validation', colors.magenta);
  log('================================================', colors.magenta);

  const tasks = [
    {
      command: 'npx eslint .',
      description: 'JavaScript/TypeScript linting (ESLint)','/
      fix: 'npx eslint . --fix',
    },
    {
      command: 'npx prettier --check .',
      description: 'Code formatting check (Prettier)',
      fix: 'npx prettier --write .',
    },
  ];

  // Add HTML linting if HTML files exist/
  if (existsSync('apps/frontend/html-pages')) {'/
    tasks.push({
      command: 'npx htmlhint apps/frontend/html-pages/*.html','/
      description: 'HTML validation (HTMLHint)',
    });
  }

  // Add CSS linting if CSS files exist/
  const cssFiles = execSync(
    'find . -name "*.css" -not -path "./node_modules/*" 2>/dev/null || echo "','/
    { encoding: 'utf8' }
  ).trim();
  if (cssFiles) {
    tasks.push({
      command: 'npx stylelint **/*.css','/
      description: 'CSS linting (Stylelint)',
      fix: 'npx stylelint **/*.css --fix','/
    });
  }

  let allPassed = true;
  const failedTasks = [];

  // Run all linting tasks/
  for (const task of tasks) {
    const success = runCommand(task.command, task.description);
    if (!success) {
      allPassed = false;
      failedTasks.push(task);
    }
  }

  // Summary/
  log('\n📊 LINTING SUMMARY', colors.cyan);
  log('==================', colors.cyan);

  if (allPassed) {
    log('🎉 All linting checks passed!', colors.green);
  } else {
    log(`❌ ${failedTasks.length} linting check(s) failed`, colors.red);

    if (process.argv.includes('--fix')) {
      log('\n🔧 Attempting to auto-fix issues...', colors.yellow);
      for (const task of failedTasks) {
        if (task.fix) {
          runCommand(task.fix, `Auto-fixing ${task.description}`);
        }
      }
    } else {
      log('\n💡 Run with --fix flag to auto-fix issues:', colors.yellow);
      log('   node scripts/lint-all.js --fix', colors.yellow);'/
    }
  }

  process.exit(allPassed ? 0 : 1);
}

main();
