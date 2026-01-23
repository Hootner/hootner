#!/usr/bin/env node

import fs from 'fs';

const tests = [
  { path: 'hexarchy/0-core/configs/constants', name: 'Constants' },
  { path: 'hexarchy/1-foundation/frameworks/nestjs', name: 'NestJS Framework' },
  { path: 'hexarchy/2-intelligence/ai-services/video-generation', name: 'Video Generation' },
  { path: 'hexarchy/2-intelligence/ai-services/agents', name: 'AI Agents' },
  { path: 'hexarchy/3-communication/adapters/graphql-api', name: 'GraphQL API' },
  { path: 'hexarchy/4-interface/ui/frontend', name: 'Frontend' },
  { path: 'hexarchy/6-governance/compliance/security-scripts', name: 'Security Scripts' },
  { path: 'hexarchy/7-data/storage/logs', name: 'Logs Storage' },
  { path: 'hexarchy/7-data/storage/uploads', name: 'Uploads Storage' },
  { path: 'hexarchy/8-operations/infrastructure/aws-setup.js', name: 'AWS Setup' },
  { path: 'hexarchy/8-operations/ci-cd/deployment', name: 'Deployment Scripts' },
  { path: 'hexarchy/8-operations/testing', name: 'Tests' },
  { path: 'hexarchy/8-operations/infrastructure/terraform', name: 'Terraform' }
];

console.log('🧪 Testing services in new locations...\n');

let passed = 0;
let failed = 0;

for (const test of tests) {
  if (fs.existsSync(test.path)) {
    console.log(`✅ ${test.name}: ${test.path}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}: ${test.path} (NOT FOUND)`);
    failed++;
  }
}

console.log('\n📊 Test Results:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📦 Total: ${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 All services validated successfully!');
} else {
  console.log('\n⚠️  Some services need attention');
}
