#!/usr/bin/env node

/**
 * CloudFront Deployment Script
 * Uploads static assets to S3 and invalidates CloudFront cache
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_DIR = path.join(__dirname, '../apps/frontend');
const BUCKET_NAME = process.env.STATIC_ASSETS_BUCKET;
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
const REGION = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({ region: REGION });
const cloudFrontClient = new CloudFrontClient({ region: REGION });

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload file to S3
 */
async function uploadFile(filePath, key) {
  const content = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: content,
    ContentType: contentType,
    CacheControl: key.includes('.html') ? 'max-age=300' : 'max-age=31536000'
  }));

  console.log(`✓ Uploaded: ${key}`);
}

/**
 * Upload directory recursively
 */
async function uploadDirectory(dir, prefix = '') {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await uploadDirectory(filePath, path.join(prefix, file));
    } else {
      const key = path.join(prefix, file).replace(/\\/g, '/');
      await uploadFile(filePath, key);
    }
  }
}

/**
 * Invalidate CloudFront cache
 */
async function invalidateCache(paths = ['/*']) {
  if (!DISTRIBUTION_ID) {
    console.log('⚠ No CloudFront distribution ID - skipping cache invalidation');
    return;
  }

  const response = await cloudFrontClient.send(new CreateInvalidationCommand({
    DistributionId: DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths
      }
    }
  }));

  console.log(`✓ CloudFront invalidation created: ${response.Invalidation.Id}`);
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 Starting CloudFront deployment...\n');

  if (!BUCKET_NAME) {
    console.error('❌ Error: STATIC_ASSETS_BUCKET environment variable not set');
    process.exit(1);
  }

  try {
    // Build frontend (if needed)
    console.log('📦 Building frontend...');
    try {
      execSync('npm run build:frontend', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log('✓ Frontend built\n');
    } catch {
      console.log('⚠ No build script found, uploading existing files\n');
    }

    // Upload static assets
    console.log('☁️  Uploading to S3...');

    // Upload HTML files
    const htmlDir = path.join(FRONTEND_DIR, 'html-pages');
    if (fs.existsSync(htmlDir)) {
      await uploadDirectory(htmlDir);
    }

    // Upload dashboard files
    const dashboardFile = path.join(__dirname, '../redirect-dashboard.html');
    if (fs.existsSync(dashboardFile)) {
      await uploadFile(dashboardFile, 'dashboard.html');
    }

    // Upload CSS files
    const cssDir = path.join(FRONTEND_DIR, 'css');
    if (fs.existsSync(cssDir)) {
      await uploadDirectory(cssDir, 'css');
    }

    // Upload JS files
    const jsDir = path.join(FRONTEND_DIR, 'js');
    if (fs.existsSync(jsDir)) {
      await uploadDirectory(jsDir, 'js');
    }

    // Upload assets
    const assetsDir = path.join(FRONTEND_DIR, 'assets');
    if (fs.existsSync(assetsDir)) {
      await uploadDirectory(assetsDir, 'assets');
    }

    console.log('\n✓ All files uploaded to S3');

    // Invalidate CloudFront cache
    console.log('\n🔄 Invalidating CloudFront cache...');
    await invalidateCache();

    console.log('\n✅ Deployment complete!');
    console.log(`\n🌐 Your site will be available at: https://${process.env.CLOUDFRONT_DOMAIN || 'your-distribution-domain.cloudfront.net'}\n`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deploy();
}

module.exports = { deploy, uploadFile, invalidateCache };
