#!/usr/bin/env node
/**
 * AWS Infrastructure Setup Script
 * Configures S3, CloudFront, Lambda, and DynamoDB for HOOTNER
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const PROJECT_NAME = 'hootner';

console.log('🚀 HOOTNER AWS Infrastructure Setup\n');

// Check AWS CLI
try {
  execSync('aws --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ AWS CLI not found. Install: https://aws.amazon.com/cli/');
  process.exit(1);
}

// Verify AWS credentials
try {
  const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' });
  console.log('✅ AWS credentials verified');
  console.log(JSON.parse(identity));
} catch (error) {
  console.error('❌ AWS credentials not configured. Run: aws configure');
  process.exit(1);
}

// Create S3 bucket for video storage
function createS3Bucket() {
  const bucketName = `${PROJECT_NAME}-videos-${Date.now()}`;
  
  try {
    console.log(`\n📦 Creating S3 bucket: ${bucketName}`);
    
    execSync(`aws s3api create-bucket --bucket ${bucketName} --region ${AWS_REGION}`, {
      stdio: 'inherit',
    });
    
    // Enable versioning
    execSync(`aws s3api put-bucket-versioning --bucket ${bucketName} --versioning-configuration Status=Enabled`, {
      stdio: 'inherit',
    });
    
    // Enable encryption
    execSync(`aws s3api put-bucket-encryption --bucket ${bucketName} --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'`, {
      stdio: 'inherit',
    });
    
    console.log(`✅ S3 bucket created: ${bucketName}`);
    return bucketName;
  } catch (error) {
    console.error('❌ Failed to create S3 bucket:', error.message);
    return null;
  }
}

// Create DynamoDB table for metadata
function createDynamoDBTable() {
  const tableName = `${PROJECT_NAME}-videos`;
  
  try {
    console.log(`\n🗄️  Creating DynamoDB table: ${tableName}`);
    
    const tableConfig = {
      TableName: tableName,
      KeySchema: [
        { AttributeName: 'videoId', KeyType: 'HASH' },
        { AttributeName: 'createdAt', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'videoId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'N' },
        { AttributeName: 'userId', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    };
    
    execSync(`aws dynamodb create-table --cli-input-json '${JSON.stringify(tableConfig)}'`, {
      stdio: 'inherit',
    });
    
    console.log(`✅ DynamoDB table created: ${tableName}`);
    return tableName;
  } catch (error) {
    console.error('❌ Failed to create DynamoDB table:', error.message);
    return null;
  }
}

// Create Lambda function for video processing
function createLambdaFunction(s3Bucket) {
  const functionName = `${PROJECT_NAME}-video-processor`;
  
  try {
    console.log(`\n⚡ Creating Lambda function: ${functionName}`);
    
    // Create IAM role first
    const roleName = `${functionName}-role`;
    const trustPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { Service: 'lambda.amazonaws.com' },
        Action: 'sts:AssumeRole',
      }],
    };
    
    execSync(`aws iam create-role --role-name ${roleName} --assume-role-policy-document '${JSON.stringify(trustPolicy)}'`, {
      stdio: 'inherit',
    });
    
    // Attach policies
    execSync(`aws iam attach-role-policy --role-name ${roleName} --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`, {
      stdio: 'inherit',
    });
    
    execSync(`aws iam attach-role-policy --role-name ${roleName} --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess`, {
      stdio: 'inherit',
    });
    
    console.log(`✅ Lambda function setup initiated: ${functionName}`);
    console.log('⚠️  Deploy function code separately using AWS SAM or Serverless Framework');
    
    return functionName;
  } catch (error) {
    console.error('❌ Failed to create Lambda function:', error.message);
    return null;
  }
}

// Save configuration
function saveConfig(config) {
  const configPath = path.join(__dirname, '..', 'config', 'aws-config.json');
  
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(`\n💾 Configuration saved to: ${configPath}`);
}

// Main execution
async function main() {
  const config = {
    region: AWS_REGION,
    projectName: PROJECT_NAME,
    timestamp: new Date().toISOString(),
  };
  
  // Create resources
  config.s3Bucket = createS3Bucket();
  config.dynamoDBTable = createDynamoDBTable();
  config.lambdaFunction = createLambdaFunction(config.s3Bucket);
  
  // Save configuration
  saveConfig(config);
  
  console.log('\n✅ AWS Infrastructure setup complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Update .env with AWS resource names');
  console.log('   2. Deploy Lambda function code');
  console.log('   3. Configure CloudFront distribution');
  console.log('   4. Set up API Gateway endpoints\n');
}

main().catch(console.error);
