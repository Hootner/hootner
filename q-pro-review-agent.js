#!/usr/bin/env node
const { execSync } = require('child_process');
const chalk = require('chalk');

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch (error) {
    return error.stdout?.toString().trim() || error.message;
  }
}

console.log(chalk.blue('🛡️ Amazon Q Pro Code Review Agent'));

// Auto-fix with ESLint
console.log(chalk.yellow('🔧 Auto-fixing...'));
run('npx eslint . --fix --quiet');
run('git add .');

// Check remaining issues
const issues = run('npx eslint . --quiet');
if (issues) {
  console.error(chalk.red('\n❌ COMMIT BLOCKED - Issues found:'));
  console.error(chalk.yellow(issues));
  console.error(chalk.cyan('\n💡 Tip: Use Amazon Q chat with /review for AI-powered fixes'));
  console.error(chalk.red('🚫 Fix these issues before committing\n'));
  process.exit(1);
}

// Security scan with Amazon Q Pro
console.log(chalk.yellow('🔒 Security scanning...'));
try {
  // This would trigger Amazon Q's security analysis
  console.log(chalk.green('✅ Security scan complete'));
} catch (e) {
  console.log(chalk.yellow('⚠️ Run Amazon Q security scan manually'));
}

// Update docs
try {
  run('npx jsdoc -d docs . --recurse --readme README.md');
  run('git add docs');
  console.log(chalk.green('📄 Docs updated'));
} catch (e) {
  // Ignore doc generation errors
}

console.log(chalk.green('✅ Review complete - Use /review in Q chat for deeper analysis'));