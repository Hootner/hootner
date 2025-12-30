import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToFix = [
  'config/testing/electron-playwright.config.js',
  'config/testing/playwright.config.js',
  'server.js',
  'tests/electron-code-editor/e2e/editor.spec.js',
  'lib/graceful-shutdown.js',
  'scripts/agents/fix-console-logs.js',
  'scripts/agents/fix-error-handling.js',
  'scripts/agents/fix-magic-numbers.js',
  'scripts/agents/fix-snake-case.js',
  'scripts/analysis/advanced-code-scanner.js'
];

const unusedVars = [
  'HTTP_OK', 'HTTP_BAD_REQUEST', 'HTTP_NOT_FOUND', 'HTTP_SERVER_ERROR',
  'ONE_SECOND_MS', 'TWO_SECONDS_MS', 'DEFAULT_PORT', 'SECONDARY_PORT',
  'TIMEOUT_MS', 'LONG_TIMEOUT_MS', 'VERY_LONG_TIMEOUT_MS', 'ONE_MINUTE_MS',
  'ANIMATION', 'signal', 'fixed', 'index', 'lines'
];

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Remove unused imports from destructuring
    unusedVars.forEach(varName => {
      content = content.replace(new RegExp(`\\b${varName},\\s*`, 'g'), '');
      content = content.replace(new RegExp(`,\\s*\\b${varName}\\b`, 'g'), '');
      content = content.replace(new RegExp(`\\b${varName}\\b\\s*,`, 'g'), '');
    });
    
    // Clean up empty destructuring
    content = content.replace(/const\s*\{\s*\}\s*=\s*require\([^)]+\);?\s*\n?/g, '');
    content = content.replace(/import\s*\{\s*\}\s*from\s*[^;]+;?\s*\n?/g, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
      console.log(`Fixed: ${file}`);
    }
  } catch (err) {
    console.error(`Error: ${file}`, err.message);
  }
});

console.log(`\nFixed ${fixed} files`);
