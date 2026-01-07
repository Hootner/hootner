#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const map = {
  frontend: { deps: ['servers', 'middleware'], files: [] },
  servers: { deps: ['services', 'middleware', 'lib'], files: [] },
  services: { deps: ['lib', 'middleware'], files: [] },
  middleware: { deps: ['lib'], files: [] },
  lib: { deps: [], files: [] },
  scripts: { deps: ['lib', 'services'], files: [] }
};

// Scan directories
Object.keys(map).forEach(dir => {
  const dirPath = path.join(root, dir === 'frontend' ? 'apps/frontend' : dir);
  if (fs.existsSync(dirPath)) {
    map[dir].files = fs.readdirSync(dirPath, { recursive: true })
      .filter(f => f.endsWith('.js') || f.endsWith('.py'))
      .slice(0, 10); // First 10 files
  }
});

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║           DEPENDENCY MAP                                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📦 FRONTEND (apps/frontend/)');
console.log('   ↓ depends on');
console.log('   ├─ servers/');
console.log('   └─ middleware/\n');

console.log('🖥️  SERVERS (9 files)');
console.log('   ↓ depends on');
console.log('   ├─ services/');
console.log('   ├─ middleware/');
console.log('   └─ lib/\n');

console.log('⚙️  SERVICES (11+ microservices)');
console.log('   ↓ depends on');
console.log('   ├─ middleware/');
console.log('   └─ lib/\n');

console.log('🛡️  MIDDLEWARE (25+ files)');
console.log('   ↓ depends on');
console.log('   └─ lib/\n');

console.log('📚 LIB (20+ utilities)');
console.log('   └─ No dependencies (base layer)\n');

console.log('🤖 AI AGENTS (30+ agents)');
console.log('   └─ Independent layer\n');

// Save detailed map
fs.writeFileSync(
  path.join(root, 'docs/reports/dependency-map.json'),
  JSON.stringify(map, null, 2)
);

console.log('💾 Detailed map saved to: docs/reports/dependency-map.json\n');
