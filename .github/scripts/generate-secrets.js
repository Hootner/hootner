#!/usr/bin/env node

/**
 * Generate Secure Secrets for GitHub Repository
 * Run: node .github/scripts/generate-secrets.js
 */

import crypto from 'crypto';

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

function generateSecrets() {
  const secrets = {
    JWT_SECRET: generateSecret(64),
    JWT_REFRESH_SECRET: generateSecret(64),
    COSIGN_PASSWORD: generateSecret(32),
    SESSION_SECRET: generateSecret(32),
    ENCRYPTION_KEY: generateSecret(32)
  };

  console.log('🔐 Generated Secure Secrets\n');
  console.log('Copy these to GitHub Settings → Secrets and variables → Actions\n');
  console.log('=' .repeat(70));
  
  for (const [key, value] of Object.entries(secrets)) {
    console.log(`\n${key}:`);
    console.log(value);
    console.log('-'.repeat(70));
  }

  console.log('\n⚠️  IMPORTANT:');
  console.log('1. Never commit these secrets to git');
  console.log('2. Store them securely (password manager)');
  console.log('3. Add them to GitHub repository secrets');
  console.log('4. Update .env.example with placeholder values\n');
}

generateSecrets();
