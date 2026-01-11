#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Enhanced Agent Hub
const enhancedAgentHub = require('./enhanced-agent-hub');

// Individual Services
const personalizationAgent = require('./services/personalization-agent');
const paymentFraudDetectionAgent = require('./services/payment-fraud-detection-agent');

// Fix Agents
const masterFixAgent = require('./frameworks/ai/agents/agents/master-fix-agent');

// Multi-Agent Orchestrator
const multiAgentOrchestrator = require('./frameworks/ai/ai/multi-agent-orchestrator');

// Logger
const logger = require('./lib/logger');

class AgentRunner {
  constructor() {
    this.runningAgents = new Map();
    this.agentStatus = new Map();
  }

  async startAllAgents() {
    console.log('🤖 Starting All HOOTNER Agents...\n');

    try {
      // 1. Enhanced Agent Hub (12 agents)
      console.log('📊 Initializing Enhanced Agent Hub (12 agents)...');
      enhancedAgentHub.initialize();
      this.runningAgents.set('enhanced-hub', enhancedAgentHub);
      this.agentStatus.set('enhanced-hub', 'running');
      console.log('✅ Enhanced Agent Hub started\n');

      // 2. Personalization Agent
      console.log('🎯 Starting Personalization Agent...');
      if (personalizationAgent.start) {
        await personalizationAgent.start();
      }
      this.runningAgents.set('personalization', personalizationAgent);
      this.agentStatus.set('personalization', 'running');
      console.log('✅ Personalization Agent started\n');

      // 3. Payment Fraud Detection Agent
      console.log('💳 Starting Payment Fraud Detection Agent...');
      if (paymentFraudDetectionAgent.start) {
        await paymentFraudDetectionAgent.start();
      }
      this.runningAgents.set('payment-fraud-detection', paymentFraudDetectionAgent);
      this.agentStatus.set('payment-fraud-detection', 'running');
      console.log('✅ Payment Fraud Detection Agent started\n');

      // 4. Master Fix Agent
      console.log('🔧 Starting Master Fix Agent...');
      if (masterFixAgent.start) {
        await masterFixAgent.start();
      }
      this.runningAgents.set('master-fix', masterFixAgent);
      this.agentStatus.set('master-fix', 'running');
      console.log('✅ Master Fix Agent started\n');

      // 5. Multi-Agent Orchestrator
      console.log('🎭 Starting Multi-Agent Orchestrator...');
      if (multiAgentOrchestrator.start) {
        await multiAgentOrchestrator.start();
      }
      this.runningAgents.set('orchestrator', multiAgentOrchestrator);
      this.agentStatus.set('orchestrator', 'running');
      console.log('✅ Multi-Agent Orchestrator started\n');

      // Display status
      this.displayAgentStatus();

      // Start monitoring
      this.startMonitoring();

    } catch (error) {
      console.error('❌ Error starting agents:', error.message);
      logger.error('Agent startup failed', error);
    }
  }

  displayAgentStatus() {
    console.log('🎯 AGENT STATUS DASHBOARD');
    console.log('=' .repeat(50));
    
    // Enhanced Hub Status
    const hubStatus = enhancedAgentHub.getStatus();
    console.log('\n📊 Enhanced Agent Hub (12 agents):');
    console.log(`   • Compliance: ${hubStatus.compliance.dmcaRequests} DMCA, ${hubStatus.compliance.coppaViolations} COPPA`);
    console.log(`   • Security: ${hubStatus.security.activeThreats} threats, ${hubStatus.security.vulnerabilities} vulnerabilities`);
    console.log(`   • Business Intelligence: ${hubStatus.businessIntelligence.kpis} KPIs, ${hubStatus.businessIntelligence.dashboards} dashboards`);
    console.log(`   • Operations: ${hubStatus.operations.incidents} incidents`);
    console.log(`   • Payment Fraud: ${hubStatus.paymentFraud.transactions} transactions monitored`);
    console.log(`   • Recommendations: ${hubStatus.recommendation.userProfiles} user profiles`);
    console.log(`   • Analytics: ${hubStatus.analytics.userBehavior} behavior patterns`);
    console.log(`   • Customer Support: Active`);
    console.log(`   • Performance: Active`);
    console.log(`   • Integration: Active`);
    console.log(`   • Localization: Active`);
    console.log(`   • Legal: Active`);

    console.log('\n🎯 Individual Agents:');
    this.agentStatus.forEach((status, name) => {
      const emoji = status === 'running' ? '✅' : '❌';
      console.log(`   ${emoji} ${name}: ${status}`);
    });

    console.log(`\n📈 Total Agents Running: ${this.runningAgents.size}`);
    console.log('=' .repeat(50));
  }

  startMonitoring() {
    console.log('\n🔍 Starting Agent Monitoring...');
    
    setInterval(() => {
      this.checkAgentHealth();
    }, 30000); // Check every 30 seconds

    // Log status every 5 minutes
    setInterval(() => {
      this.logAgentMetrics();
    }, 300000);
  }

  checkAgentHealth() {
    this.runningAgents.forEach((agent, name) => {
      try {
        if (agent.healthCheck && typeof agent.healthCheck === 'function') {
          const health = agent.healthCheck();
          if (!health) {
            console.log(`⚠️  Agent ${name} health check failed`);
            this.agentStatus.set(name, 'unhealthy');
          }
        }
      } catch (error) {
        console.log(`❌ Agent ${name} error:`, error.message);
        this.agentStatus.set(name, 'error');
      }
    });
  }

  logAgentMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      totalAgents: this.runningAgents.size,
      runningAgents: Array.from(this.agentStatus.entries()).filter(([, status]) => status === 'running').length,
      enhancedHubStatus: enhancedAgentHub.getStatus()
    };

    logger.system('Agent metrics', metrics);
  }

  async stopAllAgents() {
    console.log('\n🛑 Stopping all agents...');
    
    for (const [name, agent] of this.runningAgents) {
      try {
        if (agent.stop && typeof agent.stop === 'function') {
          await agent.stop();
          console.log(`✅ Stopped ${name}`);
        }
        this.agentStatus.set(name, 'stopped');
      } catch (error) {
        console.log(`❌ Error stopping ${name}:`, error.message);
      }
    }

    console.log('🏁 All agents stopped');
  }

  // Get comprehensive agent analytics
  getAnalytics() {
    return {
      totalAgents: this.runningAgents.size,
      agentStatus: Object.fromEntries(this.agentStatus),
      enhancedHubMetrics: enhancedAgentHub.getStatus(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}

// Create and start agent runner
const agentRunner = new AgentRunner();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await agentRunner.stopAllAgents();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await agentRunner.stopAllAgents();
  process.exit(0);
});

// Start all agents
if (import.meta.url === `file://${process.argv[1]}`) {
  agentRunner.startAllAgents().catch(console.error);
}

export default agentRunner;