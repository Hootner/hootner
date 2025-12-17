#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

// Remove console.log statements
const removeConsoleLogs = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(/console\.log\([^)]*\);?\s*\n?/g, '');
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      return true;
    }
  } catch (e) {}
  return false;
};

// Fix == to ===
const fixEquality = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updated = content
      .replace(/([^=!<>])==([^=])/g, '$1===$2')
      .replace(/([^!])!=([^=])/g, '$1!==$2');
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      return true;
    }
  } catch (e) {}
  return false;
};

const files = [
  'server.js',
  'electron/renderer.js',
  'lib/graceful-shutdown.js',
  'servers/html-pages-server.js',
  'servers/mcp-server.js'
];

let fixed = 0;
files.forEach(file => {
  if (removeConsoleLogs(file)) {
    console.log(`✓ Removed console.log from ${file}`);
    fixed++;
  }
  if (fixEquality(file)) {
    console.log(`✓ Fixed equality operators in ${file}`);
    fixed++;
  }
});

console.log(`\n🔧 Applied ${fixed} quick fixes`);

// Update outdated packages
try {
  console.log('\n📦 Updating critical packages...');
  execSync('npm update express helmet mongoose stripe', { stdio: 'inherit' });
  console.log('✓ Updated packages');
} catch (e) {
  console.log('⚠️ Package update failed - run manually: npm update');
}