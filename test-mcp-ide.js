#!/usr/bin/env node

/**
 * Test script for Amazon Q MCP integration in IDE
 */

const { spawn } = require('childProcess');
const path = require('path');


// Test MCP server startup
const mcpServer = spawn('node', ['mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

let serverOutput = '';
mcpServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

mcpServer.stderr.on('data', (data) => {
  .trim());
});

// Test tool availability
setTimeout(() => {
    
  const testMessage = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n';
  
  mcpServer.stdin.write(testMessage);
  
  setTimeout(() => {
    mcpServer.kill();
                      }, 2000);
}, 1000);