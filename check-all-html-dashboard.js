#!/usr/bin/env node

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const allHtmlFiles = [];
const connections = { connected: [], missing: [] };

function findHtmlFiles(dir, depth = 0) {
  if (depth > 3) return;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item.startsWith('.') || ['node_modules', 'dist'].includes(item)) continue;
      
      const fullPath = join(dir, item);
      
      if (item.endsWith('.html')) {
        allHtmlFiles.push({ file: item, path: fullPath });
      } else {
        try {
          if (readdirSync(fullPath)) {
            findHtmlFiles(fullPath, depth + 1);
          }
        } catch (e) {
          // Not a directory
        }
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
}

function checkDashboardConnection(file, path) {
  try {
    const content = readFileSync(path, 'utf8');
    
    const dashboardPatterns = [
      /href=["'].*dashboard\.html["']/i,
      /href=["'].*\/dashboard["']/i,
      /window\.location.*dashboard/i,
      /location\.href.*dashboard/i,
      /onclick.*dashboard/i
    ];
    
    const hasConnection = dashboardPatterns.some(pattern => pattern.test(content));
    
    if (hasConnection || file.includes('dashboard')) {
      connections.connected.push(file);
    } else {
      connections.missing.push(file);
    }
  } catch (error) {
    connections.missing.push(`${file} (read error)`);
  }
}

console.log('🔍 Finding all HTML files...\n');

// Search in key directories
findHtmlFiles('apps/frontend/html-pages');
findHtmlFiles('hexarchy/4-interface/ui/pages');

console.log(`📄 Found ${allHtmlFiles.length} HTML files\n`);

// Check each file
allHtmlFiles.forEach(({ file, path }) => {
  checkDashboardConnection(file, path);
});

console.log(`✅ Connected to dashboard (${connections.connected.length}):`);
connections.connected.forEach(f => console.log(`   ${f}`));

console.log(`\n❌ Missing dashboard connection (${connections.missing.length}):`);
connections.missing.forEach(f => console.log(`   ${f}`));

const score = Math.round((connections.connected.length / allHtmlFiles.length) * 100);
console.log(`\n📊 Dashboard Connection Score: ${score}%`);
console.log(`🎯 Target: 18 files connected`);
console.log(`📈 Current: ${connections.connected.length}/${allHtmlFiles.length} files`);

if (connections.missing.length > 0) {
  console.log('\n🔧 Files needing dashboard links:');
  connections.missing.slice(0, 5).forEach(f => console.log(`   ${f}`));
}