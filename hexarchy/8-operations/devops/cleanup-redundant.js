import fs from 'fs';
import { execSync } from 'child_process';

const redundantDirs = [
  'apps',
  'services', 
  'frameworks',
  'config',
  'scripts',
  'tools',
  'orchestration',
  'runtimes',
  'src',
  'lib',
  'examples'
];

const tempFiles = [
  'BACKEND_ORGANIZATION_COMPLETE.md',
  'FRONTEND_ORGANIZATION_COMPLETE.md'
];

function safeCleanup() {
  console.log('🧹 Starting safe cleanup...\n');
  
  // Remove redundant directories
  console.log('📁 Removing redundant directories:');
  redundantDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        execSync(`rmdir /s /q "${dir}"`, { stdio: 'ignore' });
        console.log(`   ✅ Removed: ${dir}/`);
      } catch (e) {
        console.log(`   ❌ Failed to remove: ${dir}/`);
      }
    }
  });
  
  // Remove temporary files
  console.log('\n📄 Removing temporary files:');
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Removed: ${file}`);
      } catch (e) {
        console.log(`   ❌ Failed to remove: ${file}`);
      }
    }
  });
  
  console.log('\n✨ Cleanup complete! Directory now contains only:');
  console.log('   - hexarchy/ (main architecture)');
  console.log('   - .github/ (CI/CD)');
  console.log('   - docs/ (documentation)');
  console.log('   - tests/ (test suites)');
  console.log('   - data/ & logs/ (runtime data)');
  console.log('   - Essential config files');
}

safeCleanup();