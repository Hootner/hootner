#!/usr/bin/env node

/**
 * Test Upload Pipeline - ES Module Version
 */

import { generateUploadURL, validateUpload } from '../services/s3-upload-service.js';

async function testUpload() {
  try {
    console.log('🧪 Testing upload pipeline...');
    
    // Test file validation
    console.log('1. Testing file validation...');
    validateUpload('test-video.mp4', 1024 * 1024, 'video/mp4'); // 1MB
    console.log('✅ File validation passed');
    
    // Test presigned URL generation
    console.log('2. Testing presigned URL generation...');
    const result = await generateUploadURL('test-user-123', 'test-video.mp4', 'video/mp4');
    console.log('✅ Presigned URL generated:', {
      bucket: result.bucket,
      fileKey: result.fileKey,
      expiresIn: result.expiresIn
    });
    
    console.log('\n🎉 Upload pipeline is working correctly!');
    console.log('📝 Next steps:');
    console.log('   - Start your server: npm run start:all');
    console.log('   - Test upload via frontend: http://localhost:3000/upload-video.html');
    
  } catch (error) {
    console.error('❌ Upload pipeline test failed:', error.message);
    process.exit(1);
  }
}

testUpload();