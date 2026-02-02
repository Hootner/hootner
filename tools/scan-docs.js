#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const outdated = [];
const overDocumented = [];
const underDocumented = [];
const gaps = [];

function scanDoc(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split('\\').pop();
    const lines = content.split('\n').length;
    
    // Check for outdated patterns
    const outdatedPatterns = [
      /nodejs20|node:20/i,
      /mongodb/i,
      /mongoose/i,
      /2024/g,
      /localhost:27017/,
      /npm run deploy/
    ];
    
    if (outdatedPatterns.some(pattern => pattern.test(content))) {
      outdated.push({ file: fileName, path: filePath, lines });
    }
    
    // Check for over-documentation (>500 lines)
    if (lines > 500) {
      overDocumented.push({ file: fileName, lines });
    }
    
    // Check for under-documentation (critical files <50 lines)
    if (fileName.includes('README') && lines < 50) {
      underDocumented.push({ file: fileName, lines });
    }
    
    // Check for missing documentation gaps
    const hasSetup = content.includes('setup') || content.includes('install');
    const hasUsage = content.includes('usage') || content.includes('example');
    const hasAPI = content.includes('api') || content.includes('endpoint');
    
    if (fileName.includes('README') && (!hasSetup || !hasUsage)) {
      gaps.push(`${fileName}: Missing ${!hasSetup ? 'setup' : ''}${!hasSetup && !hasUsage ? '+' : ''}${!hasUsage ? 'usage' : ''}`);
    }
    
  } catch (error) {
    // Skip binary files
  }
}

function scanDirectory(dir, depth = 0) {
  if (depth > 4) return;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') || ['node_modules', 'dist'].includes(item)) continue;
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, depth + 1);
      } else if (item.match(/\.(md|txt)$/i)) {
        scanDoc(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
}

console.log('📚 Scanning documentation...\n');

scanDirectory('.');

console.log(`⚠️  OUTDATED (${outdated.length} files):`);
outdated.slice(0, 10).forEach(doc => {
  console.log(`   ${doc.file} (${doc.lines} lines)`);
});

console.log(`\n📄 OVER-DOCUMENTED (${overDocumented.length} files >500 lines):`);
overDocumented.slice(0, 5).forEach(doc => {
  console.log(`   ${doc.file} (${doc.lines} lines)`);
});

console.log(`\n📝 UNDER-DOCUMENTED (${underDocumented.length} files <50 lines):`);
underDocumented.forEach(doc => {
  console.log(`   ${doc.file} (${doc.lines} lines)`);
});

console.log(`\n🕳️  GAPS (${gaps.length} missing sections):`);
gaps.forEach(gap => console.log(`   ${gap}`));

console.log('\n🎯 ACTIONS:');
console.log('1. Update outdated files');
console.log('2. Split over-documented files');
console.log('3. Expand under-documented files');
console.log('4. Fill documentation gaps');