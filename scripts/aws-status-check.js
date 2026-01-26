#!/usr/bin/env node
/**
 * AWS Status Checker
 * Shows current AWS account status in a beginner-friendly way
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function print(color, icon, text) {
  console.log(`${color}${icon} ${text}${colors.reset}`);
}

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return null;
  }
}

console.log(`\n${colors.bright}${colors.blue}🦉 HOOTNER AWS Status Check${colors.reset}\n`);

// Check local config
const localConfig = '.hootner/config.json';
if (existsSync(localConfig)) {
  const config = JSON.parse(readFileSync(localConfig, 'utf8'));

  if (config.mode === 'local') {
    print(colors.cyan, 'ℹ', 'Running in Local Mode (no AWS needed)');
    print(colors.green, '✓', 'Local DynamoDB enabled');
    print(colors.green, '✓', 'Local file storage enabled');
    console.log(`\n${colors.cyan}To switch to AWS mode, run: npm run aws:onboard${colors.reset}\n`);
    process.exit(0);
  }
}

// Check AWS CLI
const awsCLI = exec('aws --version');
if (!awsCLI) {
  print(colors.red, '✗', 'AWS CLI not installed');
  console.log(`\n${colors.cyan}Install AWS CLI: https://aws.amazon.com/cli/${colors.reset}`);
  console.log(`${colors.cyan}Or run: npm run aws:onboard${colors.reset}\n`);
  process.exit(1);
}

print(colors.green, '✓', `AWS CLI installed: ${awsCLI.trim()}`);

// Check for credentials
const awsDir = join(homedir(), '.aws');
const credentialsFile = join(awsDir, 'credentials');
const configFile = join(awsDir, 'config');

if (!existsSync(credentialsFile) && !existsSync(configFile)) {
  print(colors.yellow, '⚠', 'AWS credentials not found');
  console.log(`\n${colors.cyan}Run setup wizard: npm run aws:onboard${colors.reset}\n`);
  process.exit(1);
}

print(colors.green, '✓', 'AWS credentials configured');

// Check current AWS profile
const profile = process.env.AWS_PROFILE;
if (profile) {
  print(colors.cyan, 'ℹ', `Using profile: ${profile}`);
}

// Test AWS connection
const identity = exec('aws sts get-caller-identity');
if (!identity) {
  print(colors.red, '✗', 'Cannot connect to AWS');
  console.log(`\n${colors.yellow}Your credentials might be invalid or expired.${colors.reset}`);
  console.log(`${colors.cyan}Re-run setup: npm run aws:onboard${colors.reset}\n`);
  process.exit(1);
}

const identityData = JSON.parse(identity);
print(colors.green, '✓', 'Connected to AWS');
console.log(`\n${colors.cyan}Account Details:${colors.reset}`);
console.log(`  Account ID: ${identityData.Account}`);
console.log(`  User ARN:   ${identityData.Arn}`);
console.log(`  User ID:    ${identityData.UserId}`);

// Check default region
const region = exec('aws configure get region') || 'not set';
console.log(`  Region:     ${region.trim()}`);

// Check for deployed resources
console.log(`\n${colors.cyan}Checking deployed resources...${colors.reset}`);

const stacks = exec('aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?contains(StackName, \'hootner\')].StackName" --output text');

if (stacks && stacks.trim()) {
  print(colors.green, '✓', `Found CloudFormation stacks: ${stacks.trim()}`);
} else {
  print(colors.yellow, 'ℹ', 'No HOOTNER stacks deployed yet');
  console.log(`\n${colors.cyan}Deploy infrastructure: npm run aws:deploy${colors.reset}`);
}

console.log(`\n${colors.green}${colors.bright}✓ All systems operational${colors.reset}\n`);

// Show helpful commands
console.log(`${colors.cyan}Helpful commands:${colors.reset}`);
console.log('  npm run aws:deploy     - Deploy to AWS');
console.log('  npm run aws:onboard    - Re-run setup wizard');
console.log('  npm run aws:check      - Quick credential check');
console.log('  npm run start:all      - Start local dev server\n');
