#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync } from 'fs';

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

// Check Java for DynamoDB
if (!check('java -version')) console.log('⚠️  Java not found - needed for DynamoDB Local');
else console.log('✓ Java installed');

// Check Couchbase
if (!check('curl -s http://localhost:8091')) console.log('⚠️  Couchbase not running - start Couchbase Server');
else console.log('✓ Couchbase running');

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
console.log('\n🚀 Starting services natively...\n');
setTimeout(() => {
  console.log('\n✨ HOOTNER is ready!\n');
  console.log('🔗 Key URLs:');
  console.log('   Frontend:   http://localhost:3000');
  console.log('   GraphQL:    http://localhost:4000/graphql');
  console.log('   Video Gen:  http://localhost:5003');
  console.log('   DynamoDB:   http://localhost:8000');
  console.log('   Couchbase:  http://localhost:8091');
  console.log('\n🦉 The owl is flying. Press Ctrl+C to stop.\n');
}, 2000);

exec('npm run start:native');
