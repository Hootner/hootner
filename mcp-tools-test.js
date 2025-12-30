#!/usr/bin/env node

/**
 * Test individual MCP tools for HOOTNER
 */

import { spawn } from 'child_process';

const testTools = [
  {
    name: 'deployService',
    input: { environment: 'dev', service: 'frontend' }
  },
  {
    name: 'chaos_test', 
    input: { scenario: 'chaos-monkey', duration: 1 }
  },
  {
    name: 'systemHealth',
    input: { component: 'all' }
  },
  {
    name: 'securityScan',
    input: { scanType: 'dependencies' }
  }
];


const mcpServer = spawn('node', ['mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

mcpServer.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

// Test each tool
testTools.forEach((tool, index) => {
  setTimeout(() => {
    const message = JSON.stringify({
      jsonrpc: '2.0',
      id: index + 1,
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: tool.input
      }
    }) + '\n';
    
    mcpServer.stdin.write(message);
  }, (index + 1) * 1000);
});

// Cleanup
setTimeout(() => {
  mcpServer.kill();
  }, testTools.length * 1000 + 2000);