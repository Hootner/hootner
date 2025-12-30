import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixes = [
  { file: 'middleware/compression.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/csrf.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/dependency-check.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/metrics.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/performance.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/session.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/sql-injection-prevention.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'middleware/ssrf-protection.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'electron/preload.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'servers/collab-server.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'scripts/monitoring/memory-profiler.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'scripts/monitoring/sustainability-monitor.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'scripts/utilities/debug-enhancer.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'config/build/forge.config.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'config/build/webpack.main.config.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'config/build/webpack.renderer.config.js', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'config/security/rate-limit-config.ts', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'config/security/security.config.ts', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' },
  { file: 'tests/frontend-setup.ts', pattern: /^\/\*\* \*\/\n \*/gm, replacement: '/**\n *' }
];

let fixed = 0;
fixes.forEach(({ file, pattern, replacement }) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skip: ${file} (not found)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    content = content.replace(pattern, replacement);
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
      console.log(`Fixed: ${file}`);
    }
  } catch (err) {
    console.error(`Error fixing ${file}:`, err.message);
  }
});

console.log(`\nFixed ${fixed} files`);
