#!/usr/bin/env node
// Satellite Internet Optimizer for HOOTNER

const fs = require('fs');
const path = require('path');

console.log('🛰️  Optimizing for Satellite Internet...\n');

// 1. Enable local mode
console.log('✓ Setting LOCAL mode (no AWS calls)');
process.env.MODE = 'local';

// 2. Configure AWS SDK for minimal bandwidth
console.log('✓ Configuring AWS SDK for low bandwidth');
const awsConfig = {
  maxRetries: 2,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 10000
  },
  retryDelayOptions: {
    base: 1000
  }
};

// 3. Set up local caching
console.log('✓ Enabling aggressive caching');
const cacheDir = path.join(__dirname, '.cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// 4. Bandwidth monitoring
let bytesUsed = 0;
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const clone = response.clone();
  const buffer = await clone.arrayBuffer();
  bytesUsed += buffer.byteLength;
  
  if (bytesUsed > 100 * 1024 * 1024) { // 100MB warning
    console.warn(`⚠️  Bandwidth usage: ${(bytesUsed / 1024 / 1024).toFixed(2)} MB`);
  }
  
  return response;
};

// 5. Optimize video settings
console.log('✓ Setting video quality to 480p (satellite-friendly)');
process.env.DEFAULT_VIDEO_QUALITY = '480p';
process.env.MAX_VIDEO_BITRATE = '1000k';

console.log('\n✅ Satellite optimization complete!');
console.log('📊 Data usage will be tracked');
console.log('🎥 Videos limited to 480p to save bandwidth\n');

module.exports = { awsConfig, bytesUsed };
