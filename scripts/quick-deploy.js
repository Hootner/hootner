#!/usr/bin/env node

/**
 * Quick Deployment Script
 * One-command deployment to AWS
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HOOTNER Quick Deployment\n');

function run(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} complete`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function deploy() {
  // Check if AWS CLI is configured
  console.log('🔍 Checking AWS configuration...');
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS credentials found\n');
  } catch {
    console.error('❌ AWS credentials not configured. Run: npm run aws:onboard');
    process.exit(1);
  }

  // Install dependencies
  if (!run('npm install', 'Installing dependencies')) {
    process.exit(1);
  }

  // Install Lambda layer dependencies
  if (!run('npm run layer:install', 'Installing Lambda layer')) {
    process.exit(1);
  }

  // Build SAM application
  if (!run('sam build', 'Building SAM application')) {
    process.exit(1);
  }

  // Deploy to AWS
  console.log('\n📤 Deploying to AWS...');
  console.log('Note: First deployment requires --guided flag');

  const hasConfig = fs.existsSync(path.join(__dirname, 'samconfig.toml'));
  const deployCmd = hasConfig ? 'sam deploy' : 'sam deploy --guided';

  if (!run(deployCmd, 'Deploying CloudFormation stack')) {
    process.exit(1);
  }

  // Setup environment variables
  if (!run('node scripts/setup-aws-env.js', 'Setting up environment')) {
    console.log('⚠ Environment setup failed, but stack deployed');
  }

  // Deploy frontend to CloudFront (optional)
  console.log('\n📤 Deploy frontend to CloudFront? (y/n)');
  // For automation, skip interactive prompt
  // Uncomment for interactive: const readline = require('readline');

  console.log('✅ Deployment complete!\n');
  console.log('📋 Next steps:');
  console.log('   1. Check .env.aws for your endpoints');
  console.log('   2. Update secrets: aws secretsmanager put-secret-value ...');
  console.log('   3. Deploy frontend: npm run aws:deploy-cloudfront');
  console.log('   4. Test API: curl $API_ENDPOINT/health\n');
}

deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});
