#!/usr/bin/env node

/**
 * Enhanced MCP Client - Demonstrates dual AI agent connections
 * Shows how to interact with the enhanced MCP server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import fs from 'fs';

class EnhancedMCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.serverProcess = null;
  }

  async connect() {
    console.log('🦉 Connecting to Enhanced HOOTNER MCP Server...');

    // Start enhanced MCP server process
    const serverScriptPath = fs.existsSync('heptagonal/3-communication/adapters/enhanced-mcp-server.js')
      ? 'heptagonal/3-communication/adapters/enhanced-mcp-server.js'
      : 'hexarchy/3-communication/adapters/enhanced-mcp-server.js';

    this.serverProcess = spawn('node', [serverScriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create transport
    this.transport = new StdioClientTransport({
      readable: this.serverProcess.stdout,
      writable: this.serverProcess.stdin
    });

    // Create client
    this.client = new Client({
      name: 'hootner-enhanced-mcp-client',
      version: '2.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    await this.client.connect(this.transport);
    console.log('✅ Connected to Enhanced HOOTNER MCP Server');

    return this;
  }

  async getTools() {
    const response = await this.client.listTools();
    return response.tools;
  }

  async routeThroughDualAgent(type, query, context = {}) {
    console.log(`🔄 Routing ${type} request through dual agents...`);
    const response = await this.client.callTool({
      name: 'dual_agent_route',
      arguments: { type, query, context }
    });
    return JSON.parse(response.content[0].text);
  }

  async getAgentHubStatus() {
    console.log('📊 Getting agent hub status...');
    const response = await this.client.callTool({
      name: 'agent_hub_status',
      arguments: {}
    });
    return JSON.parse(response.content[0].text);
  }

  async executeAgentAction(agentName, action, args = []) {
    console.log(`🎯 Executing ${action} on ${agentName}...`);
    const response = await this.client.callTool({
      name: 'execute_agent_action',
      arguments: { agentName, action, args }
    });
    return JSON.parse(response.content[0].text);
  }

  async listAgentsByCategory(category = null) {
    console.log(`📋 Listing agents${category ? ` in ${category} category` : ''}...`);
    const response = await this.client.callTool({
      name: 'list_agents_by_category',
      arguments: category ? { category } : {}
    });
    return JSON.parse(response.content[0].text);
  }

  async getOrchestratorStats() {
    console.log('📈 Getting orchestrator statistics...');
    const response = await this.client.callTool({
      name: 'orchestrator_stats',
      arguments: {}
    });
    return JSON.parse(response.content[0].text);
  }

  async connectExternalAgent(agentName, endpoint) {
    console.log(`🔗 Connecting external agent: ${agentName}...`);
    const response = await this.client.callTool({
      name: 'connect_external_agent',
      arguments: { agentName, endpoint }
    });
    return JSON.parse(response.content[0].text);
  }

  async demonstrateConnections() {
    console.log('\n🚀 Demonstrating Dual AI Agent Connections...\n');

    // 1. Show available tools
    const tools = await this.getTools();
    console.log('📋 Available MCP Tools:', tools.map(t => t.name).join(', '));

    // 2. Get agent hub status
    const hubStatus = await this.getAgentHubStatus();
    console.log(`\n📊 Agent Hub: ${hubStatus.agentHub.totalAgents} total, ${hubStatus.agentHub.activeAgents} active`);

    // 3. Test dual agent routing
    const testQueries = [
      { type: 'inline-code', query: 'Create a React component for user authentication' },
      { type: 'aws-specific', query: 'Setup CloudFormation template for S3 + CloudFront' },
      { type: 'security-audit', query: 'Analyze code for potential vulnerabilities' },
    ];

    for (const test of testQueries) {
      try {
        const result = await this.routeThroughDualAgent(test.type, test.query);
        console.log(`✅ ${test.type}: ${result.agent} handled successfully`);
      } catch (error) {
        console.log(`❌ ${test.type}: ${error.message}`);
      }
    }

    // 4. List agents by category
    const coreAgents = await this.listAgentsByCategory('core');
    console.log(`\n🤖 Core AI Agents: ${coreAgents.core?.length || 0}`);

    // 5. Get comprehensive stats
    const stats = await this.getOrchestratorStats();
    console.log('\n📈 System Statistics:');
    console.log(`   - Copilot requests: ${stats.orchestrator.copilotRequests}`);
    console.log(`   - Amazon Q requests: ${stats.orchestrator.amazonQRequests}`);
    console.log(`   - Fallbacks: ${stats.orchestrator.fallbacks}`);
    console.log(`   - Connected agents: ${stats.orchestrator.connectedAgents}`);

    console.log('\n✅ Dual AI Agent Connection Demo Complete!');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
    }
    console.log('🛑 Disconnected from Enhanced MCP Server');
  }
}

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const client = new EnhancedMCPClient();

  try {
    await client.connect();
    await client.demonstrateConnections();
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  } finally {
    await client.disconnect();
  }
}

export default EnhancedMCPClient;
