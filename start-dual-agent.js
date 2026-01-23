#!/usr/bin/env node

import DualAgentOrchestrator from './frameworks/ai/agents/dual-agent-orchestrator.js';

console.log('🤖 Starting HOOTNER Dual-Agent System...\n');

const orchestrator = new DualAgentOrchestrator();
orchestrator.enableDualMode();

console.log('\n📊 Agent Status:');
const stats = orchestrator.getStats();
console.log(`   GitHub Copilot: ${stats.agents.copilot.mode.toUpperCase()}`);
console.log(`   Amazon Q: ${stats.agents.amazonQ.mode.toUpperCase()}`);

console.log('\n✅ Dual-Agent System Ready!');
console.log('\n📋 Available Commands:');
console.log('   npm run dual-agent:status   - Check status');
console.log('   npm run dual-agent:disable  - Disable dual mode');
console.log('   npm run dual-agent:enable   - Enable dual mode');

// Example routing
console.log('\n🔄 Testing Request Routing...');
const testRequests = [
  { type: 'inline-code', query: 'Generate function', context: {} },
  { type: 'aws-specific', query: 'Setup S3 bucket', context: {} },
  { type: 'security-audit', query: 'Scan for vulnerabilities', context: {} }
];

for (const req of testRequests) {
  await orchestrator.route(req);
}

console.log('\n📈 Stats:', {
  copilot: stats.copilotRequests,
  amazonQ: stats.amazonQRequests,
  fallbacks: stats.fallbacks
});
