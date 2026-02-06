#!/usr/bin/env node

/**
 * Fix Upload Pipeline - Create S3 bucket and configure environment
 */

const { S3Client, CreateBucketCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3Client = new S3Client({ region: 'us-east-1' });

async function createUploadBucket() {
  const accountId = '504165876439'; // From your credentials
  const bucketName = `hootner-uploads-${accountId}`;
  
  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Bucket ${bucketName} already exists`);
    return bucketName;
  } catch (error) {
    if (error.name === 'NotFound') {
      // Create bucket
      console.log(`🚀 Creating bucket: ${bucketName}`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`✅ Created bucket: ${bucketName}`);
      return bucketName;
    }
    throw error;
  }
}

async function updateEnvironment(bucketName) {
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Add S3 configuration
  const s3Config = `
# S3 Upload Configuration
UPLOAD_BUCKET=${bucketName}
VIDEO_BUCKET=${bucketName}
AWS_REGION=us-east-1
IS_OFFLINE=false
`;

  if (!envContent.includes('UPLOAD_BUCKET')) {
    envContent += s3Config;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env with S3 configuration');
  }
}

async function main() {
  try {
    console.log('🔧 Fixing upload pipeline...');
    
    const bucketName = await createUploadBucket();
    await updateEnvironment(bucketName);
    
    console.log('\n✅ Upload pipeline fixed!');
    console.log(`📦 Bucket: ${bucketName}`);
    console.log('🚀 You can now test uploads');
    
  } catch (error) {
    console.error('❌ Error fixing upload pipeline:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createUploadBucket, updateEnvironment };