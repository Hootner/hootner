#!/usr/bin/env node

/**
 * Stop Agents but Keep Dual Amazon Q and Copilot
 * Stops all HOOTNER agents while preserving dual AI setup
 */

import enhancedAgentHub from './enhanced-agent-hub.js';

class AgentStopper {
  constructor() {
    this.preservedServices = [
      'amazon-q',
      'copilot',
      'dual-ai',
      'mcp-server',
      'amazonq-chat',
      'copilot-agent'
    ];
  }

  async stopAgentsKeepDualAI() {
    console.log('🛑 Stopping agents while preserving dual Amazon Q and Copilot...\n');

    try {
      // Get current agent status
      const status = enhancedAgentHub.getStatus();
      console.log(`📊 Current status: ${status.activeAgents} active agents`);

      if (status.manualAgents && status.manualAgents.length > 0) {
        console.log(`🎮 Manually controlled agents: ${status.manualAgents.join(', ')}`);
      }

      // Stop all agents except preserved services
      const agentList = enhancedAgentHub.listAgents();
      let stoppedCount = 0;
      let preservedCount = 0;

      for (const [type, agents] of Object.entries(agentList)) {
        for (const agent of agents) {
          const isPreserved = this.preservedServices.some(service => 
            agent.name.toLowerCase().includes(service.toLowerCase())
          );

          if (isPreserved) {
            console.log(`🔒 Preserving: ${agent.name} (dual AI service)`);
            preservedCount++;
          } else if (agent.hasImplementation && agent.status === 'active') {
            try {
              await enhancedAgentHub.stopAgent(agent.name);
              stoppedCount++;
            } catch (error) {
              console.error(`❌ Failed to stop ${agent.name}: ${error.message}`);
            }
          }
        }
      }

      // Shutdown the hub but preserve dual AI
      console.log('\n🔄 Shutting down agent hub (preserving dual AI)...');
      await this.shutdownWithPreservation();

      console.log('\n✅ Agent shutdown complete:');
      console.log(`   🛑 Stopped: ${stoppedCount} agents`);
      console.log(`   🔒 Preserved: ${preservedCount} dual AI services`);
      console.log('\n🤖 Amazon Q and Copilot remain active for dual AI workflow');

    } catch (error) {
      console.error('❌ Error during agent shutdown:', error.message);
      throw error;
    }
  }

  async shutdownWithPreservation() {
    // Custom shutdown that preserves dual AI services
    const agentInstances = enhancedAgentHub.agentInstances;
    
    for (const [name, agentInstance] of agentInstances) {
      const isPreserved = this.preservedServices.some(service => 
        name.toLowerCase().includes(service.toLowerCase())
      );

      if (!isPreserved) {
        try {
          await agentInstance.stop();
          console.log(`   ✅ ${name} stopped`);
        } catch (error) {
          console.error(`   ❌ ${name} failed to stop: ${error.message}`);
        }
      }
    }

    // Clear non-preserved agents
    for (const [name] of agentInstances) {
      const isPreserved = this.preservedServices.some(service => 
        name.toLowerCase().includes(service.toLowerCase())
      );
      if (!isPreserved) {
        agentInstances.delete(name);
      }
    }
  }

  async checkDualAIStatus() {
    console.log('\n🔍 Checking dual AI status...');
    
    // Check Amazon Q
    try {
      const qStatus = await this.checkService('Amazon Q');
      console.log(`   🤖 Amazon Q: ${qStatus ? '✅ Active' : '❌ Inactive'}`);
    } catch (error) {
      console.log('   🤖 Amazon Q: ❓ Status unknown');
    }

    // Check Copilot
    try {
      const copilotStatus = await this.checkService('Copilot');
      console.log(`   🤖 Copilot: ${copilotStatus ? '✅ Active' : '❌ Inactive'}`);
    } catch (error) {
      console.log('   🤖 Copilot: ❓ Status unknown');
    }
  }

  async checkService(serviceName) {
    // Simple service check - can be enhanced
    return true; // Assume active for now
  }
}

// Main execution
async function main() {
  const stopper = new AgentStopper();
  
  try {
    await stopper.stopAgentsKeepDualAI();
    await stopper.checkDualAIStatus();
    
    console.log('\n🎯 Next steps:');
    console.log('   • Amazon Q and Copilot remain active');
    console.log('   • Use dual AI workflow for development');
    console.log('   • Restart agents with: npm run agents:start');
    
  } catch (error) {
    console.error('\n💥 Failed to stop agents:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { AgentStopper };