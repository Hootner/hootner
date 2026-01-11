#!/usr/bin/env node
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🚀 Pre-push validation...'));

try {
  // Run tests if they exist
  execSync('npm test 2>/dev/null', { stdio: 'pipe' });
  console.log(chalk.green('✅ Tests passed'));
} catch (error) {
  if (error.status !== 127) { // 127 = command not found
    console.error(chalk.red('\n❌ PUSH BLOCKED - Tests failed'));
    console.error(chalk.yellow('Run "npm test" to see details\n'));
    process.exit(1);
  }
}

console.log(chalk.green('✅ Push validation complete'));