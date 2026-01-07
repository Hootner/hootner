#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const fixes = { filesFixed: 0,
  issuesFixed: 0 };

function fixFile(filePath) { let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const original = content;

  // Fix unterminated strings (common pattern: 'text' or "text")
  content = content.replace(/(['"])([^'"]*)\1\1/g, '$1$2$1');

  // Fix regex patterns /g/ to
  content = content.replace(/\/g['"]\/|\/g\/'|\/g\/"'/g, '/g/);

  // Fix /**/ to /** */
  content = content.replace(/\/\*\*\/g\//g, '/**/');

  // Remove trailing quotes after statements
  content = content.replace(/;['"]+$/gm, ';');
  content = content.replace(/\{['"]+$/gm, '{');
  content = content.replace(/\}['"]+$/gm, '}');

  // Fix double semicolons
  content = content.replace(/;+/g, ';');

  if (content !== original) { fs.writeFileSync(filePath, content, 'utf8');
    modified = true;
    fixes.filesFixed++;
    fixes.issuesFixed += (original.length - content.length) / 2; }

  return modified; }

function scanDirectory(dir, exclude = ['nodeModules', 'dist', 'build', '.git', 'libs']) { const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) { const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !exclude.includes(entry.name)) { scanDirectory(fullPath, exclude); } else if (entry.isFile() && ['.js', '.ts'].includes(path.extname(entry.name)) && !entry.name.includes('.min.')) { try { if (fixFile(fullPath)) { }`); } } catch (err) { console.error(err);
    throw err; } } } }

scanDirectory(rootDir); }`);
