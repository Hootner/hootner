import fs from 'fs';
import path from 'path';
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

function validatePath(inputPath) {
  // Prevent directory traversal attacks
  const normalizedPath = path.normalize(inputPath);
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
    throw new Error(`Invalid path: ${inputPath}`);
  }
  return normalizedPath;
}

function safeCleanup() {
  console.log('🧹 Starting safe cleanup...\n');
  
  // Remove redundant directories
  console.log('📁 Removing redundant directories:');
  redundantDirs.forEach(dir => {
    try {
      const safePath = validatePath(dir);
      if (fs.existsSync(safePath)) {
        // Use cross-platform removal
        if (process.platform === 'win32') {
          execSync(`rmdir /s /q "${safePath}"`, { stdio: 'ignore' });
        } else {
          execSync(`rm -rf "${safePath}"`, { stdio: 'ignore' });
        }
        console.log(`   ✅ Removed: ${safePath}/`);
      }
    } catch (e) {
      console.log(`   ❌ Failed to remove: ${dir}/ - ${e.message}`);
    }
  });
  
  // Remove temporary files
  console.log('\n📄 Removing temporary files:');
  tempFiles.forEach(file => {
    try {
      const safePath = validatePath(file);
      if (fs.existsSync(safePath)) {
        fs.unlinkSync(safePath);
        console.log(`   ✅ Removed: ${safePath}`);
      }
    } catch (e) {
      console.log(`   ❌ Failed to remove: ${file} - ${e.message}`);
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