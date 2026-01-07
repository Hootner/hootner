#!/usr/bin/env node

/**
 * CSS Migration Script
 * Updates HTML files to use the new design system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlDir = path.join(process.cwd(), 'apps/frontend/html-pages');
const designSystemPath = '<link rel="stylesheet" href="design-system.css">';

console.log('🔄 Migrating HTML files to design system...\n');

const htmlFiles = fs.readdirSync(htmlDir)
  .filter(f => f.endsWith('.html') && f !== 'shared-header.html')
  .map(f => path.join(htmlDir, f));

let migrated = 0;

htmlFiles.forEach(file => {
  const fileName = path.basename(file);
  let content = fs.readFileSync(file, 'utf8');
  
  // Check if already has design system
  if (content.includes('design-system.css')) {
    console.log(`⏭️  ${fileName} - Already migrated`);
    return;
  }
  
  // Add design system link in <head>
  if (content.includes('</head>')) {
    content = content.replace(
      '</head>',
      `  ${designSystemPath}\n</head>`
    );
    
    fs.writeFileSync(file, content);
    console.log(`✅ ${fileName} - Added design system`);
    migrated++;
  } else {
    console.log(`⚠️  ${fileName} - No <head> tag found`);
  }
});

console.log(`\n📊 Migration complete: ${migrated}/${htmlFiles.length} files updated`);
console.log(`\n💡 Next steps:`);
console.log(`   1. Review pages in browser`);
console.log(`   2. Remove redundant inline styles`);
console.log(`   3. Replace custom classes with design system classes`);
console.log(`\n📝 Design system classes available:`);
console.log(`   Layout: .container, .flex, .grid, .gap-*`);
console.log(`   Buttons: .btn, .btn-primary, .btn-secondary`);
console.log(`   Cards: .card, .card-header, .card-body`);
console.log(`   Forms: .input, .textarea, .select, .label`);
console.log(`   Utils: .text-*, .bg-*, .p-*, .m-*, .rounded-*`);
