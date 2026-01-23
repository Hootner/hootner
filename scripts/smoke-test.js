#!/usr/bin/env node
// Smoke Test Script for Deployment Validation

import http from 'http';

const VERSION = process.argv[2] || 'unknown';

async function httpCheck(url, expectedCodes = [200]) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(expectedCodes.includes(res.statusCode));
    }).on('error', () => resolve(false));
  });
}

async function runTests() {
  console.log(`🦉 Running smoke tests for version: ${VERSION}\n`);

  // Test 1: Health check
  process.stdout.write('Test 1: Health check... ');
  const healthOk = await httpCheck('http://localhost:3000/health');
  if (!healthOk) {
    console.log('❌ Failed');
    process.exit(1);
  }
  console.log('✓ Passed');

  // Test 2: API availability
  process.stdout.write('Test 2: API availability... ');
  const apiOk = await httpCheck('http://localhost:4000/graphql', [200, 400]);
  if (!apiOk) {
    console.log('❌ Failed');
    process.exit(1);
  }
  console.log('✓ Passed');

  console.log('\n✅ All smoke tests passed');
  process.exit(0);
}

runTests();
