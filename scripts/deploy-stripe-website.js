#!/usr/bin/env node

/**
 * Deploy Website to Free Hosting for Stripe Activation
 * Supports Vercel, Netlify, GitHub Pages
 */

import fs from 'fs/promises';
import path from 'path';

async function createDeploymentFiles() {
  console.log('🚀 Creating deployment files for free hosting...\n');

  // Vercel deployment config
  const vercelConfig = {
    "name": "hootner-ai-platform",
    "version": 2,
    "builds": [
      {
        "src": "stripe-activation-website.html",
        "use": "@vercel/static"
      }
    ],
    "routes": [
      {
        "src": "/",
        "dest": "/stripe-activation-website.html"
      }
    ]
  };

  await fs.writeFile('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Created vercel.json');

  // Netlify deployment config
  const netlifyConfig = `
[build]
  publish = "."

[[redirects]]
  from = "/"
  to = "/stripe-activation-website.html"
  status = 200
`;

  await fs.writeFile('netlify.toml', netlifyConfig);
  console.log('✅ Created netlify.toml');

  // Package.json for deployment
  const deployPackage = {
    "name": "hootner-website",
    "version": "1.0.0",
    "description": "HOOTNER AI Revenue Optimization Platform",
    "main": "stripe-activation-website.html",
    "scripts": {
      "start": "node scripts/stripe-website-server.js",
      "build": "echo 'Static site, no build needed'"
    },
    "keywords": ["ai", "revenue", "optimization", "stripe"],
    "author": "HOOTNER Team",
    "license": "MIT"
  };

  await fs.writeFile('website-package.json', JSON.stringify(deployPackage, null, 2));
  console.log('✅ Created website-package.json');

  console.log('\n🌐 Deployment Options:');
  console.log('');
  console.log('1️⃣ VERCEL (Recommended):');
  console.log('   • Go to vercel.com');
  console.log('   • Connect GitHub and deploy this folder');
  console.log('   • Your site: https://hootner-ai-platform.vercel.app');
  console.log('');
  console.log('2️⃣ NETLIFY:');
  console.log('   • Go to netlify.com');
  console.log('   • Drag & drop this folder');
  console.log('   • Your site: https://hootner-ai.netlify.app');
  console.log('');
  console.log('3️⃣ GITHUB PAGES:');
  console.log('   • Push to GitHub repository');
  console.log('   • Enable Pages in Settings');
  console.log('   • Your site: https://username.github.io/repo-name');
  console.log('');
  console.log('4️⃣ LOCAL (for testing):');
  console.log('   • npm run website:start');
  console.log('   • Your site: http://localhost:3000');
  console.log('');
  console.log('✅ Use any of these URLs for Stripe account activation!');
}

createDeploymentFiles().catch(console.error);