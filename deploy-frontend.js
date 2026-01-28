#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const exec = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
};

console.log('🦉 Deploying HOOTNER Frontend\n');

// Build React app
console.log('📦 Building React app...');
exec('cd apps/frontend && npm run build');

// Create S3 bucket for frontend
console.log('🪣 Creating S3 bucket...');
const bucketName = `hootner-frontend-${Date.now()}`;

exec(`aws s3 mb s3://${bucketName} --region us-east-1`);

// Configure bucket for static website hosting
exec(`aws s3 website s3://${bucketName} --index-document index.html --error-document error.html`);

// Upload build files
console.log('⬆️ Uploading files...');
exec(`aws s3 sync apps/frontend/dist s3://${bucketName} --delete`);

// Make bucket public
const policy = {
  Version: "2012-10-17",
  Statement: [{
    Sid: "PublicReadGetObject",
    Effect: "Allow",
    Principal: "*",
    Action: "s3:GetObject",
    Resource: `arn:aws:s3:::${bucketName}/*`
  }]
};

exec(`aws s3api put-bucket-policy --bucket ${bucketName} --policy '${JSON.stringify(policy)}'`);

console.log(`\n✅ Frontend deployed!`);
console.log(`🌐 Website URL: http://${bucketName}.s3-website-us-east-1.amazonaws.com`);