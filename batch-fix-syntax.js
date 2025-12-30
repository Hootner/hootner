import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const simpleStringFixes = [
  { file: 'apps/frontend/html-pages/electron-code-editor/main.js', search: /return next\(\);'\n    }/g, replace: "return next();\n    }" },
  { file: 'config/build/backup.config.ts', search: /'\n/g, replace: "'\n" },
  { file: 'servers/mcp-server.js', search: /const \{ StdioServerTransport \} = require\('@modelcontextprotocol\/sdk\/server\/stdio\.js'\n/g, replace: "const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');\n" },
  { file: 'tests/setup.ts', search: /import \{ expect, afterEach \} from 'vitest'\n/g, replace: "import { expect, afterEach } from 'vitest';\n" },
  { file: 'tools/health/healthcheck.js', search: /const \{ HTTP_STATUS, ONE_SECOND_MS, TIMEOUT_MS \} = require\('\.\.\/constants'\n/g, replace: "const { HTTP_STATUS, ONE_SECOND_MS, TIMEOUT_MS } = require('../constants');\n" },
  { file: 'scripts/find-malformed-jsdoc.js', search: /console\.log\(`Found \$\{issues\.length\} malformed JSDoc blocks:'\n/g, replace: "console.log(`Found ${issues.length} malformed JSDoc blocks:`);\n" },
  { file: 'scripts/linting/quick-syntax-fix.js', search: /console\.log\('Fixed unterminated regex in:', filePath, 'at line', lineNum\);'\n/g, replace: "console.log('Fixed unterminated regex in:', filePath, 'at line', lineNum);\n" },
  { file: 'scripts/auto-fix-syntax.js', search: /console\.log\(`Fixing \$\{file\}\.\.\.'\n/g, replace: "console.log(`Fixing ${file}...`);\n" },
  { file: 'scripts/fix-critical-errors.js', search: /console\.log\('Fixing:', file\);'\n/g, replace: "console.log('Fixing:', file);\n" }
];

const emptyBlockFixes = [
  { file: 'scripts/agents/fix-hardcoded-credentials.js', line: 35, replace: '/* No action needed */' },
  { file: 'scripts/start-all-servers.js', lines: [127, 134, 140, 141], replace: '/* Ignore error */' }
];

const uselessCatchFixes = [
  'scripts/agents/master-fix-agent.js',
  'scripts/fix-common-warnings.js'
];

let fixed = 0;

simpleStringFixes.forEach(({ file, search, replace }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (search.test(content)) {
      content = content.replace(search, replace);
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
      console.log(`Fixed: ${file}`);
    }
  } catch (err) {
    console.error(`Error: ${file}`, err.message);
  }
});

console.log(`\nFixed ${fixed} files`);
