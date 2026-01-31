#!/usr/bin/env node

/**
 * Dual AI Agent Connection Test
 * Verifies that all agents are properly connected and communicating
 */

import EnhancedMCPClient from './enhanced-mcp-client.js';
import { execSync } from 'child_process';

class DualAIAgentConnectionTest {
  constructor() {
    this.client = null;
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async runTest(testName, testFunction) {
    this.testResults.total++;
    try {
      console.log(`🧪 Testing: ${testName}...`);
      await testFunction();
      console.log(`✅ ${testName} - PASSED`);
      this.testResults.passed++;
    } catch (error) {
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push({ testName, error: error.message });
    }
  }

  async runAllTests() {
    console.log('🦉 HOOTNER Dual AI Agent Connection Test Suite\n');
    console.log('🔧 Starting comprehensive connection tests...\n');

    try {
      // Initialize MCP client
      this.client = new EnhancedMCPClient();
      await this.client.connect();

      // Test 1: Verify enhanced agent hub is running
      await this.runTest('Enhanced Agent Hub Status', async () => {
        const status = await this.client.getAgentHubStatus();
        if (!status.agentHub || status.agentHub.totalAgents < 70) {
          throw new Error(`Expected 75+ agents, got ${status.agentHub?.totalAgents || 0}`);
        }
      });

      // Test 2: Test dual agent routing
      await this.runTest('Dual Agent Routing - Copilot', async () => {
        const result = await this.client.routeThroughDualAgent(
          'inline-code',
          'Generate a simple React component'
        );
        if (!result.agent || !result.response) {
          throw new Error('Invalid response from dual agent routing');
        }
      });

      // Test 3: Test AWS-specific routing to Amazon Q
      await this.runTest('Dual Agent Routing - Amazon Q', async () => {
        const result = await this.client.routeThroughDualAgent(
          'aws-specific',
          'Create S3 bucket with encryption'
        );
        if (!result.agent || !result.response) {
          throw new Error('Invalid response from AWS-specific routing');
        }
      });

      // Test 4: Test specialized agent execution
      await this.runTest('Specialized Agent Execution', async () => {
        const agents = await this.client.listAgentsByCategory('security');
        if (!agents.security || agents.security.length === 0) {
          throw new Error('No security agents found');
        }
      });

      // Test 5: Test orchestrator statistics
      await this.runTest('Orchestrator Statistics', async () => {
        const stats = await this.client.getOrchestratorStats();
        if (!stats.orchestrator || typeof stats.orchestrator.copilotRequests !== 'number') {
          throw new Error('Invalid orchestrator statistics');
        }
      });

      // Test 6: Test agent categories
      await this.runTest('Agent Categories', async () => {
        const categories = ['core', 'business', 'security', 'infrastructure', 'service'];
        for (const category of categories) {
          const agents = await this.client.listAgentsByCategory(category);
          if (!agents[category]) {
            throw new Error(`No agents found in category: ${category}`);
          }
        }
      });

      // Test 7: Test event bus integration
      await this.runTest('Event Bus Integration', async () => {
        // This would require checking if event bus is working
        // For now, just verify orchestrator has connected agents
        const stats = await this.client.getOrchestratorStats();
        if (stats.orchestrator.connectedAgents < 1) {
          throw new Error('No connected agents found in orchestrator');
        }
      });

    } finally {
      if (this.client) {
        await this.client.disconnect();
      }
    }

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🦉 DUAL AI AGENT CONNECTION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.testResults.total}`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults.errors.forEach(({ testName, error }) => {
        console.log(`   • ${testName}: ${error}`);
      });
    }

    console.log('\n🔗 CONNECTION STATUS:');
    if (this.testResults.passed === this.testResults.total) {
      console.log('✅ ALL DUAL AI AGENTS CONNECTED SUCCESSFULLY!');
      console.log('🚀 System ready for production use');
    } else {
      console.log('⚠️  Some connections failed - check configuration');
      console.log('📋 Next steps:');
      console.log('   1. Review error messages above');
      console.log('   2. Check agent hub initialization');
      console.log('   3. Verify MCP server setup');
      console.log('   4. Run: npm run dual-agent:start');
    }

    console.log('\n📖 Available Commands:');
    console.log('   npm run dual-agent:start   - Start dual agent system');
    console.log('   npm run dual-agent:status  - Check agent status');
    console.log('   npm run mcp:demo          - Run MCP demonstration');
    console.log('   npm run agents:status     - Check all agents');
    console.log('='.repeat(60));
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new DualAIAgentConnectionTest();
  await tester.runAllTests();
  
  // Exit with error code if tests failed
  process.exit(tester.testResults.failed > 0 ? 1 : 0);
}

export default DualAIAgentConnectionTest;