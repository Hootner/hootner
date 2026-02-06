import fs from 'fs';
import path from 'path';

console.log('🚀 Starting HOOTNER Hierarchy Optimization...\n');

// Create new structure
const newDirs = [
  'src/frontend/pages',
  'src/frontend/components', 
  'src/frontend/styles',
  'src/config/shared',
  'dist/frontend'
];

console.log('🏗️  Creating optimized structure...');
for (const dir of newDirs) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`  ✅ Created ${dir}`);
}

// Consolidate HTML files
console.log('\n📄 Consolidating HTML files...');
const htmlDir = 'apps/frontend/html-pages';
if (fs.existsSync(htmlDir)) {
  const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
  for (const file of htmlFiles) {
    fs.copyFileSync(
      path.join(htmlDir, file),
      path.join('src/frontend/pages', file)
    );
  }
  console.log(`  ✅ Moved ${htmlFiles.length} HTML files to src/frontend/pages/`);
}

// Consolidate CSS
console.log('\n🎨 Consolidating CSS files...');
const cssFiles = [
  'apps/frontend/html-pages/styles.css',
  'apps/frontend/public/styles.css'
].filter(f => fs.existsSync(f));

if (cssFiles.length > 0) {
  let consolidatedCSS = '/* HOOTNER Consolidated Styles */\n\n';
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, 'utf8');
    consolidatedCSS += `/* From: ${file} */\n${content}\n\n`;
  }
  fs.writeFileSync('src/frontend/styles/main.css', consolidatedCSS);
  console.log(`  ✅ Consolidated ${cssFiles.length} CSS files`);
}

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  actions: [
    'Created src/frontend/ structure',
    'Moved HTML files from apps/frontend/html-pages/',
    'Consolidated CSS files',
    'Created dist/ deployment structure'
  ],
  nextSteps: [
    'Update build scripts to use src/ directory',
    'Remove redundant files after testing',
    'Update import paths in components'
  ]
};

fs.writeFileSync('OPTIMIZATION_REPORT.json', JSON.stringify(report, null, 2));

console.log('\n✅ Hierarchy optimization completed!');
console.log('📊 Report saved to OPTIMIZATION_REPORT.json');
console.log('🔧 New structure ready in src/ directory');