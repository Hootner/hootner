#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

function runCommand(cmd) {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error(chalk.red(`Setup failed: ${cmd}`));
    throw new Error(`Setup operation failed: ${error.message}`);
  }
}

console.log('🔧 Setting up Code Review Agent...');

try {
  // Install dependencies
  runCommand('npm install --save-dev husky eslint chalk jsdoc');
  
  // Initialize husky
  runCommand('npx husky init');
  
  // Create pre-commit hook
  const hookContent = '#!/usr/bin/env sh\nnode dual-ai-review-agent.js\n';
  fs.writeFileSync('.husky/pre-commit', hookContent);
  runCommand('chmod +x .husky/pre-commit');
  
  // Create pre-push hook
  const pushHookContent = '#!/usr/bin/env sh\nnode pre-push-agent.js\n';
  fs.writeFileSync('.husky/pre-push', pushHookContent);
  runCommand('chmod +x .husky/pre-push');
  
  // Create basic ESLint config if none exists
  if (!fs.existsSync('.eslintrc.json')) {
    const eslintConfig = {
      'env': { 'node': true, 'es2021': true },
      'extends': ['eslint:recommended'],
      'parserOptions': { 'ecmaVersion': 12 },
      'rules': {}
    };
    fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
  }
  
  console.log('✅ Setup complete! Code Review Agent will run on every commit.');
} catch (error) {
  console.error(chalk.red('❌ Setup failed:'), error.message);
  process.exit(1);
}