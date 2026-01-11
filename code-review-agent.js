#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';

function runCommand(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (error) {
    return error.stdout?.toString().trim() || error.message;
  }
}

console.log(chalk.blue('🛡️ Starting HOOTNER Code Review Agent...'));

// Step 1: Auto-fix and review code
console.log(chalk.yellow('🔍 Reviewing and auto-fixing code...'));
try {
  const fixOutput = runCommand('npm run lint:fix');
  if (fixOutput) {
    console.log(chalk.green('✅ Auto-fixes applied:'));
    console.log(fixOutput);
  } else {
    console.log(chalk.green('✅ No issues to auto-fix.'));
  }
  
  // Re-stage any fixed files
  runCommand('git add .');
} catch (error) {
  console.log(chalk.yellow('⚠️ Linting not configured, skipping auto-fix'));
}

// Step 2: Full lint for suggestions
try {
  const lintOutput = runCommand('npm run lint');
  if (lintOutput && lintOutput.includes('error')) {
    console.error(chalk.red('❌ Issues found (suggestions):'));
    console.error(lintOutput);
    process.exit(1);
  } else {
    console.log(chalk.green('✅ Code review passed!'));
  }
} catch (error) {
  console.log(chalk.yellow('⚠️ Linting check skipped'));
}

// Step 3: Security scan
console.log(chalk.yellow('🔒 Running security scan...'));
try {
  const securityOutput = runCommand('npm audit --audit-level=high');
  if (securityOutput.includes('vulnerabilities')) {
    console.log(chalk.red('⚠️ Security vulnerabilities found:'));
    console.log(securityOutput);
  } else {
    console.log(chalk.green('✅ No high-severity vulnerabilities'));
  }
} catch (error) {
  console.log(chalk.yellow('⚠️ Security scan skipped'));
}

// Step 4: Update documentation
console.log(chalk.yellow('📄 Checking documentation...'));
const changedFiles = runCommand('git diff --cached --name-only');
if (changedFiles.includes('.js') || changedFiles.includes('.ts')) {
  console.log(chalk.green('✅ Code changes detected - docs may need updates'));
  // Auto-stage any doc changes
  try {
    runCommand('git add docs/ README.md wiki/');
  } catch (error) {
    // Ignore if directories don't exist
  }
}

console.log(chalk.blue('🛡️ HOOTNER Code Review Agent complete. Proceeding to commit.'));
console.log(chalk.gray(`📊 Files reviewed: ${changedFiles.split('\n').length} files`));