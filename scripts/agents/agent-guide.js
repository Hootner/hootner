#!/usr/bin/env node

/**
 * Quick Start Guide for Advanced Agents
 */

import chalk from 'chalk';

console.log(chalk.bold.cyan('\n🎭 HOOTNER Advanced Agent Capabilities\n'));

console.log(chalk.bold('📦 Installation'));
console.log('   npm install\n');

console.log(chalk.bold('🚀 Quick Start Commands\n'));

console.log(chalk.yellow('1. Initialize Orchestrator:'));
console.log('   npm run orchestrator:init\n');

console.log(chalk.yellow('2. Check Status:'));
console.log('   npm run orchestrator:status\n');

console.log(chalk.yellow('3. Run Code Analysis:'));
console.log('   npm run orchestrator:analyze');
console.log('   npm run orchestrator:analyze -- --auto-fix\n');

console.log(chalk.yellow('4. Deploy Application:'));
console.log('   npm run orchestrator:deploy');
console.log('   npm run orchestrator:deploy -- --env staging\n');

console.log(chalk.yellow('5. Generate Documentation:'));
console.log('   npm run orchestrator:docs\n');

console.log(chalk.yellow('6. Run Maintenance:'));
console.log('   npm run orchestrator:maintenance\n');

console.log(chalk.bold.green('🤖 Available Agents:\n'));

const agents = [
    { name: 'Intelligent Code Agent', desc: 'Code analysis & auto-refactoring' },
    { name: 'Continuous Learning Agent', desc: 'Pattern recognition & adaptation' },
    { name: 'Predictive Maintenance Agent', desc: 'Anomaly detection & auto-remediation' },
    { name: 'Autonomous Deployment Agent', desc: 'CI/CD orchestration & canary deployments' },
    { name: 'Intelligent Documentation Agent', desc: 'Auto-documentation generation' }
];

agents.forEach((agent, i) => {
    console.log(`   ${i + 1}. ` + chalk.cyan(agent.name) + '');
    console.log('      ' + chalk.dim(agent.desc) + '');
});

console.log(chalk.bold('\n📊 Workflow Examples:\n'));

console.log(chalk.cyan('Code Analysis Workflow:'));
console.log('   Analyze → Scan Security → Generate Recommendations → Auto-Fix\n');

console.log(chalk.cyan('Deployment Workflow:'));
console.log('   Health Check → Deploy → Monitor → Report\n');

console.log(chalk.cyan('Documentation Workflow:'));
console.log('   Code Analysis → Generate Docs → Add Insights → Publish\n');

console.log(chalk.bold.magenta('\n🎯 GitHub Actions Integration:\n'));
console.log('   • Code Analysis on PR');
console.log('   • Daily Predictive Maintenance (2 AM UTC)');
console.log('   • Auto-Documentation on Push');
console.log('   • Continuous Learning');

console.log(chalk.bold('\n📚 Documentation:\n'));
console.log('   See ' + chalk.cyan('docs/ADVANCED_AGENTS.md') + ' for full guide\n');

console.log(chalk.bold('💡 Tips:\n'));
console.log('   • Use --auto-fix carefully - test on branches first');
console.log('   • Monitor agent status regularly');
console.log('   • Leverage predictive maintenance for planning');
console.log('   • Provide feedback to improve learning');

console.log(chalk.bold.green('\n✨ Ready to orchestrate!\n'));
