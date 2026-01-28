#!/usr/bin/env node

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dynamicFeatures = {
  apiCalls: [],
  staticContent: [],
  dynamicContent: [],
  missingDynamic: []
};

function checkHtmlFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileName = filePath.split('\\').pop();
    
    // Check for API calls (dynamic)
    const hasAPI = content.includes('fetch(') || content.includes('XMLHttpRequest') || content.includes('axios');
    const hasGraphQL = content.includes('graphql') || content.includes('GraphQL');
    const hasBackend = content.includes('API_BASE') || content.includes('localhost:4000');
    
    if (hasAPI || hasGraphQL || hasBackend) {
      dynamicFeatures.apiCalls.push(fileName);
    }
    
    // Check for dynamic content loading
    const hasDynamicLoad = content.includes('loadVideo') || content.includes('loadContent') || content.includes('innerHTML');
    if (hasDynamicLoad) {
      dynamicFeatures.dynamicContent.push(fileName);
    }
    
    // Check for static content that should be dynamic
    const hasHardcodedData = content.includes('BigBuckBunny') || content.includes('sample.mp4');
    const hasStaticText = content.match(/>\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*</g);
    
    if (hasHardcodedData || (hasStaticText && hasStaticText.length > 5)) {
      dynamicFeatures.staticContent.push(fileName);
    }
    
    // Check for missing dynamic features
    if (fileName.includes('player') && !hasAPI) {
      dynamicFeatures.missingDynamic.push(`${fileName}: No API integration`);
    }
    
    if (fileName.includes('dashboard') && !hasGraphQL) {
      dynamicFeatures.missingDynamic.push(`${fileName}: No GraphQL integration`);
    }
    
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanHtmlFiles(dir) {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      
      if (item.endsWith('.html')) {
        checkHtmlFile(fullPath);
      }
    }
  } catch (error) {
    // Skip inaccessible directories
  }
}

console.log('🔍 Checking HTML files for dynamic content...\n');

scanHtmlFiles('apps/frontend/html-pages');

console.log(`✅ API Integration (${dynamicFeatures.apiCalls.length} files):`);
dynamicFeatures.apiCalls.forEach(f => console.log(`   ${f}`));

console.log(`\n🔄 Dynamic Content (${dynamicFeatures.dynamicContent.length} files):`);
dynamicFeatures.dynamicContent.forEach(f => console.log(`   ${f}`));

console.log(`\n📄 Static Content (${dynamicFeatures.staticContent.length} files):`);
dynamicFeatures.staticContent.forEach(f => console.log(`   ${f}`));

console.log(`\n⚠️  Missing Dynamic (${dynamicFeatures.missingDynamic.length} issues):`);
dynamicFeatures.missingDynamic.forEach(issue => console.log(`   ${issue}`));

const score = (dynamicFeatures.apiCalls.length + dynamicFeatures.dynamicContent.length) / 
              (dynamicFeatures.staticContent.length + dynamicFeatures.missingDynamic.length + 1);

console.log(`\n📊 Dynamic Score: ${Math.round(score * 100)}%`);
console.log(score > 2 ? '🎉 Highly dynamic!' : score > 1 ? '✅ Mostly dynamic' : '⚠️  Needs more dynamic features');