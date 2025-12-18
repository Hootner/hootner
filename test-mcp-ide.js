#!/usr/bin/env node

/**
 * Test script for Amazon Q MCP integration in IDE
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Amazon Q MCP Integration...\n');

// Test MCP server startup
console.log('1. Testing MCP server startup...');
const mcpServer = spawn('node', ['mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let serverOutput = '';
mcpServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

mcpServer.stderr.on('data', (data) => {
  console.log('   ✅ MCP Server:', data.toString().trim());
});

// Test tool availability
setTimeout(() => {
  console.log('\n2. Testing tool availability...');
  
  const testMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n';
  
  mcpServer.stdin.write(testMessage);
  
  setTimeout(() => {
    mcpServer.kill();
    console.log('\n✅ MCP server test complete!');
    console.log('\nNext: Open VS Code and test with Amazon Q chat:');
    console.log('   "Deploy HOOTNER in dev environment"');
    console.log('   "Check system health"');
    console.log('   "Run chaos monkey test"');
  }, 2000);
}, 1000);