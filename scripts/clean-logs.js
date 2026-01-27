#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const logDirs = [
  '.pm2/logs',
  'data/logs',
  'hexarchy/7-data/storage/logs'
];

const logPatterns = ['.log', '.log.*'];

function cleanDir(dir) {
  const fullPath = path.join(rootDir, dir);
  if (!fs.existsSync(fullPath)) return;
  
  const files = fs.readdirSync(fullPath);
  let count = 0;
  
  files.forEach(file => {
    if (logPatterns.some(p => file.endsWith(p) || file.includes('.log'))) {
      fs.unlinkSync(path.join(fullPath, file));
      count++;
    }
  });
  
  if (count > 0) console.log(`✓ Cleaned ${count} log file(s) from ${dir}`);
}

console.log('🧹 Cleaning logs...\n');
logDirs.forEach(cleanDir);
console.log('\n✨ Done!');
