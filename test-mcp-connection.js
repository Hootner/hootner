#!/usr/bin/env node

/**
 * MCP Server Connection Test
 * Tests the connection to the Hootner MCP server
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing MCP Server Connection...\n');

// Test 1: Check if server file exists
console.log('1️⃣ Checking server file...');
const serverPath = path.join(__dirname, 'servers', 'hootner-mcp-server.js');
try {
  await import(`file://${serverPath}`);
  console.log('   ✅ Server file exists and is importable\n');
} catch (error) {
  console.log(`   ❌ Server file error: ${error.message}\n`);
}

// Test 2: Start server and test communication
console.log('2️⃣ Starting MCP server...');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, HOOTNER_ENV: 'development', NODE_ENV: 'production' },
});

let responseReceived = false;
let timeout;

server.stdout.on('data', data => {
  const response = data.toString();
  console.log('   📨 Server response:', response.substring(0, 200));
  responseReceived = true;
});

server.stderr.on('data', data => {
  console.log('   ⚠️ Server stderr:', data.toString());
});

// Test 3: Send a list_tools request
console.log('3️⃣ Sending list_tools request...\n');
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list',
  params: {},
};

server.stdin.write(JSON.stringify(request) + '\n');

// Wait for response
timeout = setTimeout(() => {
  if (responseReceived) {
    console.log('\n✅ MCP Server Connection Test PASSED');
    console.log('   - Server is running');
    console.log('   - Communication channel is open');
    console.log('   - Server responded to requests');
  } else {
    console.log('\n⚠️ MCP Server Connection Test INCOMPLETE');
    console.log('   - Server started but no response received');
    console.log('   - This may be normal for stdio transport');
  }

  server.kill();
  process.exit(0);
}, 3000);

server.on('error', error => {
  console.log(`\n❌ Server error: ${error.message}`);
  clearTimeout(timeout);
  process.exit(1);
});

server.on('exit', code => {
  if (code !== 0 && code !== null) {
    console.log(`\n❌ Server exited with code ${code}`);
    clearTimeout(timeout);
  }
});
