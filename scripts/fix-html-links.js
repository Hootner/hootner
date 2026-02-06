#!/usr/bin/env node

/**
 * Fix all HTML navigation links for CloudFront deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlDir = path.join(__dirname, '../hexarchy/4-interface/ui/pages');

// Path mappings for CloudFront
const pathMappings = {
  '/pages/marketplace.html': '/assets/marketplace.html',
  '/pages/': '/pages/',
  '/assets/': '/assets/',
  '../../hexarchy/4-interface/ui/pages/': '/pages/',
  '../pages/': '/pages/'
};

function fixHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Fix marketplace links specifically
  if (content.includes('href="/pages/marketplace.html"') || content.includes('href="../../hexarchy/4-interface/ui/pages/marketplace.html"')) {
    content = content.replace(/href="\/pages\/marketplace\.html"/g, 'href="/assets/marketplace.html"');
    content = content.replace(/href="\.\.\/\.\.\/hexarchy\/4-interface\/ui\/pages\/marketplace\.html"/g, 'href="/assets/marketplace.html"');
    changed = true;
  }

  // Fix relative paths to absolute
  if (content.includes('../../hexarchy/4-interface/ui/pages/')) {
    content = content.replace(/href="\.\.\/\.\.\/hexarchy\/4-interface\/ui\/pages\//g, 'href="/pages/');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.basename(filePath)}`);
    return true;
  }
  return false;
}

// Process all HTML files
const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(htmlDir, file);
  if (fixHtmlFile(filePath)) fixedCount++;
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('\nRun: aws s3 sync hexarchy/4-interface/ui/pages/ s3://hootner-frontend-504165876439/pages/ --cache-control "max-age=0"');
