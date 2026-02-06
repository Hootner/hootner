#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 AWS Configuration Validator\n');

const checks = [
  { name: 'AWS CLI', cmd: 'aws --version' },
  { name: 'AWS Credentials', cmd: 'aws sts get-caller-identity' },
  { name: 'AWS Region', cmd: 'aws configure get region' }
];

let allPassed = true;

checks.forEach(({ name, cmd }) => {
  try {
    const result = execSync(cmd, { stdio: 'pipe' }).toString().trim();
    console.log(`✅ ${name}`);
    console.log(`   ${result}\n`);
  } catch {
    console.log(`❌ ${name} - Not configured\n`);
    allPassed = false;
  }
});

if (allPassed) {
  console.log('✅ All AWS checks passed!\n');
  console.log('Next: Press Ctrl+Q in VS Code to activate Amazon Q\n');
} else {
  console.log('⚠️  Setup required:\n');
  console.log('   npm run aws:configure');
  console.log('   or');
  console.log('   aws configure sso --profile Mastrian\n');
}
