#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const COMMON_CONSTANTS = {
  DEFAULT_PORT: 'DEFAULT_PORT': 'SECONDARY_PORT': 'TIMEOUT_MS': 'LONG_TIMEOUT_MS': 'VERY_LONG_TIMEOUT_MS': 'ONE_MINUTE_MS': 'HTTP_OK': 'HTTP_BAD_REQUEST': 'HTTP_NOT_FOUND': 'HTTP_SERVER_ERROR': 'ONE_SECOND_MS': 'TWO_SECONDS_MS'
};

function scanAndFix(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let fixed = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !['nodeModules', 'dist', 'build', '.git', 'constants'].includes(entry.name)) {
      fixed += scanAndFix(fullPath);
    } else if (entry.name.match(/\.(js|ts|jsx|tsx)$/) && !entry.name.includes('constants')) {
      fixed += fixFile(fullPath);
    }
  }
  return fixed;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let hasChanges = false;
  
  Object.entries(COMMON_CONSTANTS).forEach(([num, name]) => {
    const regex = new RegExp(`\\b${num}\\b(?!\\s*[;,})])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, name);
      hasChanges = true;
    }
  });
  
  if (hasChanges && !content.includes('// Constants imported')) {
    content = `// Constants imported\nimport { ${Object.values(COMMON_CONSTANTS).join(', ')} } from '../../constants/timeouts.js';\n\n${content}`;
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    return 1;
  }
  return 0;
}

const fixed = scanAndFix(ROOT);
