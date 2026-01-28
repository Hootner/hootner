#!/usr/bin/env node

/**
 * Deploy AWS Serverless Lambda Infrastructure
 * Minimal deployment script for HOOTNER platform
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const exec = (cmd, options = {}) => {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', shell: true, ...options });
};

async function deployServerless() {
  console.log('🦉 Deploying HOOTNER Serverless Infrastructure\n');

  // Check prerequisites
  try {
    exec('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✓ AWS credentials configured');
  } catch {
    console.log('❌ AWS credentials not found. Run: npm run aws:onboard');
    process.exit(1);
  }

  try {
    exec('sam --version', { stdio: 'pipe' });
    console.log('✓ SAM CLI available');
  } catch {
    console.log('❌ SAM CLI not found. Install: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html');
    process.exit(1);
  }

  // Build and deploy
  console.log('\n🔨 Building serverless application...');
  exec('sam build --template-file template-enhanced.yaml');

  console.log('\n🚀 Deploying to AWS...');
  exec('sam deploy --guided --template-file template-enhanced.yaml');

  console.log('\n✅ Deployment complete!');
  console.log('\n📊 Get stack outputs:');
  console.log('   aws cloudformation describe-stacks --stack-name hootner-platform --query "Stacks[0].Outputs"');
}

deployServerless().catch(error => {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
});