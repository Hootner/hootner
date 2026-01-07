#!/usr/bin/env node

/**
 * Validate GitHub Repository Configuration
 * Run: node .github/scripts/validate-config.js
 */

const requiredSecrets = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
];

const optionalSecrets = [
  'COSIGN_PASSWORD',
  'MONGODB_URI',
  'REDIS_URL',
  'SNYK_TOKEN'
];

const requiredFiles = [
  '.github/CODEOWNERS',
  'SECURITY.md',
  '.github/dependabot.yml',
  '.github/workflows/e2e-tests.yml',
  '.github/workflows/container-scan.yml'
];

// Check files
let filesOk = true;
for (const file of requiredFiles) { try { const fs = await import('fs');
    fs.accessSync(file); } catch { filesOk = false; } }

:');
requiredSecrets.forEach(secret => { });

optionalSecrets.forEach(secret => { });

