#!/usr/bin/env node
import { execSync } from 'node:childProcess';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const agents = [
  'fix-hardcoded-credentials.js',
  'fix-console-logs.js',
  'fix-error-handling.js',
  'fix-magic-numbers.js',
  'fix-snake-case.js'
];

agents.forEach(file => { try { execSync(`node "${path.join(__dirname, file)}"`, { stdio: 'inherit' }); }  });
