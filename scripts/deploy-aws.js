#!/usr/bin/env node

// AWS Managed Services - No local infrastructure needed
// Deploy HOOTNER directly to AWS

const { execSync } = require('child_process');

const exec = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
};

console.log('🦉 Deploying HOOTNER to AWS...\n');

console.log('📋 AWS Managed Services:');
console.log('   ✓ DynamoDB - Fully managed NoSQL');
console.log('   ✓ ElastiCache (Redis) - Managed caching');
console.log('   ✓ S3 - File storage');
console.log('   ✓ ECS Fargate - Serverless containers');
console.log('   ✓ SageMaker - AI/ML models');
console.log('   ✓ RDS - Managed database (if needed)');
console.log('   ✓ CloudFront - CDN');
console.log('   ✓ Lambda - Serverless functions\n');

// Check AWS CLI
try {
  execSync('aws --version', { stdio: 'pipe' });
  console.log('✓ AWS CLI installed\n');
} catch {
  console.log('❌ AWS CLI not found. Install: https://aws.amazon.com/cli/');
  process.exit(1);
}

// Check credentials
try {
  execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  console.log('✓ AWS credentials configured\n');
} catch {
  console.log('❌ AWS credentials not configured. Run: aws configure');
  process.exit(1);
}

// Deploy infrastructure
console.log('🚀 Deploying infrastructure with Terraform...\n');
exec('cd terraform && terraform init');
exec('cd terraform && terraform apply -auto-approve');

console.log('\n✅ HOOTNER deployed to AWS!');
console.log('\n📊 Get outputs:');
console.log('   cd terraform && terraform output');
