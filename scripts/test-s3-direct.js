#!/usr/bin/env node

import { config } from 'dotenv';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

config();

async function testS3Connection() {
  console.log('🔧 Testing S3 Connection...');
  
  const bucketName = 'hootner-uploads-504165876439';
  
  // Test with default credentials
  const s3Client = new S3Client({ 
    region: 'us-east-1'
  });
  
  try {
    console.log(`Testing bucket: ${bucketName}`);
    const result = await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('✅ S3 connection successful!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    console.error('Error code:', error.name);
    
    if (error.name === 'CredentialsProviderError') {
      console.log('💡 Try: aws configure');
    }
  }
}

testS3Connection();