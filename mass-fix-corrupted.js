import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixes = {
  'apps/frontend/html-pages/electron-code-editor/main.js': (c) => c.replace(/return next\(\);'\n    }/g, "return next();\n    }"),
  'servers/mcp-server.js': (c) => c.replace(/require\('@modelcontextprotocol\/sdk\/server\/stdio\.js'\n/g, "require('@modelcontextprotocol/sdk/server/stdio.js');\n"),
  'tests/setup.ts': (c) => c.replace(/from 'vitest'\n/g, "from 'vitest';\n"),
  'tools/health/healthcheck.js': (c) => c.replace(/require\('\.\.\/constants'\n/g, "require('../constants');\n"),
  'scripts/find-malformed-jsdoc.js': (c) => c.replace(/malformed JSDoc blocks:'\n/g, "malformed JSDoc blocks:`);\n"),
  'scripts/linting/quick-syntax-fix.js': (c) => c.replace(/lineNum\);'\n/g, "lineNum);\n"),
  'scripts/auto-fix-syntax.js': (c) => c.replace(/\$\{file\}\.\.\.'\n/g, "${file}...`);\n"),
  'scripts/fix-critical-errors.js': (c) => c.replace(/'Fixing:', file\);'\n/g, "'Fixing:', file);\n"),
  'servers/html-pages-server.js': (c) => c.replace(/\(path\.join\(__dirname, '\.\.\/apps\/frontend\/html-pages'\)\);/g, "(path.join(__dirname, '../apps/frontend/html-pages'));"),
  'test-mcp-ide.js': (c) => c.replace(/console\.log\(\n  \./g, "console.log("),
  'scripts/utilities/port-scanner.js': (c) => c.replace(/console\.log\(`Port \$\{port\} is/g, "console.log(`Port ${port} is"),
  'scripts/find-unterminated-regex.js': (c) => c.replace(/const line = lines\[i\];/g, "const line = lines[i] || '';"),
  'scripts/fix-syntax-errors.js': (c) => c.replace(/\} catch \(e\) \{/g, "} catch (err) {"),
  'scripts/analysis/code-scanner.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'scripts/analysis/unified-scanner.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'scripts/testing/setup-testing.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'servers/hub-app.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'servers/secure-server.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'servers/video-player-server.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'tools/analysis/audit-node-modules.js': (c) => c.replace(/\} catch \(/g, "} catch (err) {"),
  'mcp-http-server.js': (c) => c.replace(/^\/\*\*! /gm, "/** "),
  'mcp-tools-test.js': (c) => c.replace(/^\/\*\*! /gm, "/** "),
  'tools/system-health.js': (c) => c.replace(/^\/\*\*! /gm, "/** ")
};

let fixed = 0;
Object.entries(fixes).forEach(([file, fixFn]) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    content = fixFn(content);
    
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
