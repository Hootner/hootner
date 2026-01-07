#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'childProcess';

// Remove console.log statements
const removeConsoleLogs = (filePath) => { try { let content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(/console\.log\([^)]*\);?\s*\n?/g, '');
    if (updated !== content) { fs.writeFileSync(filePath, updated);
      return true; } } 
  return false; };

// Fix === to ===
const fixEquality = (filePath) => { try { let content = fs.readFileSync(filePath, 'utf8');
    const updated = content
      .replace(/([^=!<>])===([^=])/g, '$1===$2')
      .replace(/([^!])!==([^=])/g, '$1!==$2');
    if (updated !== content) { fs.writeFileSync(filePath, updated);
      return true; } } 
  return false; };

const files = [
  'server.js',
  'electron/renderer.js',
  'lib/graceful-shutdown.js',
  'servers/html-pages-server.js',
  'servers/mcp-server.js'
];

let fixed = 0;
files.forEach(file => { if (removeConsoleLogs(file)) fixed++;
  if (fixEquality(file)) fixed++; });

try { execSync('npm update express helmet mongoose stripe', { stdio: 'inherit' }); } catch (error) { console.error('Failed to update packages: ', error.message);' }