#!/usr/bin/env node

/**
 * Test script for GitHub Actions Monitoring Agent
 * This script tests the agent in both mock and real mode
 */

import { GitHubActionsMonitoringAgent } from './frameworks/ai/agents/production-agent-implementations.js';

console.log('🧪 Testing GitHub Actions Monitoring Agent\n');

async function runTests() {
  let testsPass = 0;
  let testsFail = 0;

  // Test 1: Agent initialization
  console.log('Test 1: Agent initialization...');
  try {
    const agent = new GitHubActionsMonitoringAgent();
    console.log('   ✅ Agent created successfully');
    testsPass++;
    
    // Test 2: Start agent
    console.log('\nTest 2: Starting agent...');
    await agent.start();
    console.log('   ✅ Agent started successfully');
    testsPass++;
    
    // Test 3: Check status
    console.log('\nTest 3: Getting monitoring status...');
    const status = agent.getMonitoringStatus();
    console.log('   Status:', JSON.stringify(status, null, 2));
    if (status.name === 'github-actions-monitoring' && status.status === 'active') {
      console.log('   ✅ Status retrieved successfully');
      testsPass++;
    } else {
      console.log('   ❌ Status check failed');
      testsFail++;
    }
    
    // Test 4: Generate mock workflow runs
    console.log('\nTest 4: Generating mock workflow runs...');
    const runs = agent.generateMockWorkflowRuns();
    console.log(`   Generated ${runs.length} mock runs`);
    if (runs.length > 0) {
      console.log('   ✅ Mock workflow runs generated');
      testsPass++;
    } else {
      console.log('   ❌ Mock workflow generation failed');
      testsFail++;
    }
    
    // Test 5: Analyze workflow runs
    console.log('\nTest 5: Analyzing workflow runs...');
    const analysis = await agent.analyzeWorkflowRuns(runs);
    console.log('   Analysis:', JSON.stringify(analysis, null, 2));
    if (analysis) {
      console.log('   ✅ Analysis completed');
      testsPass++;
    } else {
      console.log('   ❌ Analysis failed');
      testsFail++;
    }
    
    // Test 6: Check metrics
    console.log('\nTest 6: Checking agent metrics...');
    const metrics = agent.metrics;
    console.log('   Metrics:', JSON.stringify(metrics, null, 2));
    if (metrics && typeof metrics.tasksProcessed === 'number') {
      console.log('   ✅ Metrics available');
      testsPass++;
    } else {
      console.log('   ❌ Metrics check failed');
      testsFail++;
    }
    
    // Test 7: Event listeners
    console.log('\nTest 7: Testing event listeners...');
    let eventReceived = false;
    agent.once('workflowCheck', (data) => {
      eventReceived = true;
      console.log('   Event received:', data);
    });
    
    // Manually trigger a check
    await agent.checkWorkflowRuns();
    
    // Wait a bit for event
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (eventReceived) {
      console.log('   ✅ Event listeners working');
      testsPass++;
    } else {
      console.log('   ❌ Event listeners not working');
      testsFail++;
    }
    
    // Test 8: Failure pattern analysis
    console.log('\nTest 8: Testing failure pattern analysis...');
    const mockLogs = 'npm ERR! code ECONNREFUSED\nError: Test suite failed\nTypeError: Cannot read property';
    const logAnalysis = agent.analyzeLogs(mockLogs);
    console.log('   Log analysis:', JSON.stringify(logAnalysis, null, 2));
    if (logAnalysis && logAnalysis.hasErrors) {
      console.log('   ✅ Failure pattern analysis working');
      testsPass++;
    } else {
      console.log('   ❌ Failure pattern analysis failed');
      testsFail++;
    }
    
    // Test 9: Stop agent
    console.log('\nTest 9: Stopping agent...');
    await agent.stop();
    if (agent.status === 'stopped') {
      console.log('   ✅ Agent stopped successfully');
      testsPass++;
    } else {
      console.log('   ❌ Agent stop failed');
      testsFail++;
    }
    
  } catch (error) {
    console.error('   ❌ Test failed with error:', error.message);
    testsFail++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Test Summary:');
  console.log(`   ✅ Passed: ${testsPass}`);
  console.log(`   ❌ Failed: ${testsFail}`);
  console.log(`   Total:  ${testsPass + testsFail}`);
  console.log('='.repeat(50));
  
  return testsFail === 0;
}

// Run tests
runTests()
  .then((success) => {
    if (success) {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });
