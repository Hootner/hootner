#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync } = require('fs');

const exec = (cmd) => execSync(cmd, { stdio: 'inherit', shell: true });
const check = (cmd) => {
  try { execSync(cmd, { stdio: 'pipe' }); return true; } 
  catch { return false; }
};

console.log('🦉 HOOTNER Day 1 - Proving the owl flies...\n');

// Check Node
const nodeVersion = process.version.slice(1).split('.')[0];
if (nodeVersion < 18) throw new Error(`Node ${nodeVersion} found. Need 18+`);
console.log(`✓ Node.js ${process.version}`);

// Check Docker
if (!check('docker --version')) throw new Error('Docker not found');
console.log('✓ Docker installed');

// Check Docker running
if (!check('docker ps')) throw new Error('Docker not running');
console.log('✓ Docker running');

// Start infrastructure
console.log('\n📦 Starting MongoDB + Redis...');
exec('docker-compose up -d');

// Install dependencies
if (!existsSync('node_modules')) {
  console.log('\n📥 Installing dependencies...');
  exec('npm install');
}

if (!existsSync('api/graphql/node_modules')) {
  console.log('📥 Installing API dependencies...');
  exec('cd api/graphql && npm install');
}

// Start services
console.log('\n🚀 Starting frontend + GraphQL API...\n');
setTimeout(() => {
  console.log('\n✨ HOOTNER is ready!\n');
  console.log('🔗 Key URLs:');
  console.log('   Login:      http://localhost:3001');
  console.log('   Dashboard:  http://localhost:3005');
  console.log('   Player:     http://localhost:3001/video-player');
  console.log('   GraphQL:    http://localhost:4000/graphql');
  console.log('\n🦉 The owl is flying. Press Ctrl+C to stop.\n');
}, 2000);

exec('npm run start:all');
