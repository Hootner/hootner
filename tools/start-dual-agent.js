#!/usr/bin/env node

import DualAgentOrchestrator from '../heptagonal/2-intelligence/ai-services/agents/dual-agent-orchestrator.js';
import EnhancedMCPServer from '../heptagonal/3-communication/adapters/enhanced-mcp-server.js';

console.log('🤖 Starting HOOTNER Enhanced Dual-Agent System with MCP Integration...\n');

// Initialize Enhanced MCP Server (includes orchestrator and agent hub)
const mcpServer = new EnhancedMCPServer();
await mcpServer.initialize();

// Get the orchestrator from the MCP server
const orchestrator = mcpServer.orchestrator;

console.log('\n📊 Agent Status:');
const stats = orchestrator.getStats();
console.log(`   GitHub Copilot: ${stats.agents.copilot.mode.toUpperCase()}`);
console.log(`   Amazon Q: ${stats.agents.amazonQ.mode.toUpperCase()}`);
console.log(`   Enhanced Agent Hub: ${stats.enhancedAgentHub ? stats.enhancedAgentHub.totalAgents + ' agents' : 'Not connected'}`);

console.log('\n✅ Enhanced Dual-Agent System Ready with MCP Integration!');
console.log('\n📋 Available Commands:');
console.log('   npm run dual-agent:status   - Check status');
console.log('   npm run dual-agent:disable  - Disable dual mode');
console.log('   npm run dual-agent:enable   - Enable dual mode');
console.log('\n🔗 MCP Server Features:');
console.log('   - Dual agent routing (Copilot + Amazon Q)');
console.log('   - 75+ specialized agents via Enhanced Agent Hub');
console.log('   - Real-time agent communication');
console.log('   - Cross-agent task coordination');

// Example routing with enhanced features
console.log('\n🔄 Testing Enhanced Request Routing...');
const testRequests = [
  { type: 'inline-code', query: 'Generate async function', context: {} },
  { type: 'aws-specific', query: 'Setup S3 bucket with encryption', context: {} },
  { type: 'security-audit', query: 'Scan for SQL injection vulnerabilities', context: {} },
  { type: 'business-analytics', query: 'Generate revenue report', context: {} },
];

for (const req of testRequests) {
  try {
    const result = await orchestrator.route(req);
    console.log(`   ✅ ${req.type}: Routed successfully`);
  } catch (error) {
    console.log(`   ❌ ${req.type}: ${error.message}`);
  }
}

console.log('\n📈 Enhanced Stats:', {
  copilot: stats.copilotRequests,
  amazonQ: stats.amazonQRequests,
  fallbacks: stats.fallbacks,
  connectedAgents: stats.connectedAgents,
  agentHub: stats.enhancedAgentHub ? `${stats.enhancedAgentHub.activeAgents}/${stats.enhancedAgentHub.totalAgents} active` : 'disconnected'
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Enhanced Dual-Agent System...');
  await mcpServer.shutdown();
  process.exit(0);
});
