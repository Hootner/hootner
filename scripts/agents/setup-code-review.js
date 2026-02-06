#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const isWindows = process.platform === 'win32';

/**
 * Safe command execution - execSync returns strings, not serialized objects
 * CWE-502 only applies when deserializing untrusted data structures
 */
function runCommand(cmd) {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Setup failed: ${cmd}`));
    throw new Error(`Setup operation failed: ${error.message}`);
  }
}

console.log(chalk.blue('🔧 Setting up Code Review Agent...'));

try {
  // Install dependencies
  console.log(chalk.yellow('Installing dependencies...'));
  runCommand('npm install --save-dev husky eslint chalk jsdoc');

  // Initialize husky
  console.log(chalk.yellow('Initializing Husky...'));
  runCommand('npx husky init');

  // Create pre-commit hook
  const hookContent = isWindows
    ? '@echo off\nnode dual-ai-review-agent.js'
    : '#!/usr/bin/env sh\nnode dual-ai-review-agent.js';

  fs.writeFileSync('.husky/pre-commit', hookContent);
  if (!isWindows) {
    runCommand('chmod +x .husky/pre-commit');
  }

  // Create pre-push hook
  const pushHookContent = isWindows
    ? '@echo off\nnode pre-push-agent.js'
    : '#!/usr/bin/env sh\nnode pre-push-agent.js';

  fs.writeFileSync('.husky/pre-push', pushHookContent);
  if (!isWindows) {
    runCommand('chmod +x .husky/pre-push');
  }

  // Create basic ESLint config if none exists
  if (!fs.existsSync('.eslintrc.json')) {
    console.log(chalk.yellow('Creating ESLint config...'));
    const eslintConfig = {
      env: { node: true, es2021: true },
      extends: ['eslint:recommended'],
      parserOptions: { ecmaVersion: 12, sourceType: 'script' },
      rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
      },
    };
    fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
  }

  // Create cache directory
  const cacheDir = path.join(__dirname, '.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  console.log(
    chalk.green(
      '\n✅ Setup complete! Code Review Agent will run on every commit.'
    )
  );
  console.log(chalk.cyan('\n💡 Features:'));
  console.log('  • Automatic code fixing');
  console.log('  • Parallel validation checks');
  console.log('  • Smart caching (5min)');
  console.log('  • Dual AI integration (Q Pro + Copilot)');
} catch (error) {
  console.error(chalk.red('❌ Setup failed:'), error.message);
  process.exit(1);
}
