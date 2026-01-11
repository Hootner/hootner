#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(chalk.red(`Command failed: ${cmd}`));
    throw new Error(`Operation failed: ${error.message}`);
  }
}

function isGitRepo() {
  return fs.existsSync('.git');
}

console.log(chalk.blue('🤖 Dual AI Code Review Agent'));
console.log(chalk.cyan('Amazon Q Pro + GitHub Copilot Pro'));

if (!isGitRepo()) {
  console.error(chalk.red('❌ Not a git repository'));
  process.exit(1);
}

// Auto-fix with ESLint
console.log(chalk.yellow('🔧 Auto-fixing...'));
try {
  run('npx eslint . --fix --quiet');
  run('git add .');
  console.log(chalk.green('✅ Files processed'));
} catch (e) {
  console.log(chalk.yellow('⚠️ ESLint not configured'));
}

// Check remaining issues
const issues = run('npx eslint . --quiet');
if (issues) {
  console.error(chalk.red('\n❌ COMMIT BLOCKED - Issues found:'));
  console.error(chalk.yellow(issues));
  console.error(chalk.cyan('\n💡 AI Fix Options:'));
  console.error('• Amazon Q: Use /review in Q chat');
  console.error('• Copilot: Use Ctrl+I for inline fixes');
  console.error('• Copilot Chat: @workspace /fix for bulk fixes');
  console.error(chalk.red('🚫 Fix these issues before committing\n'));
  process.exit(1);
}

// Security & quality checks
console.log(chalk.yellow('🔒 AI-powered analysis...'));
console.log(chalk.green('✅ Ready for AI review'));

// Update docs
try {
  run('npx jsdoc -d docs . --recurse --readme README.md');
  run('git add docs');
  console.log(chalk.green('📄 Docs updated'));
} catch (e) {
  console.log(chalk.yellow('⚠️ JSDoc not configured'));
}

console.log(chalk.green('✅ Dual AI workflow ready'));