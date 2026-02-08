#!/usr/bin/env node
// Smoke Test Script for Deployment Validation

import http from 'http';

const VERSION = process.argv[2] || 'unknown';
const IS_CI = process.env.CI === 'true';
const IS_DEPLOYMENT = process.env.DEPLOYMENT_CONTEXT === 'true';
const SKIP_IF_NO_SERVER = process.env.SKIP_SMOKE_IF_NO_SERVER === 'true';

async function httpCheck(url, expectedCodes = [200]) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      resolve(expectedCodes.includes(res.statusCode));
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkServerAvailability() {
  // Quick check if any server is running
  const mainServerUp = await httpCheck('http://localhost:3000/api/health');
  const apiServerUp = await httpCheck('http://localhost:4000/graphql', [200, 400, 404]);
  return mainServerUp || apiServerUp;
}

async function runTests() {
  console.log(`🦉 Running smoke tests for version: ${VERSION}\n`);

  // Check if we should skip tests when servers are not running
  if (SKIP_IF_NO_SERVER && !IS_DEPLOYMENT) {
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
      console.log('ℹ️  Servers not running - skipping smoke tests');
      console.log('   (This is normal for pre-push checks in local development)');
      console.log('   Smoke tests will run during deployment validation.\n');
      process.exit(0);
    }
  }

  let testsFailed = false;

  // Test 1: Health check (corrected endpoint path)
  process.stdout.write('Test 1: Health check... ');
  const healthOk = await httpCheck('http://localhost:3000/api/health');
  if (!healthOk) {
    console.log('❌ Failed');
    testsFailed = true;
  } else {
    console.log('✓ Passed');
  }

  // Test 2: API availability
  process.stdout.write('Test 2: API availability... ');
  const apiOk = await httpCheck('http://localhost:4000/graphql', [200, 400]);
  if (!apiOk) {
    console.log('❌ Failed');
    testsFailed = true;
  } else {
    console.log('✓ Passed');
  }

  if (testsFailed) {
    console.log('\n❌ Some smoke tests failed');
    process.exit(1);
  }

  console.log('\n✅ All smoke tests passed');
  process.exit(0);
}

runTests();
