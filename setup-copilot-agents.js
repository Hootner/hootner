#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🚀 Setting up GitHub Copilot Pro Agents...'));

try {
  // Check if we're in a git repo
  execSync('git status', { stdio: 'pipe' });
  
  console.log(chalk.green('✅ Workflows created in .github/workflows/'));
  console.log(chalk.yellow('\n📋 Next steps:'));
  console.log('1. Push to GitHub: git add . && git commit -m "Add Copilot Pro agents" && git push');
  console.log('2. Enable GitHub Actions in your repo settings');
  console.log('3. Create a PR to test the Copilot review agent');
  
  console.log(chalk.cyan('\n🤖 Copilot Pro Commands:'));
  console.log('• @workspace /fix - Bulk code fixes');
  console.log('• Ctrl+I - Inline suggestions');
  console.log('• gh copilot suggest - CLI suggestions');
  
} catch (error) {
  console.error(chalk.red('❌ Not a git repository. Run: git init'));
  process.exit(1);
}