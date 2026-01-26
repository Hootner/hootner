#!/usr/bin/env node
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || 'hootner-frontend';
const CLOUDFRONT_DIST_ID = process.env.CLOUDFRONT_DIST_ID;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const FILE_PATH = 'hexarchy/4-interface/ui/pages/dashboard.html';
const S3_KEY = 'pages/dashboard.html';

// Validate required environment variables
if (!CLOUDFRONT_DIST_ID) {
  console.error('❌ ERROR: CLOUDFRONT_DIST_ID environment variable is required');
  console.error('   Set it in your .env file or export it:');
  console.error('   export CLOUDFRONT_DIST_ID=E3QJZQXQXQXQXQ');
  process.exit(1);
}

async function deploy() {
  console.log('🚀 Deploying enhanced dashboard...\n');

  // Read file
  const fileContent = fs.readFileSync(path.join(__dirname, FILE_PATH));

  console.log(`📦 Deploying to S3 bucket: ${BUCKET_NAME}`);
  console.log(`🌐 CloudFront distribution: ${CLOUDFRONT_DIST_ID}`);
  console.log(`🗺️  Region: ${AWS_REGION}\n`);

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
  console.log(`🌐 Live at: https://daxqx65ar35pp.cloudfront.net/${S3_KEY}`);
}

deploy();
