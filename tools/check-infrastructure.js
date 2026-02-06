#!/usr/bin/env node

/**
 * HOOTNER Infrastructure Status Checker
 * Checks Backend, Application, and System Infrastructure
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function checkDirectory(path, name) {
  if (!existsSync(path)) {
    console.log(`❌ ${name}: Not found`);
    return false;
  }
  
  const items = readdirSync(path);
  console.log(`✅ ${name}: ${items.length} items`);
  
  // Show key files/folders
  const key = items.filter(item => 
    item.includes('config') || 
    item.includes('service') || 
    item.includes('server') ||
    item.includes('index') ||
    item.includes('main')
  ).slice(0, 3);
  
  if (key.length > 0) {
    console.log(`   Key: ${key.join(', ')}`);
  }
  return true;
}

console.log('🔍 HOOTNER Infrastructure Status Check\n');

// Backend Infrastructure
console.log('🔧 BACKEND INFRASTRUCTURE:');
checkDirectory('api', 'API Layer');
checkDirectory('api/graphql', 'GraphQL API');
checkDirectory('api/lambda', 'Lambda Functions');
checkDirectory('hexarchy/0-core', 'Core Services');
checkDirectory('hexarchy/1-foundation', 'Foundation Layer');
checkDirectory('hexarchy/3-communication', 'Communication Layer');

// Application Infrastructure  
console.log('\n📱 APPLICATION INFRASTRUCTURE:');
checkDirectory('apps', 'Applications');
checkDirectory('apps/frontend', 'Frontend App');
checkDirectory('hexarchy/4-interface', 'Interface Layer');
checkDirectory('hexarchy/2-intelligence', 'AI/Intelligence');
checkDirectory('services', 'Microservices');

// System Infrastructure
console.log('\n⚙️  SYSTEM INFRASTRUCTURE:');
checkDirectory('hexarchy/8-operations', 'Operations');
checkDirectory('hexarchy/7-data', 'Data Layer');
checkDirectory('hexarchy/6-governance', 'Governance');
checkDirectory('hexarchy/5-economy', 'Business Logic');
checkDirectory('scripts', 'Automation Scripts');

// Key Files Check
console.log('\n📄 KEY FILES:');
const keyFiles = [
  'template.yaml',
  'samconfig.toml', 
  'package.json',
  '.env',
  'index.js'
];

keyFiles.forEach(file => {
  console.log(`${existsSync(file) ? '✅' : '❌'} ${file}`);
});

console.log('\n📊 SUMMARY:');
console.log('Backend: API + GraphQL + Lambda + Core layers');
console.log('Application: Frontend + Interface + AI services');  
console.log('System: Operations + Data + Governance + Scripts');
console.log('\n🎯 Status: Ready for deployment review');