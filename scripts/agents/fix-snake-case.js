#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function scanAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !['nodeModules', 'dist', 'build', '.git'].includes(entry.name)) {
      fixed += scanAndFix(fullPath);
    } else if (entry.name.match(/\.(js|ts|jsx|tsx)$/)) {
      fixed += fixFile(fullPath);
    }
  }
  return fixed;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  const snakePattern = /\b([a-z]+_[a-z_]+)\b/g;
  const matches = [...content.matchAll(snakePattern)];
  
  matches.forEach(match => {
    const snakeCase = match[1];
    if (!snakeCase.includes('_test') && !snakeCase.includes('_spec')) {
      const camelCase = toCamelCase(snakeCase);
      content = content.replace(new RegExp(`\\b${snakeCase}\\b`, 'g'), camelCase);
    }
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return 1;
  }
  return 0;
}

const fixed = scanAndFix(ROOT);
