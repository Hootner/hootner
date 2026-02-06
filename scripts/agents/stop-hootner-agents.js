#!/usr/bin/env node

/**
 * Direct Agent Stopper - Preserves Dual AI Setup
 * Stops HOOTNER agents while keeping Amazon Q and Copilot active
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function stopHootnerAgents() {
  console.log('🛑 Stopping HOOTNER agents while preserving dual Amazon Q and Copilot...\n');

  const agentProcesses = [
    'enhanced-agent-hub',
    'multi-agent-orchestrator', 
    'agent-orchestrator',
    'repo-scan-agent',
    'api-security-scanner',
    'manual-agent-controller'
  ];

  let stoppedCount = 0;

  try {
    // Get detailed process information
    const { stdout } = await execAsync('wmic process get ProcessId,CommandLine /format:csv');
    const lines = stdout.split('\n').filter(line => line.includes('node'));

    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const commandLine = parts[1] || '';
        const pid = parts[2] || '';

        // Check if this is a HOOTNER agent process
        const isHootnerAgent = agentProcesses.some(agent => 
          commandLine.toLowerCase().includes(agent.toLowerCase())
        );

        // Preserve dual AI processes
        const isDualAI = ['amazon-q', 'copilot', 'mcp-server', 'dual-ai'].some(service =>
          commandLine.toLowerCase().includes(service.toLowerCase())
        );

        if (isHootnerAgent && !isDualAI && pid.trim()) {
          try {
            await execAsync(`taskkill /PID ${pid.trim()} /F`);
            console.log(`   ✅ Stopped agent process PID ${pid.trim()}`);
            stoppedCount++;
          } catch (error) {
            console.log(`   ⚠️  Could not stop PID ${pid.trim()} (may not exist)`);
          }
        }
      }
    }

    if (stoppedCount === 0) {
      console.log('✅ No HOOTNER agent processes found running');
    } else {
      console.log(`\n✅ Stopped ${stoppedCount} HOOTNER agent process(es)`);
    }

  } catch (error) {
    console.log('⚠️  Could not check processes (this is normal on some systems)');
  }

  // Show final status
  console.log('\n🔒 Preserved Services:');
  console.log('   🤖 Amazon Q: Active in IDE');
  console.log('   🤖 Copilot: Active in IDE');
  console.log('   🔗 MCP Protocol: Available');
  
  console.log('\n🎯 Dual AI Workflow Ready:');
  console.log('   • Use Amazon Q for code analysis and suggestions');
  console.log('   • Use Copilot for code completion and generation');
  console.log('   • Both AI assistants work together seamlessly');
  
  console.log('\n📋 Management Commands:');
  console.log('   • Restart agents: npm run agents:start');
  console.log('   • Check status: npm run agents:status');
  console.log('   • Test dual AI: npm run dual-agent:test');
}

stopHootnerAgents().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});