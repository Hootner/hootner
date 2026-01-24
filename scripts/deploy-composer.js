#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Deploying HOOTNER APIs to AWS with DynamoDB...\n');

// Check AWS credentials
try {
  execSync('aws sts get-caller-identity', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ AWS credentials not configured. Run: aws configure');
  process.exit(1);
}

// Build SAM application
console.log('\n📦 Building SAM application...');
try {
  execSync('sam build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Deploy to AWS
console.log('\n🚀 Deploying to AWS...');
try {
  execSync('sam deploy --guided', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Deployment failed');
  process.exit(1);
}

console.log('\n✅ Deployment complete!');
console.log('\n📊 Stack outputs:');
execSync('aws cloudformation describe-stacks --stack-name hootner-platform --query "Stacks[0].Outputs"', { stdio: 'inherit' });
