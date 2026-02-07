#!/usr/bin/env node

import enhancedAgentHub from './enhanced-agent-hub.js';

console.log('�� Testing Enhanced Agent Hub with GitHub Actions Monitoring Agent\n');

async function testHub() {
  try {
    // Initialize the hub (which will start all production agents)
    await enhancedAgentHub.initialize();
    
    // Wait a moment for agents to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the GitHub Actions monitoring agent
    const agent = await enhancedAgentHub.getAgentInstance('github-actions-monitoring');
    
    if (agent) {
      console.log('\n✅ GitHub Actions Monitoring Agent found in hub!');
      
      // Get status
      const status = agent.getMonitoringStatus();
      console.log('\n📊 Agent Status:');
      console.log(JSON.stringify(status, null, 2));
      
      // List all agents
      const allAgents = enhancedAgentHub.listAgents();
      console.log('\n📋 All Agents by Type:');
      for (const [type, agents] of Object.entries(allAgents)) {
        console.log(`\n  ${type}:`);
        const relevantAgents = agents.filter(a => 
          a.name.includes('github-actions') || 
          a.name.includes('auto-scaling') || 
          a.name.includes('security')
        );
        relevantAgents.forEach(a => {
          console.log(`    - ${a.name}: ${a.status} ${a.hasImplementation ? '✅' : '⚪'}`);
        });
      }
      
      console.log('\n✅ Test completed successfully!');
    } else {
      console.log('\n❌ GitHub Actions Monitoring Agent not found in hub');
    }
    
    // Shutdown
    await enhancedAgentHub.shutdown();
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testHub();
