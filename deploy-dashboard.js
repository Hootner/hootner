#!/usr/bin/env node
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if present
// This is optional - environment variables can be set directly via shell
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (err) {
  // dotenv is optional - environment variables can be set directly
  // Silently continue if not available
}

// Get configuration from environment variables
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hootner-frontend';
const CLOUDFRONT_DIST_ID = process.env.CLOUDFRONT_DIST_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const FILE_PATH = 'hexarchy/4-interface/ui/pages/dashboard.html';
const S3_KEY = 'pages/dashboard.html';

// Validate required environment variables
if (!CLOUDFRONT_DIST_ID) {
  console.error('❌ Error: CLOUDFRONT_DIST_ID environment variable is required');
  console.error('');
  console.error('Please set it in one of the following ways:');
  console.error('  1. Add to .env file: CLOUDFRONT_DIST_ID=E1234ABCDEF567');
  console.error('  2. Export in shell: export CLOUDFRONT_DIST_ID=E1234ABCDEF567');
  console.error('  3. Run with env var: CLOUDFRONT_DIST_ID=E1234ABCDEF567 node deploy-dashboard.js');
  console.error('');
  console.error('See .env.example for all configuration options.');
  process.exit(1);
}

async function deploy() {
  console.log('🚀 Deploying enhanced dashboard...\n');
  console.log('Configuration:');
  console.log(`  S3 Bucket: ${BUCKET_NAME}`);
  console.log(`  CloudFront Distribution: ${CLOUDFRONT_DIST_ID}`);
  console.log(`  AWS Region: ${AWS_REGION}`);
  console.log(`  File: ${FILE_PATH}`);
  console.log('');

  // Read file
  const fileContent = fs.readFileSync(path.join(__dirname, FILE_PATH));
  
  // Upload to S3
  const s3Client = new S3Client({ region: AWS_REGION });
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: S3_KEY,
      Body: fileContent,
      ContentType: 'text/html',
      CacheControl: 'max-age=300'
    }));
    console.log('✅ Uploaded to S3');
  } catch (err) {
    console.error('❌ S3 upload failed:', err.message);
    process.exit(1);
  }

  // Invalidate CloudFront
  const cfClient = new CloudFrontClient({ region: AWS_REGION });
  
  try {
    await cfClient.send(new CreateInvalidationCommand({
      DistributionId: CLOUDFRONT_DIST_ID,
      InvalidationBatch: {
        CallerReference: `dashboard-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: [`/${S3_KEY}`]
        }
      }
    }));
    console.log('✅ CloudFront cache invalidated');
  } catch (err) {
    console.error('❌ CloudFront invalidation failed:', err.message);
  }

  console.log('\n🎉 Deployment complete!');
  
  // Display CloudFront URL
  const cloudfrontUrl = process.env.CLOUDFRONT_URL || 
    `https://${CLOUDFRONT_DIST_ID.toLowerCase()}.cloudfront.net`;
  console.log(`🌐 Live at: ${cloudfrontUrl}/${S3_KEY}`);
}

deploy();
