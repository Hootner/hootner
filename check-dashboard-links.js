#!/usr/bin/env node

import { readdirSync, readFileSync } from 'fs';

const connections = {
  toDashboard: [],
  fromDashboard: [],
  missing: [],
  broken: []
};

function checkHtmlFile(fileName, content) {
  // Check for dashboard links
  const dashboardLinks = [
    /href=["'].*dashboard\.html["']/g,
    /href=["'].*\/dashboard["']/g,
    /window\.location.*dashboard/g,
    /location\.href.*dashboard/g
  ];
  
  const hasDashboardLink = dashboardLinks.some(pattern => pattern.test(content));
  
  if (hasDashboardLink) {
    connections.toDashboard.push(fileName);
  }
  
  // Check if this IS the dashboard
  if (fileName.includes('dashboard')) {
    // Check for navigation to other pages
    const pageLinks = content.match(/href=["'][^"']*\.html["']/g) || [];
    connections.fromDashboard.push({
      file: fileName,
      links: pageLinks.length
    });
  }
  
  // Check for missing dashboard connection
  if (!fileName.includes('dashboard') && !hasDashboardLink && 
      (fileName.includes('player') || fileName.includes('config'))) {
    connections.missing.push(fileName);
  }
  
  // Check for broken links
  const brokenPatterns = [
    /href=["'].*localhost.*["']/g,
    /href=["'].*127\.0\.0\.1.*["']/g,
    /href=["'].*\.\.\/.*dashboard.*["']/g
  ];
  
  if (brokenPatterns.some(pattern => pattern.test(content))) {
    connections.broken.push(fileName);
  }
}

console.log('🔍 Checking dashboard connections...\n');

try {
  const files = readdirSync('apps/frontend/html-pages');
  
  for (const file of files) {
    if (file.endsWith('.html')) {
      const content = readFileSync(`apps/frontend/html-pages/${file}`, 'utf8');
      checkHtmlFile(file, content);
    }
  }
} catch (error) {
  console.error('Error reading files:', error.message);
  process.exit(1);
}

console.log(`📊 DASHBOARD CONNECTIONS:\n`);

console.log(`✅ Pages linking TO dashboard (${connections.toDashboard.length}):`);
connections.toDashboard.forEach(f => console.log(`   ${f}`));

console.log(`\n🏠 Dashboard linking FROM (${connections.fromDashboard.length}):`);
connections.fromDashboard.forEach(d => console.log(`   ${d.file}: ${d.links} links`));

console.log(`\n❌ Missing dashboard links (${connections.missing.length}):`);
connections.missing.forEach(f => console.log(`   ${f}`));

console.log(`\n⚠️  Broken/hardcoded links (${connections.broken.length}):`);
connections.broken.forEach(f => console.log(`   ${f}`));

const score = connections.toDashboard.length / (connections.missing.length + 1);
console.log(`\n📈 Connection Score: ${Math.round(score * 100)}%`);
console.log(score > 0.8 ? '🎉 Well connected!' : score > 0.5 ? '✅ Mostly connected' : '⚠️  Needs better dashboard integration');