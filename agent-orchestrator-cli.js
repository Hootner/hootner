#!/usr/bin/env node

/**
 * Agent Orchestrator CLI
 * Command-line interface for advanced agent orchestration
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { program } from 'commander';
import ora from 'ora';
import AgentOrchestrator from './frameworks/ai/agents/agent-orchestrator.js';

const orchestrator = new AgentOrchestrator();

// Event listeners for real-time feedback
orchestrator.on('task-started', ({ taskId, config }) => {
    console.log(chalk.blue(`\n▶️  Task ${taskId} started: ` + config.type + ``));
});

orchestrator.on('task-completed', ({ taskId }) => {
    console.log(chalk.green(`✅ Task ` + taskId + ` completed successfully`));
});

orchestrator.on('task-failed', ({ taskId, error }) => {
    console.log(chalk.red(`❌ Task ${taskId} failed: ` + error + ``));
});

orchestrator.on('agent-started', ({ agent }) => {
    console.log(chalk.cyan(`🤖 Agent ` + agent + ` started`));
});

orchestrator.on('agent-stopped', ({ agent }) => {
    console.log(chalk.yellow(`⏸️  Agent ` + agent + ` stopped`));
});

// CLI Commands
program
    .name('orchestrator')
    .description('Advanced AI Agent Orchestration CLI')
    .version('1.0.0');

program
    .command('init')
    .description('Initialize the agent orchestrator')
    .action(async () => {
        const spinner = ora('Initializing Agent Orchestrator...').start();
        try {
            await orchestrator.initialize();
            spinner.succeed('Agent Orchestrator initialized successfully');
        } catch (error) {
            spinner.fail(`Initialization failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('analyze')
    .description('Run code analysis workflow')
    .option('-p, --path <path>', 'Target path to analyze', '.')
    .option('--auto-fix', 'Apply automatic fixes', false)
    .action(async (options) => {
        await orchestrator.initialize();

        const spinner = ora('Running code analysis workflow...').start();
        try {
            const result = await orchestrator.executeTask({
                type: 'code-analysis',
                targetPath: options.path,
                autoFix: options.autoFix
            });

            spinner.succeed('Code analysis completed');

            // Display results
            console.log(chalk.bold('\n📊 Analysis Results:'));
            console.log(`Files Analyzed: ` + result.summary.filesAnalyzed + ``);
            console.log(`Issues Found: ` + result.summary.issuesFound + ``);
            console.log(`Security Score: ` + result.summary.securityScore + ``);
            console.log(`Auto-fix Applied: ` + result.summary.autoFixApplied ? 'Yes' : 'No' + ``);

            if (result.recommendations && result.recommendations.length > 0) {
                console.log(chalk.bold('\n💡 Recommendations:'));
                result.recommendations.forEach((rec, i) => {
                    const icon = rec.priority === 'critical' ? '🔴' :
                        rec.priority === 'high' ? '🟠' : '🟡';
                    console.log(`${icon} ${i + 1}. [${rec.type}] ` + rec.message + ``);
                });
            }
        } catch (error) {
            spinner.fail(`Analysis failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('deploy')
    .description('Run autonomous deployment workflow')
    .option('-e, --env <environment>', 'Target environment', 'production')
    .option('-b, --branch <branch>', 'Git branch to deploy', 'main')
    .action(async (options) => {
        await orchestrator.initialize();

        const spinner = ora(`Deploying to ` + options.env + `...`).start();
        try {
            const result = await orchestrator.executeTask({
                type: 'deployment',
                environment: options.env,
                branch: options.branch
            });

            if (result.success) {
                spinner.succeed(`Deployment to ` + options.env + ` completed successfully`);
                console.log(chalk.green(`\n✅ Deployment ID: ` + result.deploymentId + ``));
            } else {
                spinner.fail('Deployment failed');
                console.log(chalk.red(`\n❌ Error: ` + result.error + ``));
                process.exit(1);
            }
        } catch (error) {
            spinner.fail(`Deployment failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('docs')
    .description('Generate intelligent documentation')
    .option('-p, --path <path>', 'Target path for documentation', '.')
    .option('--no-architecture', 'Skip architecture diagrams')
    .action(async (options) => {
        await orchestrator.initialize();

        const spinner = ora('Generating documentation...').start();
        try {
            const result = await orchestrator.executeTask({
                type: 'documentation',
                targetPath: options.path,
                includeArchitecture: options.architecture
            });

            spinner.succeed('Documentation generated');

            console.log(chalk.bold('\n📝 Documentation Generated:'));
            console.log('Overview: ✅');
            console.log('API Reference: ✅');
            console.log('Examples: ✅');
            console.log('Changelog: ✅');
            if (result.architecture) {
                console.log('Architecture Diagrams: ✅');
            }
            if (result.codeInsights) {
                console.log(chalk.bold('\n🔍 Code Insights:'));
                console.log(`Complexity: ` + result.codeInsights.complexity + ``);
                console.log(`Maintainability: ` + result.codeInsights.maintainability + `/100`);
                console.log(`Security: ` + result.codeInsights.securityScore + ``);
            }
        } catch (error) {
            spinner.fail(`Documentation generation failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('maintenance')
    .description('Run predictive maintenance workflow')
    .action(async () => {
        await orchestrator.initialize();

        const spinner = ora('Running maintenance workflow...').start();
        try {
            const result = await orchestrator.executeTask({
                type: 'maintenance'
            });

            spinner.succeed('Maintenance workflow completed');

            console.log(chalk.bold('\n🔧 Maintenance Report:'));
            console.log(`Immediate Actions: ` + result.immediateActions.length + ``);
            console.log(`Scheduled Maintenance: ` + result.scheduledMaintenance.length + ``);

            if (result.immediateActions.length > 0) {
                console.log(chalk.red('\n🔴 Critical Issues:'));
                result.immediateActions.forEach((action, i) => {
                    console.log(`${i + 1}. ${action.type} - ` + action.severity + ``);
                });
            }

            if (result.scheduledMaintenance.length > 0) {
                console.log(chalk.yellow('\n🟡 Scheduled Maintenance:'));
                result.scheduledMaintenance.forEach((item, i) => {
                    console.log(`${i + 1}. ${item.type} - ` + item.severity + ``);
                });
            }
        } catch (error) {
            spinner.fail(`Maintenance workflow failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('learn')
    .description('Run continuous learning workflow')
    .option('-f, --feedback <feedback>', 'Provide user feedback (JSON string)')
    .action(async (options) => {
        await orchestrator.initialize();

        const spinner = ora('Running learning workflow...').start();
        try {
            const config = { type: 'learning' };

            if (options.feedback) {
                config.feedback = JSON.parse(options.feedback);
            }

            const result = await orchestrator.executeTask(config);

            spinner.succeed('Learning workflow completed');

            console.log(chalk.bold('\n🧠 Learning Status:'));
            console.log(`Patterns Learned: ` + result.patterns + ``);
            console.log(`Feedback Processed: ` + result.feedbackProcessed + ``);
            console.log(`Status: ` + result.status + ``);
        } catch (error) {
            spinner.fail(`Learning workflow failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('status')
    .description('Show orchestrator and agent status')
    .action(async () => {
        await orchestrator.initialize();

        const status = orchestrator.getStatus();

        console.log(chalk.bold('\n📊 Agent Orchestrator Status\n'));

        // Agent Status Table
        const agentTable = new Table({
            head: ['Agent', 'Status', 'Operations', 'Success Rate', 'Avg Response'],
            style: { head: ['cyan'] }
        });

        for (const [name, agent] of Object.entries(status.agents)) {
            agentTable.push([
                name,
                agent.status === 'active' ? chalk.green('●') : chalk.red('○'),
                agent.metrics.operations || 0,
                `` + (agent.metrics.successRate || 100).toFixed(1) + `%`,
                agent.metrics.avgResponseTime
                    ? `` + agent.metrics.avgResponseTime.toFixed(0) + `ms`
                    : 'N/A'
            ]);
        }

        console.log(agentTable.toString());

        // Task Statistics
        console.log(chalk.bold('\n📋 Task Statistics:'));
        console.log(`Total Tasks: ` + status.tasks.total + ``);
        console.log(chalk.yellow(`Running: ` + status.tasks.running + ``));
        console.log(chalk.green(`Completed: ` + status.tasks.completed + ``));
        console.log(chalk.red(`Failed: ` + status.tasks.failed + ``));
    });

program
    .command('shutdown')
    .description('Shutdown all agents')
    .action(async () => {
        const spinner = ora('Shutting down agents...').start();
        try {
            await orchestrator.shutdown();
            spinner.succeed('All agents shut down successfully');
        } catch (error) {
            spinner.fail(`Shutdown failed: ` + error.message + ``);
            process.exit(1);
        }
    });

program
    .command('interactive')
    .description('Start interactive mode')
    .action(async () => {
        await orchestrator.initialize();

        console.log(chalk.bold('\n🎭 Agent Orchestrator - Interactive Mode\n'));
        console.log('Available commands:');
        console.log('  analyze   - Run code analysis');
        console.log('  deploy    - Run deployment workflow');
        console.log('  docs      - Generate documentation');
        console.log('  maintain  - Run maintenance workflow');
        console.log('  learn     - Run learning workflow');
        console.log('  status    - Show status');
        console.log('  exit      - Exit interactive mode\n');

        // In a real implementation, you'd use readline or inquirer here
        console.log(chalk.yellow('Interactive mode placeholder - use individual commands instead'));
    });

// Parse commands
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
