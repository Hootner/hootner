#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const issues = {
  unterminatedRegex: [],
  malformedJSDoc: [],
  htmlErrors: [],
  importErrors: [],
};

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);

  // Check unterminated regex
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    const regexPattern = /(?<!\\)\/(?:[^\/\\\n]|\\.)*(?:\n|$)/g;
    const matches = content.match(regexPattern);
    if (matches?.some(m => !m.endsWith('/'))) {
      issues.unterminatedRegex.push(filePath);
    }

    // Check malformed JSDoc
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//g;
    const jsdocs = content.match(jsdocPattern) || [];
    for (const doc of jsdocs) {
      if (
        !doc
          .split('\n')
          .slice(1, -1)
          .every(line => line.trim().startsWith('*'))
      ) {
        issues.malformedJSDoc.push(filePath);
        break;
      }
    }

    // Check import/export errors
    const lines = content.split('\n');
    let inFunction = false;
    lines.forEach((line, i) => {
      if (line.match(/function\s+\w+\s*\(|=>\s*{|{\s*$/)) inFunction = true;
      if (line.match(/^}/)) inFunction = false;
      if (inFunction && line.match(/^\s*(import|export)\s+/)) {
        issues.importErrors.push(`${filePath}:${i + 1}`);
      }
    });
  }

  // Check HTML errors
  if (ext === '.html') {
    const tags = content.match(/<\/?[\w-]+[^>]*>/g) || [];
    const stack = [];
    for (const tag of tags) {
      if (tag.startsWith('</')) {
        const tagName = tag.match(/<\/([\w-]+)/)?.[1];
        if (stack[stack.length - 1] !== tagName) {
          issues.htmlErrors.push(filePath);
          break;
        }
        stack.pop();
      } else if (
        !tag.endsWith('/>') &&
        !['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tag.match(/<([\w-]+)/)?.[1])
      ) {
        stack.push(tag.match(/<([\w-]+)/)?.[1]);
      }
    }
  }
}

function scanDirectory(dir, exclude = ['nodeModules', 'dist', 'build', '.git']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !exclude.includes(entry.name)) {
      scanDirectory(fullPath, exclude);
    } else if (entry.isFile()) {
      try {
        scanFile(fullPath);
      } catch (err) {
    console.error(err);
    throw err;
  }
    }
  }
}

scanDirectory(rootDir);

issues.unterminatedRegex.forEach(f => }`));

issues.malformedJSDoc.forEach(f => }`));

issues.htmlErrors.forEach(f => }`));

issues.importErrors.forEach(f => );

