#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const TARGET_FILE = 'apps/frontend/html-pages/electron-code-editor/integration-commands.js';

function fixHardcodedCredentials() { const filePath = path.resolve(TARGET_FILE);

  if (!fs.existsSync(filePath)) { console.error(`File not found: ${filePath}`);
    return; }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = 0;

  const patterns = [
    { regex: /(password|secret|token|privateKey|accessKey|clientSecret|authToken)\s*[=:]\s*['"]([^'"]+)['"]/gi,
      replace: (match, key) => `${key}: process.env.${key.toUpperCase()} || ''` },
    { regex: /(['"])(password|apiKey|token|secret)['"]\s*:\s*['"]([^'"]+)['"]/gi,
      replace: (match, q, key) => `${q}${key}${q}: process.env.${key.toUpperCase()} || ''` }
  ];

  patterns.forEach(({ regex, replace }) => { const matches = content.match(regex);
    if (matches) { content = content.replace(regex, replace);
      fixed += matches.length; } });

  if (fixed > 0) { fs.writeFileSync(filePath, content); } }

fixHardcodedCredentials();
