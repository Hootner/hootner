#!/usr/bin/env node

/**
 * Simple MCP Server Test
 * Tests the MCP server by importing and calling it directly
 */

import EnhancedMCPServer from '../hexarchy/3-communication/adapters/enhanced-mcp-server.js';

async function testMCP() {
  console.log('🦉 Testing HOOTNER MCP Server...\n');

  try {
    const server = new EnhancedMCPServer();
    await server.initialize();

    console.log('✅ MCP Server initialized successfully!\n');

    // Test agent hub status
    console.log('📊 Testing agent_hub_status...');
    const status = await server.handleToolCall('agent_hub_status', {});
    console.log(`   Session ID: ${status.sessionId}`);
    console.log(`   MCP Version: ${status.mcpVersion}`);
    console.log(`   Server Version: ${status.serverVersion}`);
    console.log(`   Status: ${status.agentHub?.status || 'active'}\n`);

    // Test protocol info
    console.log('🔗 Testing mcp_protocol_info...');
    const protocol = await server.handleToolCall('mcp_protocol_info', {});
    console.log(`   Protocol Version: ${protocol.protocolVersion}`);
    console.log(`   Server Version: ${protocol.serverVersion}`);
    console.log(`   Tools Available: ${protocol.capabilities.tools}`);
    console.log(`   Dual Agent: ${protocol.capabilities.dualAgent ? '✅' : '❌'}`);
    console.log(`   Agent Hub: ${protocol.capabilities.agentHub ? '✅' : '❌'}\n`);

    // Test orchestrator stats
    console.log('📈 Testing orchestrator_stats...');
    const stats = await server.handleToolCall('orchestrator_stats', {});
    console.log(`   Session ID: ${stats.sessionId}`);
    console.log(`   MCP Protocol: ${stats.mcpProtocol.version}\n`);

    console.log('✅ All MCP tests passed!\n');
    console.log('💡 MCP Server is ready to use');
    console.log('💡 Available endpoints:');
    console.log('   - HTTP: http://localhost:3000/api/mcp');
    console.log('   - GraphQL: http://localhost:3000/graphql');
    console.log('   - Health: http://localhost:3000/api/health\n');

    await server.shutdown();
    process.exit(0);

  } catch (error) {
    console.error('❌ MCP test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Run: npm install');
    console.error('2. Check: npm run aws:status');
    console.error('3. Validate: npm run mcp:validate\n');
    process.exit(1);
  }
}

testMCP();
