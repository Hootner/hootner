#!/usr/bin/env node

import { execSync } from 'child_process';

const exec = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
};

console.log('🦉 Deploying HOOTNER Frontend (HTML)\n');

const bucketName = `hootner-frontend-${Date.now()}`;

// Create S3 bucket
exec(`aws s3 mb s3://${bucketName} --region us-east-1`);

// Configure for static website
exec(`aws s3 website s3://${bucketName} --index-document cinema-player.html`);

// Upload HTML pages
exec(`aws s3 sync apps/frontend/html-pages s3://${bucketName} --exclude "*.js" --exclude "node_modules/*"`);

// Make public
const policy = JSON.stringify({
  Version: "2012-10-17",
  Statement: [{
    Effect: "Allow",
    Principal: "*",
    Action: "s3:GetObject",
    Resource: `arn:aws:s3:::${bucketName}/*`
  }]
});

exec(`aws s3api put-bucket-policy --bucket ${bucketName} --policy "${policy.replace(/"/g, '\\"')}"`);

console.log(`\n✅ Frontend deployed!`);
console.log(`🌐 URL: http://${bucketName}.s3-website-us-east-1.amazonaws.com`);