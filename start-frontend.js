#!/usr/bin/env node

/**
 * HOOTNER Frontend Startup Script
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🦉 Starting HOOTNER Frontend...\n');

try {
  // Install dependencies if needed
  console.log('📦 Installing dependencies...');
  execSync('npm install', { 
    cwd: join(__dirname, 'apps/frontend'),
    stdio: 'inherit' 
  });

  // Start development server
  console.log('🚀 Starting development server...');
  execSync('npm run dev', { 
    cwd: join(__dirname, 'apps/frontend'),
    stdio: 'inherit' 
  });

} catch (error) {
  console.error('❌ Failed to start frontend:', error.message);
  process.exit(1);
}