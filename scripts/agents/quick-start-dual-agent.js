#!/usr/bin/env node

/**
 * Quick Start - Dual Agent Setup Verification
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🤖 HOOTNER Dual-Agent Quick Start\n');

// Check AWS CLI
console.log('1️⃣ Checking AWS CLI...');
try {
  execSync('aws --version', { stdio: 'pipe' });
  console.log('   ✅ AWS CLI installed\n');
} catch {
  console.log('   ❌ AWS CLI not found');
  console.log('   Install: https://aws.amazon.com/cli/\n');
}

// Check AWS credentials
console.log('2️⃣ Checking AWS credentials...');
try {
  const identity = execSync('aws sts get-caller-identity', { stdio: 'pipe' }).toString();
  console.log('   ✅ AWS credentials configured');
  console.log('   ' + JSON.parse(identity).Arn + '\n');
} catch {
  console.log('   ❌ AWS credentials not configured');
  console.log('   Run: aws configure\n');
}

// Check dual-agent config
console.log('3️⃣ Checking dual-agent configuration...');
const configPath = '.vscode/dual-agent-config.json';
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log(`   ✅ Dual-agent: ${config.dualAgent.enabled ? 'ENABLED' : 'DISABLED'}`);
  console.log(`   Mode: ${config.dualAgent.mode}`);
  console.log(`   Primary: ${config.dualAgent.primaryAgent}\n`);
} else {
  console.log('   ❌ Config file not found\n');
}

// Next steps
console.log('📋 Next Steps:\n');
console.log('   1. Configure AWS: aws configure');
console.log('   2. Enable dual-agent: npm run dual-agent:enable');
console.log('   3. Sign in to Copilot: Ctrl+Shift+P → "GitHub Copilot: Sign in"');
console.log('   4. Sign in to Amazon Q: Ctrl+Q → "Start Web Experience"');
console.log('   5. Check status: npm run dual-agent:status\n');

console.log('📚 Full guide: DUAL_AGENT_SETUP.md\n');
