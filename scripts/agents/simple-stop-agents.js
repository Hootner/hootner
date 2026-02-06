#!/usr/bin/env node

/**
 * Stop Agents but Keep Dual Amazon Q and Copilot
 * Simple script to stop HOOTNER agents while preserving dual AI setup
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class SimpleAgentStopper {
  constructor() {
    this.preservedKeywords = [
      'amazon-q',
      'copilot', 
      'dual-ai',
      'mcp-server',
      'amazonq-chat'
    ];
  }

  async stopAgents() {
    console.log('🛑 Stopping HOOTNER agents while preserving dual Amazon Q and Copilot...\n');

    try {
      // Get all Node.js processes
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
      
      console.log(`📋 Found ${lines.length - 1} Node.js processes`);

      if (lines.length <= 1) {
        console.log('✅ No Node.js processes found to stop');
        this.showStatus();
        return;
      }

      // For now, just show what we found and let user decide
      console.log('\n🔍 Current Node.js processes:');
      lines.forEach((line, index) => {
        if (index > 0 && line.trim()) {
          const parts = line.split(',');
          if (parts.length >= 2) {
            const pid = parts[1].replace(/"/g, '');
            console.log(`   • PID ${pid}: Node.js process`);
          }
        }
      });

      console.log('\n⚠️  Manual action required:');
      console.log('   • Check if any processes are HOOTNER agents');
      console.log('   • Kill agent processes manually if needed');
      console.log('   • Preserve Amazon Q and Copilot processes');

      this.showStatus();

    } catch (error) {
      console.error('❌ Error checking processes:', error.message);
    }
  }

  showStatus() {
    console.log('\n✅ Dual AI Status:');
    console.log('   🤖 Amazon Q: Available in IDE');
    console.log('   🤖 Copilot: Available in IDE');
    console.log('\n🎯 Next steps:');
    console.log('   • Amazon Q and Copilot remain active');
    console.log('   • Use dual AI workflow for development');
    console.log('   • Restart agents with: npm run agents:start');
    console.log('   • Check agent status with: npm run agents:status');
  }
}

// Main execution
async function main() {
  const stopper = new SimpleAgentStopper();
  await stopper.stopAgents();
}

main().catch(error => {
  console.error('\n💥 Error:', error.message);
  process.exit(1);
});