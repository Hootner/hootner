#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const fixes = [
  { file: 'apps/frontend/html-pages/load-header.js',
    line: 7,
    pattern: /\.innerHTML\s*=/g,
    replacement: '.textContent =',
    description: 'Fix XSS via innerHTML' },
  { file: 'apps/frontend/html-pages/electron-code-editor/enhancements.js',
    line: 65,
    pattern: /\.innerHTML\s*=/g,
    replacement: '.textContent =',
    description: 'Fix XSS via innerHTML' }
];

fixes.forEach(fix => { const filePath = path.join(process.cwd(), fix.file);

  if (!fs.existsSync(filePath)) { return; }

  try { let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    content = content.replace(fix.pattern, fix.replacement);

    if (content !== original) { fs.writeFileSync(filePath, content); } else { } } catch (err) {
    console.error(err);
    throw err;
 } });

