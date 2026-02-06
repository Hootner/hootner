#!/usr/bin/env node

/**
 * Upload Pipeline Status Check
 */

import { config } from 'dotenv';
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { generateUploadURL, validateUpload } from '../services/s3-upload-service.js';

// Load environment variables
config();

const s3Client = new S3Client({ region: 'us-east-1' });

async function checkUploadPipelineStatus() {
  console.log('🔍 Checking Upload Pipeline Status...\n');
  
  const status = {
    s3Bucket: false,
    s3Access: false,
    uploadService: false,
    environment: false
  };

  try {
    // 1. Check S3 Bucket
    console.log('1. Checking S3 Bucket...');
    const bucketName = process.env.UPLOAD_BUCKET || 'hootner-uploads-504165876439';
    
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`   ✅ Bucket exists: ${bucketName}`);
      status.s3Bucket = true;
    } catch (error) {
      console.log(`   ❌ Bucket not found: ${bucketName}`);
      console.log(`   💡 Run: node scripts/fix-upload-pipeline.cjs`);
    }

    // 2. Check S3 Access
    if (status.s3Bucket) {
      console.log('2. Checking S3 Access...');
      try {
        await s3Client.send(new ListObjectsV2Command({ 
          Bucket: bucketName, 
          MaxKeys: 1 
        }));
        console.log('   ✅ S3 access working');
        status.s3Access = true;
      } catch (error) {
        console.log('   ❌ S3 access failed:', error.message);
      }
    }

    // 3. Check Upload Service
    console.log('3. Checking Upload Service...');
    try {
      validateUpload('test.mp4', 1024 * 1024, 'video/mp4');
      const result = await generateUploadURL('test-user', 'test.mp4', 'video/mp4');
      if (result.uploadURL && result.fileKey) {
        console.log('   ✅ Upload service working');
        status.uploadService = true;
      }
    } catch (error) {
      console.log('   ❌ Upload service failed:', error.message);
    }

    // 4. Check Environment
    console.log('4. Checking Environment...');
    const requiredEnvVars = ['UPLOAD_BUCKET', 'AWS_REGION'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      console.log('   ✅ Environment variables configured');
      status.environment = true;
    } else {
      console.log('   ❌ Missing environment variables:', missingVars.join(', '));
    }

    // Summary
    console.log('\n📊 Upload Pipeline Status:');
    console.log(`   S3 Bucket: ${status.s3Bucket ? '✅' : '❌'}`);
    console.log(`   S3 Access: ${status.s3Access ? '✅' : '❌'}`);
    console.log(`   Upload Service: ${status.uploadService ? '✅' : '❌'}`);
    console.log(`   Environment: ${status.environment ? '✅' : '❌'}`);

    const allGood = Object.values(status).every(s => s);
    
    if (allGood) {
      console.log('\n🎉 Upload pipeline is fully operational!');
      console.log('\n📝 Next steps:');
      console.log('   1. Start the server: npm run start:all');
      console.log('   2. Open: http://localhost:3000/upload-video.html');
      console.log('   3. Test file upload functionality');
    } else {
      console.log('\n⚠️  Upload pipeline needs attention');
      console.log('\n🔧 To fix issues:');
      console.log('   1. Run: node scripts/fix-upload-pipeline.cjs');
      console.log('   2. Check AWS credentials: aws sts get-caller-identity');
      console.log('   3. Verify .env file configuration');
    }

  } catch (error) {
    console.error('❌ Error checking upload pipeline:', error.message);
    process.exit(1);
  }
}

checkUploadPipelineStatus();