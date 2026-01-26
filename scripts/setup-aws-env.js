#!/usr/bin/env node

/**
 * AWS Environment Setup Script
 * Fetches CloudFormation outputs and creates .env file
 */

const { CloudFormationClient, DescribeStacksCommand } = require('@aws-sdk/client-cloudformation');
const fs = require('fs');
const path = require('path');

const STACK_NAME = process.env.AWS_STACK_NAME || 'hootner';
const REGION = process.env.AWS_REGION || 'us-east-1';
const ENV_FILE = path.join(__dirname, '../.env.aws');

const cfClient = new CloudFormationClient({ region: REGION });

/**
 * Get CloudFormation stack outputs
 */
async function getStackOutputs() {
  try {
    const response = await cfClient.send(new DescribeStacksCommand({
      StackName: STACK_NAME
    }));

    const stack = response.Stacks[0];
    if (!stack) {
      throw new Error(`Stack ${STACK_NAME} not found`);
    }

    return stack.Outputs.reduce((acc, output) => {
      acc[output.OutputKey] = output.OutputValue;
      return acc;
    }, {});

  } catch (error) {
    console.error('Error fetching stack outputs:', error);
    throw error;
  }
}

/**
 * Create .env file from outputs
 */
async function createEnvFile() {
  console.log('🔍 Fetching CloudFormation stack outputs...\n');

  const outputs = await getStackOutputs();

  const envContent = `# Auto-generated AWS environment variables
# Stack: ${STACK_NAME}
# Region: ${REGION}
# Generated: ${new Date().toISOString()}

# AWS Configuration
AWS_REGION=${REGION}
AWS_STACK_NAME=${STACK_NAME}
NODE_ENV=production

# API Endpoints
API_ENDPOINT=${outputs.ApiEndpoint || ''}
GRAPHQL_ENDPOINT=${outputs.GraphQLEndpoint || ''}

# CloudFront
CLOUDFRONT_DOMAIN=${outputs.CloudFrontDomain || ''}
CLOUDFRONT_URL=${outputs.CloudFrontURL || ''}
CLOUDFRONT_DISTRIBUTION_ID=${getDistributionId(outputs.CloudFrontDomain) || ''}

# Authentication
USER_POOL_ID=${outputs.UserPoolId || ''}
USER_POOL_CLIENT_ID=${outputs.UserPoolClientId || ''}

# Storage
VIDEO_BUCKET=${outputs.VideoStorageBucket || ''}
UPLOAD_BUCKET=${outputs.UploadBucket || ''}
STATIC_ASSETS_BUCKET=${outputs.StaticAssetsBucket || ''}

# Database
TABLE_NAME=${outputs.DynamoDBTableName || 'HootnerActivities'}

# Queues
VIDEO_QUEUE_URL=${outputs.VideoProcessingQueueUrl || ''}

# API Keys (from Secrets Manager - fetch at runtime)
API_KEYS_SECRET_NAME=${STACK_NAME}/api-keys
JWT_SECRET_NAME=${STACK_NAME}/jwt-secret

# API Key (for API Gateway)
API_KEY_ID=${outputs.ApiKeyId || ''}
`;

  fs.writeFileSync(ENV_FILE, envContent);
  console.log(`✅ Environment file created: ${ENV_FILE}\n`);

  // Print summary
  console.log('📋 Configuration Summary:');
  console.log(`   API Endpoint: ${outputs.ApiEndpoint || 'N/A'}`);
  console.log(`   GraphQL: ${outputs.GraphQLEndpoint || 'N/A'}`);
  console.log(`   CloudFront: ${outputs.CloudFrontURL || 'N/A'}`);
  console.log(`   User Pool: ${outputs.UserPoolId || 'N/A'}`);
  console.log(`   Video Bucket: ${outputs.VideoStorageBucket || 'N/A'}`);
  console.log(`   Table: ${outputs.DynamoDBTableName || 'N/A'}`);
  console.log();
}

/**
 * Extract distribution ID from domain (simplified)
 */
function getDistributionId(domain) {
  // In production, you'd query CloudFront API
  // For now, return placeholder
  return process.env.CLOUDFRONT_DISTRIBUTION_ID || '';
}

// Run
createEnvFile().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
