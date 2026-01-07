#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
let scannedFiles = 0;
let fixedFiles = 0;
let totalFixes = 0;

const fixes = [
  { pattern: /\.innerHTML\s*=/g, replacement: '.textContent =', desc: 'XSS fix' },
  { pattern: /\bvar\s+/g, replacement: 'const ', desc: 'var->const' },
  { pattern: /([^=!<>])===([^=])/g, replacement: '$1===$2', desc: '===->===' },
  { pattern: /([^!])!==([^=])/g, replacement: '$1!==$2', desc: '!==->!==' },
  { pattern: /console\.log\([^)]*\);?\s*\n/g, replacement: '', desc: 'Remove console.log' },
  { pattern: /\.then\(\s*\)/g, replacement: '.then(() => {})', desc: 'Fix empty then' },
  { pattern: /\.catch\(\s*\)/g, replacement: '.catch(err => console.error(err))', desc: 'Fix empty catch' },
  { pattern: /\{\s+/g, replacement: '{ ', desc: 'Fix brace spacing' },
  { pattern: /\s+\}/g, replacement: ' }', desc: 'Fix brace spacing' },
  { pattern: /[ \t]+$/gm, replacement: '', desc: 'Remove trailing spaces' },
  { pattern: /\n{3,}/g, replacement: '\n\n', desc: 'Fix multiple blank lines' },
];

function shouldSkip(filePath) { return filePath.includes('nodeModules') ||
         filePath.includes('.d.ts') ||
         filePath.includes('tsconfig.json') ||
         filePath.includes('.min.') ||
         filePath.includes('dist/') ||
         filePath.includes('build/'); }

function fixFile(filePath) { if (shouldSkip(filePath)) return;

  scannedFiles++;

  try { let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    let fileFixCount = 0;

    fixes.forEach(fix => { const before = content;
      content = content.replace(fix.pattern, fix.replacement);
      if (content !== before) fileFixCount++; });

    if (content !== original) { fs.writeFileSync(filePath, content);
      fixedFiles++;
      totalFixes += fileFixCount;
      } (${fileFixCount} fixes)`); } } catch (err) {
    console.error(err);
    throw err;
 }: ${err.message}`); } }

function scanDir(dir) { const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) { const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !['nodeModules', 'dist', 'build', '.git'].includes(entry.name)) { scanDir(fullPath); } else if (entry.name.match(/\.(js|jsx|ts|tsx|css|html|json|md)$/)) { fixFile(fullPath); } } }

scanDir(rootDir);
if (fixedFiles === 0)