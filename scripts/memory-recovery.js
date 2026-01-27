#!/usr/bin/env node
// Memory Recovery Script

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Memory Recovery Options:\n');

const options = {
  '1': { name: 'Clear Node modules cache', cmd: 'npm cache clean --force' },
  '2': { name: 'Clear temp files', fn: clearTemp },
  '3': { name: 'Clear logs', fn: clearLogs },
  '4': { name: 'Kill idle processes', fn: killIdle },
  '5': { name: 'Optimize Git', cmd: 'git gc --aggressive --prune=now' },
  '6': { name: 'Clear DynamoDB local', fn: clearDynamoDB },
  '7': { name: 'Reduce Node memory limit', fn: setMemoryLimit },
  '8': { name: 'All of the above', fn: runAll }
};

function clearTemp() {
  const dirs = ['data/logs', 'data/uploads', '.pm2/logs'];
  dirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  console.log('✓ Cleared temp files');
}

function clearLogs() {
  execSync('node scripts/clean-logs.js', { stdio: 'ignore' });
  console.log('✓ Cleared logs');
}

function killIdle() {
  try {
    execSync('taskkill /F /IM node.exe /FI "MEMUSAGE gt 100000"', { stdio: 'ignore' });
    console.log('✓ Killed high-memory Node processes');
  } catch (e) {
    console.log('✓ No idle processes found');
  }
}

function clearDynamoDB() {
  const dbPath = path.join(process.cwd(), 'bin/dynamodb_local');
  if (fs.existsSync(dbPath)) {
    fs.rmSync(dbPath, { recursive: true, force: true });
  }
  console.log('✓ Cleared DynamoDB local data');
}

function setMemoryLimit() {
  const envPath = path.join(process.cwd(), '.env');
  try {
    if (fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8');
      if (!env.includes('NODE_OPTIONS')) {
        fs.appendFileSync(envPath, '\nNODE_OPTIONS=--max-old-space-size=1024\n');
      }
    } else {
      fs.writeFileSync(envPath, 'NODE_OPTIONS=--max-old-space-size=1024\n');
    }
    console.log('✓ Set Node memory limit to 1GB');
  } catch (e) {
    console.log('⚠ Could not set memory limit');
  }
}

function runAll() {
  clearTemp();
  clearLogs();
  killIdle();
  clearDynamoDB();
  setMemoryLimit();
  try {
    execSync('npm cache clean --force', { stdio: 'ignore' });
    console.log('✓ Cleared npm cache');
  } catch (e) {}
  try {
    execSync('git gc --prune=now', { stdio: 'ignore' });
    console.log('✓ Optimized Git');
  } catch (e) {}
}

// Run option 8 (all) by default
runAll();
console.log('\n✅ Memory recovery complete\n');
