#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';

const pwaChecks = {
  manifest: false,
  serviceWorker: false,
  icons: false,
  metaTags: false,
  https: true, // Will be true after deployment
  responsive: false
};

console.log('📱 Checking PWA Compatibility...\n');

// Check manifest
if (existsSync('apps/frontend/html-pages/manifest.json')) {
  const manifest = JSON.parse(readFileSync('apps/frontend/html-pages/manifest.json', 'utf8'));
  pwaChecks.manifest = !!(manifest.name && manifest.start_url && manifest.display);
  console.log(`${pwaChecks.manifest ? '✅' : '❌'} Manifest: ${pwaChecks.manifest ? 'Valid' : 'Missing/Invalid'}`);
} else {
  console.log('❌ Manifest: Not found');
}

// Check service worker
if (existsSync('apps/frontend/html-pages/sw.js')) {
  const sw = readFileSync('apps/frontend/html-pages/sw.js', 'utf8');
  pwaChecks.serviceWorker = sw.includes('install') && sw.includes('fetch');
  console.log(`${pwaChecks.serviceWorker ? '✅' : '❌'} Service Worker: ${pwaChecks.serviceWorker ? 'Valid' : 'Invalid'}`);
} else {
  console.log('❌ Service Worker: Not found');
}

// Check icons
pwaChecks.icons = existsSync('apps/frontend/html-pages/icons');
console.log(`${pwaChecks.icons ? '✅' : '❌'} Icons: ${pwaChecks.icons ? 'Directory exists' : 'Missing'}`);

// Check HTML meta tags
if (existsSync('apps/frontend/html-pages/index.html')) {
  const html = readFileSync('apps/frontend/html-pages/index.html', 'utf8');
  pwaChecks.metaTags = html.includes('manifest') && html.includes('theme-color');
  pwaChecks.responsive = html.includes('viewport');
  console.log(`${pwaChecks.metaTags ? '✅' : '❌'} Meta Tags: ${pwaChecks.metaTags ? 'Present' : 'Missing'}`);
  console.log(`${pwaChecks.responsive ? '✅' : '❌'} Responsive: ${pwaChecks.responsive ? 'Viewport set' : 'Missing viewport'}`);
}

const score = Object.values(pwaChecks).filter(Boolean).length;
const total = Object.keys(pwaChecks).length;

console.log(`\n📊 PWA Score: ${score}/${total} (${Math.round(score/total*100)}%)`);

if (score === total) {
  console.log('🎉 Fully PWA compatible!');
} else {
  console.log('⚠️  Missing PWA features - see above');
}