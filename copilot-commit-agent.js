#!/usr/bin/env node

// Enhanced Copilot Commit Agent - AI-powered commit message enhancement
const { execSync } = require('child_process');

try {
  // Get staged changes
  const diff = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  
  if (!diff) {
    console.log('✅ No staged changes detected');
    process.exit(0);
  }

  // Generate commit message suggestions based on files
  const files = diff.split('\n');
  const hasJS = files.some(f => f.endsWith('.js') || f.endsWith('.ts'));
  const hasConfig = files.some(f => f.includes('config') || f.endsWith('.json'));
  const hasDocs = files.some(f => f.includes('README') || f.includes('docs'));
  
  let suggestion = '';
  if (hasJS) suggestion += 'feat/fix: ';
  if (hasConfig) suggestion += 'config: ';
  if (hasDocs) suggestion += 'docs: ';
  
  if (suggestion) {
    console.log(`🤖 Suggested commit prefix: ${suggestion}`);
  }

  console.log('✅ Commit message enhancement complete');
  process.exit(0);
} catch (error) {
  console.log('⚠️ Copilot agent failed, proceeding with manual commit');
  process.exit(0);
}