#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const fixes = { // Remove duplicate properties
  duplicates: /([a-z-]+)\s*:\s*([^;]+);\s*\1\s*:\s*[^;]+;/gi,
  // Fix missing semicolons
  missingSemicolon: /([^;{}])\s*\n\s*([a-z-])/gi,
  // Remove empty rules
  emptyRules: /[^}]*\{\s*\}/g,
  // Fix spacing around colons
  colonSpacing: /([a-z-]+)\s*:\s*/gi,
  // Fix spacing around braces
  braceSpacing: /\{\s+/g,
  // Remove trailing spaces
  trailingSpaces: /[ \t]+$/gm,
  // Fix multiple blank lines
  multipleBlankLines: /\n{3,}/g };

function findCSSFiles(dir, files = []) { const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) { const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !['nodeModules', 'dist', 'build', '.git'].includes(entry.name)) { findCSSFiles(fullPath, files); } else if (entry.name.endsWith('.css')) { files.push(fullPath); } }

  return files; }

function fixCSS(content) { let fixed = content;

  // Remove duplicate properties (keep last)
  fixed = fixed.replace(fixes.duplicates, '$1: $2;');

  // Fix missing semicolons before new property
  fixed = fixed.replace(fixes.missingSemicolon, '$1;\n  $2');

  // Remove empty rules
  fixed = fixed.replace(fixes.emptyRules, '');

  // Fix colon spacing
  fixed = fixed.replace(fixes.colonSpacing, '$1: ');

  // Fix brace spacing
  fixed = fixed.replace(fixes.braceSpacing, '{ ');

  // Remove trailing spaces
  fixed = fixed.replace(fixes.trailingSpaces, '');

  // Fix multiple blank lines
  fixed = fixed.replace(fixes.multipleBlankLines, '\n\n');

  return fixed; }

const rootDir = process.argv[2] || process.cwd();
const cssFiles = findCSSFiles(rootDir);

let fixedCount = 0;

cssFiles.forEach(file => { try { const content = fs.readFileSync(file, 'utf8');
    const fixed = fixCSS(content);

    if (content !== fixed) { fs.writeFileSync(file, fixed);
      }`);
      fixedCount++; } } catch (err) {
    console.error(err);
    throw err;
 } - ${err.message}`); } });

