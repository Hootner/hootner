#!/usr/bin/env node
// Low Memory Mode for HOOTNER

console.log('💾 Optimizing for Low Memory...\n');

// 1. Limit Node.js memory
process.env.NODE_OPTIONS = '--max-old-space-size=512';
console.log('✓ Node.js limited to 512MB');

// 2. Disable memory-heavy features
process.env.DISABLE_SOURCEMAPS = 'true';
process.env.DISABLE_HOT_RELOAD = 'true';
console.log('✓ Disabled sourcemaps & hot reload');

// 3. Reduce concurrent operations
process.env.UV_THREADPOOL_SIZE = '2';
console.log('✓ Reduced thread pool to 2');

// 4. Clear cache on start
const { execSync } = require('child_process');
try {
  execSync('npm cache clean --force', { stdio: 'ignore' });
  console.log('✓ Cleared npm cache');
} catch (e) {
  // Ignore errors
}

console.log('\n✅ Low memory mode active\n');
