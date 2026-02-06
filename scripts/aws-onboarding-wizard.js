#!/usr/bin/env node
/**
 * AWS Onboarding Wizard - Beginner Friendly
 *
 * Makes AWS setup painless for first-time users.
 * No AWS knowledge required - just follow the prompts.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise(resolve => rl.question(question, resolve));

// Color helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}\n`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.cyan}ℹ ${text}${colors.reset}`),
  step: (num, text) => console.log(`\n${colors.bright}Step ${num}:${colors.reset} ${text}`),
  plain: (text) => console.log(text)
};

// Check if command exists
function hasCommand(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Check AWS CLI installation
async function checkAWSCLI() {
  print.step(1, 'Checking for AWS CLI...');

  if (hasCommand('aws')) {
    print.success('AWS CLI is installed');
    return true;
  }

  print.warning('AWS CLI not found');
  print.plain('\nDon\'t worry! Let me help you install it.');
  print.info('Visit: https://aws.amazon.com/cli/');
  print.plain('\nQuick install:');
  print.plain('  Windows: Download MSI installer from link above');
  print.plain('  Mac: brew install awscli');
  print.plain('  Linux: sudo apt install awscli (or yum)');

  const wait = await ask('\nPress Enter after installing AWS CLI...');

  if (hasCommand('aws')) {
    print.success('AWS CLI detected!');
    return true;
  }

  print.error('Still can\'t find AWS CLI. Please install it and try again.');
  return false;
}

// Check if user has AWS account
async function checkAWSAccount() {
  print.step(2, 'AWS Account Setup');

  print.plain('\nDo you have an AWS account?');
  print.info('If you\'re not sure, you probably don\'t have one yet.');

  const hasAccount = await ask('Do you have an AWS account? (yes/no): ');

  if (hasAccount.toLowerCase().startsWith('n')) {
    print.plain('\n📝 Creating an AWS account:');
    print.plain('1. Go to: https://aws.amazon.com/');
    print.plain('2. Click "Create an AWS Account"');
    print.plain('3. Follow the signup process (needs credit card for verification)');
    print.plain('4. AWS Free Tier gives you 12 months of free services!');
    print.plain('   - Free tier includes: Lambda, DynamoDB, S3 (limited)');
    print.plain('   - Perfect for development and testing');
    print.info('\nNote: You won\'t be charged unless you exceed free tier limits');

    await ask('\nPress Enter when you\'ve created your account...');
  }

  print.success('Great! Let\'s continue with setup.');
}

// Guide user to get AWS credentials
async function getAWSCredentials() {
  print.step(3, 'Getting Your AWS Credentials');

  print.plain('\nAWS credentials are like a username/password for the AWS API.');
  print.plain('We need two things: Access Key ID and Secret Access Key\n');

  print.plain('To get your credentials:');
  print.plain('1. Go to: https://console.aws.amazon.com/iam/home#/security_credentials');
  print.plain('2. Click "Create access key" under "Access keys"');
  print.plain('3. Choose "Command Line Interface (CLI)"');
  print.plain('4. Check the box and click "Next"');
  print.plain('5. Add description: "HOOTNER Development"');
  print.plain('6. Click "Create access key"');
  print.plain('7. IMPORTANT: Download the CSV file (you can\'t see the secret again!)');

  print.warning('\n⚠️  Security tip: Never share these keys or commit them to git!');

  await ask('\nPress Enter when you have your credentials ready...');
}

// Configure AWS credentials
async function configureAWS() {
  print.step(4, 'Configuring AWS CLI');

  print.plain('\nI\'ll help you configure AWS CLI with your credentials.');

  const useWizard = await ask('\nUse interactive setup? (yes/no): ');

  if (useWizard.toLowerCase().startsWith('y')) {
    print.plain('\nEnter your credentials when prompted:');
    print.info('Paste your Access Key ID and Secret Access Key');
    print.info('Region: us-east-1 (recommended) or your preferred region');
    print.info('Output format: json (recommended)\n');

    try {
      execSync('aws configure', { stdio: 'inherit' });
      print.success('AWS CLI configured!');
    } catch (error) {
      print.error('Configuration failed. Try again.');
      return false;
    }
  }

  // Verify credentials
  print.plain('\nVerifying your credentials...');
  try {
    const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    const parsed = JSON.parse(identity);
    print.success('Credentials verified!');
    print.info(`Account: ${parsed.Account}`);
    print.info(`User: ${parsed.Arn}`);
    return true;
  } catch (error) {
    print.error('Credentials verification failed');
    print.plain('Your credentials might be incorrect. Let\'s try again.');
    return false;
  }
}

// Setup for local development (no AWS needed)
async function offerLocalMode() {
  print.step(0, 'Choose Your Development Mode');

  print.plain('\nHow do you want to develop?');
  print.plain('1. Local Mode - No AWS needed, everything runs on your computer (recommended for beginners)');
  print.plain('2. AWS Mode - Deploy to real AWS infrastructure (for production-like testing)');

  const choice = await ask('\nChoose mode (1 or 2): ');

  if (choice === '1') {
    print.success('Local Mode selected - No AWS setup needed!');
    print.plain('\nLocal mode uses:');
    print.plain('  • DynamoDB Local (no AWS account needed)');
    print.plain('  • Local file storage (no S3 needed)');
    print.plain('  • Express server (no Lambda needed)');

    // Create local config
    const localConfig = {
      mode: 'local',
      aws: {
        enabled: false,
        localDynamoDB: true,
        localStorage: true
      },
      setupDate: new Date().toISOString()
    };

    mkdirSync('.hootner', { recursive: true });
    writeFileSync('.hootner/config.json', JSON.stringify(localConfig, null, 2));

    print.success('\nLocal development environment configured!');
    print.plain('\nQuick start:');
    print.plain('  npm install');
    print.plain('  npm run start:all\n');

    return 'local';
  }

  return 'aws';
}

// Check for existing AWS configuration
function hasAWSConfig() {
  const awsDir = join(homedir(), '.aws');
  const credentialsFile = join(awsDir, 'credentials');
  const configFile = join(awsDir, 'config');

  return existsSync(credentialsFile) || existsSync(configFile);
}

// Test AWS connection
async function testAWSConnection() {
  print.plain('\nTesting AWS connection...');

  try {
    const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
    const parsed = JSON.parse(identity);
    print.success('AWS connection successful!');
    print.info(`Connected as: ${parsed.Arn}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Save configuration
function saveConfig(config) {
  mkdirSync('.hootner', { recursive: true });
  writeFileSync('.hootner/config.json', JSON.stringify(config, null, 2));
  print.success('Configuration saved to .hootner/config.json');
}

// Main wizard
async function main() {
  print.title('🦉 HOOTNER AWS Onboarding Wizard');
  print.plain('Welcome! This wizard will help you set up AWS - no prior AWS knowledge needed.\n');

  // Check if they already have AWS configured
  if (hasAWSConfig()) {
    print.info('Found existing AWS configuration!');
    const useExisting = await ask('Use existing AWS credentials? (yes/no): ');

    if (useExisting.toLowerCase().startsWith('y')) {
      const connected = await testAWSConnection();
      if (connected) {
        print.success('All set! Your AWS credentials work perfectly.');
        saveConfig({
          mode: 'aws',
          aws: { enabled: true },
          setupDate: new Date().toISOString()
        });
        rl.close();
        return;
      }
    }
  }

  // Offer local development mode
  const mode = await offerLocalMode();

  if (mode === 'local') {
    rl.close();
    return;
  }

  // Full AWS setup flow
  const hasCLI = await checkAWSCLI();
  if (!hasCLI) {
    rl.close();
    return;
  }

  await checkAWSAccount();
  await getAWSCredentials();

  let configured = false;
  while (!configured) {
    configured = await configureAWS();
    if (!configured) {
      const retry = await ask('\nTry again? (yes/no): ');
      if (!retry.toLowerCase().startsWith('y')) {
        print.info('No problem! You can run this wizard again anytime: npm run aws:onboard');
        rl.close();
        return;
      }
    }
  }

  // Save final configuration
  saveConfig({
    mode: 'aws',
    aws: { enabled: true },
    setupDate: new Date().toISOString()
  });

  print.title('✨ Setup Complete!');
  print.plain('You\'re ready to deploy to AWS.');
  print.plain('\nNext steps:');
  print.plain('  npm run aws:deploy     - Deploy infrastructure to AWS');
  print.plain('  npm run start:all      - Start local development server');
  print.plain('  npm run aws:status     - Check AWS deployment status\n');

  print.info('💡 Tip: Your AWS credentials are stored securely in ~/.aws/');
  print.info('💡 Tip: Switch between accounts anytime with: aws configure --profile <name>');

  rl.close();
}

// Error handling
process.on('unhandledRejection', (error) => {
  print.error(`Unexpected error: ${error.message}`);
  rl.close();
  process.exit(1);
});

main().catch(error => {
  print.error(`Error: ${error.message}`);
  rl.close();
  process.exit(1);
});
