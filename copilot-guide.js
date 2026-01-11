#!/usr/bin/env node
import chalk from 'chalk';

console.log(chalk.blue('🤖 Copilot Task Delegation Guide'));

console.log(chalk.green('\n📋 Delegate Tasks:'));
console.log('node copilot-delegate.js delegate "Fix security vulnerabilities" code-review-agent.js');
console.log('node copilot-delegate.js delegate "Add error handling" *.js');
console.log('node copilot-delegate.js delegate "Optimize performance"');

console.log(chalk.yellow('\n🔍 Monitor Progress:'));
console.log('node copilot-delegate.js monitor');

console.log(chalk.cyan('\n✅ Complete Tasks:'));
console.log('node copilot-delegate.js complete 1234567890');

console.log(chalk.purple('\n🎯 Copilot Workflow:'));
console.log('1. Delegate task → Get Copilot instructions');
console.log('2. Use @workspace /fix in your IDE');
console.log('3. Add // COPILOT: comments to your changes');
console.log('4. Monitor shows progress automatically');
console.log('5. Mark complete when done');

console.log(chalk.magenta('\n⚡ Pro Tips:'));
console.log('• Tasks auto-monitor every 30 minutes via GitHub Actions');
console.log('• Use specific file names for targeted fixes');
console.log('• Copilot works best with clear, specific descriptions');
console.log('• Check GitHub Actions tab for automated monitoring\n');