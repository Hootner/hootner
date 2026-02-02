#!/usr/bin/env node

// Quick health check for HOOTNER platform
import { existsSync } from 'fs';
import { execSync } from 'child_process';

const checks = [
  {
    name: 'Node.js version',
    check: () => process.version.startsWith('v22') || process.version.startsWith('v20'),
    fix: 'Install Node.js 20+ or 22+'
  },
  {
    name: 'AWS template exists',
    check: () => existsSync('./template.yaml'),
    fix: 'Run: npm run aws:setup'
  },
  {
    name: 'Dependencies installed',
    check: () => existsSync('./node_modules'),
    fix: 'Run: npm install'
  },
  {
    name: 'Core services',
    check: () => existsSync('./hexarchy/service-orchestrator.js'),
    fix: 'Core services missing - check installation'
  },
  {
    name: 'Environment config',
    check: () => existsSync('./.env') || existsSync('./.env.example'),
    fix: 'Copy .env.example to .env'
  }
];

console.log('🔍 HOOTNER Health Check\n');

let issues = 0;
for (const check of checks) {
  try {
    if (check.check()) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - ${check.fix}`);
      issues++;
    }
  } catch (error) {
    console.log(`⚠️  ${check.name} - Error: ${error.message}`);
    issues++;
  }
}

console.log(`\n${issues === 0 ? '🎉 All checks passed!' : `⚠️  ${issues} issues found`}`);

if (issues === 0) {
  console.log('\n🚀 Ready to run: npm run start:all');
} else {
  console.log('\n🔧 Fix issues above, then run: npm run health-check');
}

process.exit(issues);