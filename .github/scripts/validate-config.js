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

console.log('🔍 GitHub Configuration Validator\n');

// Check files
console.log('📁 Checking required files...');
let filesOk = true;
for (const file of requiredFiles) {
  try {
    const fs = await import('fs');
    fs.accessSync(file);
    console.log(`  ✅ ${file}`);
  } catch {
    console.log(`  ❌ ${file} - MISSING`);
    filesOk = false;
  }
}

console.log('\n🔐 Required secrets (must configure in GitHub UI):');
requiredSecrets.forEach(secret => {
  console.log(`  ⚠️  ${secret}`);
});

console.log('\n🔓 Optional secrets:');
optionalSecrets.forEach(secret => {
  console.log(`  ℹ️  ${secret}`);
});

console.log('\n📋 Next steps:');
console.log('  1. Run: node .github/scripts/generate-secrets.js');
console.log('  2. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions');
console.log('  3. Add all required secrets');
console.log('  4. Configure branch protection rules');
console.log('  5. Enable security features\n');

console.log(filesOk ? '✅ All files present' : '❌ Some files missing');
