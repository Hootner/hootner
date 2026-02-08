#!/usr/bin/env node
/**
 * Test the smoke-test.js script to ensure it behaves correctly
 */

import http from 'http';
import { spawn } from 'child_process';

// Configuration constants
const SERVER_READY_DELAY_MS = 500; // Time to wait for mock server to be ready to accept connections

console.log('🧪 Testing smoke-test.js functionality\n');

// Test 1: Smoke test should skip when SKIP_SMOKE_IF_NO_SERVER=true and no servers running
console.log('Test 1: Skip when no servers are running...');
const test1 = spawn('node', ['scripts/smoke-test.js'], {
  env: { ...process.env, SKIP_SMOKE_IF_NO_SERVER: 'true' }
});

let test1Output = '';
test1.stdout.on('data', (data) => {
  test1Output += data.toString();
});

test1.on('close', (code) => {
  if (code === 0 && test1Output.includes('Servers not running - skipping smoke tests')) {
    console.log('✅ Test 1 passed: Correctly skipped tests when no server\n');
  } else {
    console.log('❌ Test 1 failed: Expected exit code 0 and skip message');
    console.log('   Output:', test1Output.substring(0, 200));
    process.exit(1);
  }

  // Test 2: Smoke test should fail when no SKIP flag and no servers
  console.log('Test 2: Fail when servers expected but not running...');
  const test2 = spawn('node', ['scripts/smoke-test.js']);

  let test2Output = '';
  test2.stdout.on('data', (data) => {
    test2Output += data.toString();
  });

  test2.on('close', (code) => {
    if (code === 1 && test2Output.includes('Failed')) {
      console.log('✅ Test 2 passed: Correctly failed when servers not available\n');
    } else {
      console.log('❌ Test 2 failed: Expected exit code 1 and failure message\n');
      process.exit(1);
    }

    // Test 3: Test with mock server
    console.log('Test 3: Pass when mock server is running...');
    
    // Create a simple mock server
    const mockServer = http.createServer((req, res) => {
      if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    mockServer.listen(3000, () => {
      console.log('   Started mock server on port 3000');
      
      // Wait a bit for server to be ready
      setTimeout(() => {
        const test3 = spawn('node', ['scripts/smoke-test.js'], {
          env: { ...process.env, SKIP_SMOKE_IF_NO_SERVER: 'true' }
        });

        let test3Output = '';
        test3.stdout.on('data', (data) => {
          test3Output += data.toString();
        });

        test3.on('close', (code) => {
          mockServer.close();
          
          // With SKIP flag and server running, it should run tests
          // But will fail on Test 2 (API on port 4000) - that's expected
          if (test3Output.includes('Test 1: Health check...')) {
            console.log('✅ Test 3 passed: Ran tests when server detected\n');
            console.log('✅ All smoke-test.js tests completed successfully!');
            console.log('\n📋 Summary:');
            console.log('  - Skips tests when SKIP_SMOKE_IF_NO_SERVER=true and no servers');
            console.log('  - Fails appropriately when servers expected but not available');
            console.log('  - Runs tests when servers are detected');
            process.exit(0);
          } else {
            console.log('❌ Test 3 failed: Expected tests to run when server available');
            console.log('   Output:', test3Output.substring(0, 200));
            process.exit(1);
          }
        });
      }, SERVER_READY_DELAY_MS);
    });
  });
});
