#!/usr/bin/env node

/**
 * Deploy HOOTNER to CloudFront/S3
 * Uploads all frontend files to fix 403 errors
 */

import { execSync } from 'child_process';
import fs from 'fs';

const CLOUDFRONT_URL = 'daxqx65ar35pp.cloudfront.net';

// Manual S3 bucket input (CloudFront distribution not accessible via CLI)
console.log('📦 Enter S3 bucket name (or press Ctrl+C and run: aws s3 ls)\n');
console.log('Example: hootner-frontend-prod\n');

const bucket = process.argv[2];
if (!bucket) {
  console.error('❌ Usage: node deploy-cloudfront.js <s3-bucket-name>');
  process.exit(1);
}

console.log(`📦 Deploying to: ${bucket}\n`);

// Deploy files
const deployments = [
  { src: 'apps/frontend/html-pages/', dest: 'pages/', desc: 'HTML Pages' },
  { src: 'apps/frontend/dist/', dest: 'assets/', desc: 'Static Assets' },
];

deployments.forEach(({ src, dest, desc }) => {
  if (fs.existsSync(src)) {
    console.log(`📤 Uploading ${desc}...`);
    execSync(`aws s3 sync ${src} s3://${bucket}/${dest} --delete --cache-control "max-age=3600"`, { stdio: 'inherit' });
  } else {
    console.log(`⚠️  ${src} not found, skipping ${desc}`);
  }
});

// Invalidate CloudFront cache
console.log('\n🔄 Invalidating CloudFront cache...');
try {
  execSync('aws cloudfront create-invalidation --distribution-id daxqx65ar35pp --paths "/*"', { stdio: 'inherit' });
} catch (err) {
  console.log('⚠️  Cache invalidation skipped (run manually if needed)');
}

console.log('\n✅ Deployment complete!\n');
console.log(`🌐 Dashboard: https://${CLOUDFRONT_URL}/pages/dashboard.html`);
console.log(`🎬 Cinema: https://${CLOUDFRONT_URL}/pages/video-player.html`);
console.log(`🏠 Home: https://${CLOUDFRONT_URL}/pages/index.html\n`);
console.log('⚠️  Note: Cache invalidation may take 5-10 minutes\n');
