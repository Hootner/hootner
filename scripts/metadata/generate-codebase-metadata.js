import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const OUTPUT = path.join(ROOT, '.metadata');
const HISTORY = path.join(OUTPUT, 'history');

function scanDirectory(dir, baseDir = dir) {
  const results = [];
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);
      if (item.name.startsWith('.') || item.name === 'node_modules' || item.name === 'dist') continue;
      if (item.isDirectory()) {
        results.push(...scanDirectory(fullPath, baseDir));
      } else if (item.isFile()) {
        const ext = path.extname(item.name);
        if (['.js', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml', '.py', '.md', '.html', '.css', '.cjs', '.mjs'].includes(ext)) {
          results.push({
            path: relativePath.replace(/\\/g, '/'),
            name: item.name,
            type: ext.slice(1),
            size: fs.statSync(fullPath).size,
          });
        }
      }
    }
  } catch (e) {}
  return results;
}

function calculateDiff(previous, current) {
  const prevPaths = new Set(previous.map(f => f.path));
  const currPaths = new Set(current.map(f => f.path));
  
  return {
    added: current.filter(f => !prevPaths.has(f.path)),
    removed: previous.filter(f => !currPaths.has(f.path)),
    modified: current.filter(f => {
      const prev = previous.find(p => p.path === f.path);
      return prev && prev.size !== f.size;
    }),
  };
}

console.log('🔍 Scanning Hootner codebase...');
const files = scanDirectory(ROOT);

const metadata = {
  generated: new Date().toISOString(),
  project: 'Hootner',
  totalFiles: files.length,
  structure: {
    hexarchy: files.filter(f => f.path.startsWith('hexarchy/')),
    api: files.filter(f => f.path.startsWith('api/')),
    apps: files.filter(f => f.path.startsWith('apps/')),
    scripts: files.filter(f => f.path.startsWith('scripts/')),
    services: files.filter(f => f.path.startsWith('services/')),
  },
  filesByType: files.reduce((acc, f) => { acc[f.type] = (acc[f.type] || 0) + 1; return acc; }, {}),
};

const architecture = {
  generated: new Date().toISOString(),
  layers: ['0-core', '1-foundation', '2-intelligence', '3-communication', '4-interface', '5-economy', '6-governance', '7-data', '8-operations'],
  awsPipes: 120,
  services: ['video-generation', 'ai-agents', 'graphql', 'authentication'],
};

let diff = null;
const prevPath = path.join(OUTPUT, 'codebase.json');
if (fs.existsSync(prevPath)) {
  const previous = JSON.parse(fs.readFileSync(prevPath, 'utf-8'));
  const prevFiles = Object.values(previous.structure || {}).flat();
  diff = calculateDiff(prevFiles, files);
  
  if (!fs.existsSync(HISTORY)) fs.mkdirSync(HISTORY, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(HISTORY, `diff-${timestamp}.json`),
    JSON.stringify({ 
      timestamp: metadata.generated, 
      diff, 
      summary: {
        added: diff.added.length,
        removed: diff.removed.length,
        modified: diff.modified.length,
        totalFiles: files.length,
        previousFiles: prevFiles.length,
        growth: files.length - prevFiles.length
      }
    }, null, 2)
  );
}

fs.writeFileSync(path.join(OUTPUT, 'codebase.json'), JSON.stringify(metadata, null, 2));
fs.writeFileSync(path.join(OUTPUT, 'architecture.json'), JSON.stringify(architecture, null, 2));

console.log('✅ Metadata generated in .metadata/');
console.log(`   - ${metadata.totalFiles} files scanned`);
if (diff) {
  console.log(`   - ${diff.added.length} added, ${diff.removed.length} removed, ${diff.modified.length} modified`);
}
