#!/usr/bin/env node

/**
 * Quick MCP Server Connection Script
 * Connects to HOOTNER MCP server and provides interactive interface
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function connectToMCP() {
  console.log('🦉 Connecting to HOOTNER MCP Server...\n');

  try {
    // Start enhanced MCP server
    const serverPath = join(projectRoot, 'hexarchy/3-communication/adapters/enhanced-mcp-server.js');
    const serverProcess = spawn('node', [serverPath], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Wait for server initialization
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create transport
    const transport = new StdioClientTransport({
      readable: serverProcess.stdout,
      writable: serverProcess.stdin
    });

    // Create client
    const client = new Client({
      name: 'hootner-quick-connect',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    await client.connect(transport);
    console.log('✅ Connected to MCP Server!\n');

    // Get available tools
    const toolsResponse = await client.listTools();
    console.log('🛠️  Available Tools:');
    toolsResponse.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });

    // Get hexarchy status
    console.log('\n📊 Getting Hexarchy Status...');
    const statusResponse = await client.callTool({
      name: 'agent_hub_status',
      arguments: {}
    });
    
    const status = JSON.parse(statusResponse.content[0].text);
    console.log('\n✨ System Status:');
    console.log(`   Session ID: ${status.sessionId}`);
    console.log(`   Total Agents: ${status.agentHub?.totalAgents || 0}`);
    console.log(`   Active Agents: ${status.agentHub?.activeAgents || 0}`);
    console.log(`   Status: ${status.status}`);

    // Get protocol info
    console.log('\n🔗 Protocol Information...');
    const protocolResponse = await client.callTool({
      name: 'mcp_protocol_info',
      arguments: {}
    });
    
    const protocol = JSON.parse(protocolResponse.content[0].text);
    console.log(`   Protocol Version: ${protocol.protocolVersion}`);
    console.log(`   Server Version: ${protocol.serverVersion}`);

    console.log('\n✅ MCP Connection Successful!\n');
    console.log('💡 You can now use the MCP server at: http://localhost:3000/api/mcp');
    console.log('💡 Or use the client programmatically via the SDK\n');

    // Cleanup
    await client.close();
    serverProcess.kill('SIGTERM');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

connectToMCP();
