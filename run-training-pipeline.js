#!/usr/bin/env node

/**
 * Training Data Pipeline Runner
 * Usage: node run-training-pipeline.js
 */

const { execSync } = require('child_process');

console.log('🦉 HOOTNER Training Data Pipeline\n');

try {
  console.log('Step 1: Aggregating data sources...\n');
  execSync('node scripts/training-data-aggregator.js', { stdio: 'inherit' });
  
  console.log('\n\nStep 2: Preprocessing for ML frameworks...\n');
  execSync('node scripts/preprocess-training-data.js', { stdio: 'inherit' });
  
  console.log('\n\n✨ Pipeline complete! Check services/ for output files.\n');
} catch (error) {
  console.error('❌ Pipeline failed:', error.message);
  process.exit(1);
}
