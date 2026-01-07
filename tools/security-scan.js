#!/usr/bin/env node
const { execSync } = require('childProcess');

const scanType = process.argv[2] || 'full';

const scans = { full: 'node scripts/security-audit.js',
  dependencies: 'npm audit --audit-level=moderate',
  secrets: 'npm run security:scan' };

try { execSync(scans[scanType] || scans.full, { stdio: 'inherit' }); } catch (error) { console.error('❌ Security scan failed: ', error.message);
  process.exit(1);' }
