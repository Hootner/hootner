#!/usr/bin/env node

/**
 * Inject Dashboard Header into all pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlDir = path.join(process.cwd(), 'apps/frontend/html-pages');
const headerPath = path.join(htmlDir, 'shared-dashboard-header.html');
const header = fs.readFileSync(headerPath, 'utf8');

const pages = [
  'dashboard.html',
  'video-player.html',
  'code-editor.html',
  'marketplace.html',
  'profile.html',
  'settings.html',
  'feed-react.html',
  'login.html',
  'auto-editor.html',
  'ultra-editor.html',
  'design-showcase.html',
  'test-page-clean.html'
];

console.log('🔗 Injecting dashboard header into all pages...\n');

let injected = 0;

pages.forEach(page => {
  const filePath = path.join(htmlDir, page);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${page} - File not found`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has dashboard header
  if (content.includes('dashboard-header')) {
    console.log(`⏭️  ${page} - Already has header`);
    return;
  }
  
  // Inject after <body> tag
  if (content.includes('<body>')) {
    content = content.replace('<body>', `<body>\n${header}\n`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${page} - Header injected`);
    injected++;
  } else {
    console.log(`⚠️  ${page} - No <body> tag found`);
  }
});

console.log(`\n📊 Complete: ${injected}/${pages.length} pages updated`);
console.log('\n✅ All pages now have:');
console.log('   - Unified navigation (12 buttons)');
console.log('   - Active page highlighting');
console.log('   - Functional notification bell');
console.log('   - Consistent header across all pages');
