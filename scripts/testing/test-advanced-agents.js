#!/usr/bin/env node

/**
 * Advanced Agent Setup Test
 * Validates that all advanced agent capabilities are working
 */

import chalk from 'chalk';
import AgentOrchestrator from './frameworks/ai/agents/agent-orchestrator.js';

console.log(chalk.bold.cyan('\n🧪 Testing Advanced Agent Setup\n'));

async function runTests() {
    const orchestrator = new AgentOrchestrator();
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Initialization
    console.log(chalk.yellow('1. Testing agent initialization...'));
    try {
        await orchestrator.initialize();
        if (orchestrator.agents.size >= 5) {
            console.log(chalk.green('   ✅ All agents initialized'));
            results.passed++;
            results.tests.push({ name: 'Initialization', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ Not all agents initialized'));
            results.failed++;
            results.tests.push({ name: 'Initialization', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Initialization failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Initialization', status: 'failed', error: error.message });
    }

    // Test 2: Agent Status
    console.log(chalk.yellow('\n2. Testing agent status...'));
    try {
        const status = orchestrator.getStatus();
        if (status.agents && Object.keys(status.agents).length > 0) {
            console.log(chalk.green('   ✅ Agent status available'));
            results.passed++;
            results.tests.push({ name: 'Agent Status', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ No agent status'));
            results.failed++;
            results.tests.push({ name: 'Agent Status', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Status check failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Agent Status', status: 'failed', error: error.message });
    }

    // Test 3: Learning Workflow
    console.log(chalk.yellow('\n3. Testing learning workflow...'));
    try {
        const result = await orchestrator.executeTask({
            type: 'learning'
        });
        if (result.status === 'learning-active') {
            console.log(chalk.green('   ✅ Learning workflow executed'));
            results.passed++;
            results.tests.push({ name: 'Learning Workflow', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ Learning workflow failed'));
            results.failed++;
            results.tests.push({ name: 'Learning Workflow', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Learning workflow failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Learning Workflow', status: 'failed', error: error.message });
    }

    // Test 4: Code Analysis Workflow
    console.log(chalk.yellow('\n4. Testing code analysis workflow...'));
    try {
        const result = await orchestrator.executeTask({
            type: 'code-analysis',
            targetPath: '.',
            autoFix: false
        });
        if (result.analysis && result.recommendations) {
            console.log(chalk.green('   ✅ Code analysis workflow executed'));
            results.passed++;
            results.tests.push({ name: 'Code Analysis', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ Code analysis incomplete'));
            results.failed++;
            results.tests.push({ name: 'Code Analysis', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Code analysis failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Code Analysis', status: 'failed', error: error.message });
    }

    // Test 5: Maintenance Workflow
    console.log(chalk.yellow('\n5. Testing maintenance workflow...'));
    try {
        const result = await orchestrator.executeTask({
            type: 'maintenance'
        });
        if (result.immediateActions !== undefined && result.scheduledMaintenance !== undefined) {
            console.log(chalk.green('   ✅ Maintenance workflow executed'));
            results.passed++;
            results.tests.push({ name: 'Maintenance', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ Maintenance workflow incomplete'));
            results.failed++;
            results.tests.push({ name: 'Maintenance', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Maintenance workflow failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Maintenance', status: 'failed', error: error.message });
    }

    // Test 6: Documentation Workflow
    console.log(chalk.yellow('\n6. Testing documentation workflow...'));
    try {
        const result = await orchestrator.executeTask({
            type: 'documentation',
            targetPath: '.',
            includeArchitecture: true
        });
        if (result.overview && result.api) {
            console.log(chalk.green('   ✅ Documentation workflow executed'));
            results.passed++;
            results.tests.push({ name: 'Documentation', status: 'passed' });
        } else {
            console.log(chalk.red('   ❌ Documentation workflow incomplete'));
            results.failed++;
            results.tests.push({ name: 'Documentation', status: 'failed' });
        }
    } catch (error) {
        console.log(chalk.red(`   ❌ Documentation workflow failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Documentation', status: 'failed', error: error.message });
    }

    // Shutdown
    console.log(chalk.yellow('\n7. Testing shutdown...'));
    try {
        await orchestrator.shutdown();
        console.log(chalk.green('   ✅ Agents shut down cleanly'));
        results.passed++;
        results.tests.push({ name: 'Shutdown', status: 'passed' });
    } catch (error) {
        console.log(chalk.red(`   ❌ Shutdown failed: ${error.message}`));
        results.failed++;
        results.tests.push({ name: 'Shutdown', status: 'failed', error: error.message });
    }

    return results;
}

// Run tests
runTests().then(results => {
    console.log(chalk.bold.cyan('\n📊 Test Results:\n'));
    console.log(`   ${chalk.green('Passed:')} ${results.passed}`);
    console.log(`   ${chalk.red('Failed:')} ${results.failed}`);
    console.log(`   ${chalk.blue('Total:')} ${results.passed + results.failed}`);

    if (results.failed === 0) {
        console.log(chalk.bold.green('\n✅ All tests passed! Advanced agents are ready.\n'));
        console.log(chalk.cyan('Next steps:'));
        console.log('   • Run: npm run orchestrator:status');
        console.log('   • Check: docs/ADVANCED_AGENTS.md');
        console.log('   • Try: npm run orchestrator:analyze\n');
        process.exit(0);
    } else {
        console.log(chalk.bold.red('\n❌ Some tests failed. Review errors above.\n'));
        process.exit(1);
    }
}).catch(error => {
    console.error(chalk.red('\n❌ Test suite failed to run:'), error.message);
    process.exit(1);
});
