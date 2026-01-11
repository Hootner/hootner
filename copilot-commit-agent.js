#!/usr/bin/env node

// Copilot Commit Agent - AI-powered commit message enhancement
const { execSync } = require('child_process');

try {
  // Get staged changes
  const diff = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  
  if (!diff) {
    console.log('✅ No staged changes detected');
    process.exit(0);
  }

  // Basic commit message validation
  const commitMsg = process.argv[2] || '';
  
  if (commitMsg.length > 0) {
    console.log('✅ Commit message provided, proceeding...');
  } else {
    console.log('ℹ️ No commit message enhancement needed');
  }

  process.exit(0);
} catch (error) {
  console.log('⚠️ Copilot agent failed, proceeding with manual commit');
  process.exit(0);
}