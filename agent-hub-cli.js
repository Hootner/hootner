#!/usr/bin/env node

/**
 * Agent Hub CLI - Command-line interface for agent management
 * Provides quick access to agent control without the web interface
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { program } from 'commander';
import ora from 'ora';
import enhancedAgentHub from './enhanced-agent-hub.js';

class AgentHubCLI {
    constructor() {
        this.agentHub = enhancedAgentHub;
        this.setupCommands();
    }

    setupCommands() {
        program
            .name('agent-hub')
            .description('CLI tool for managing 75+ AI agents')
            .version('1.0.0');

        program
            .command('list')
            .description('List all agents organized by type')
            .option('-t, --type <type>', 'Filter by agent type')
            .option('-s, --status <status>', 'Filter by status (active/stopped)')
            .action((options) => this.listAgents(options));

        program
            .command('status')
            .description('Show overall agent hub status')
            .action(() => this.showStatus());

        program
            .command('start <agent>')
            .description('Start a specific agent')
            .action((agent) => this.startAgent(agent));

        program
            .command('stop <agent>')
            .description('Stop a specific agent')
            .action((agent) => this.stopAgent(agent));

        program
            .command('restart <agent>')
            .description('Restart a specific agent')
            .action((agent) => this.restartAgent(agent));

        program
            .command('bulk-start <type>')
            .description('Start all agents of a specific type')
            .action((type) => this.bulkStartAgents(type));

        program
            .command('bulk-stop <type>')
            .description('Stop all agents of a specific type')
            .action((type) => this.bulkStopAgents(type));

        program
            .command('info <agent>')
            .description('Show detailed information about an agent')
            .action((agent) => this.showAgentInfo(agent));

        program
            .command('health')
            .description('Perform health check on all agents')
            .action(() => this.healthCheck());

        program
            .command('interactive')
            .description('Launch interactive mode')
            .action(() => this.interactiveMode());

        program.parse(process.argv);
    }

    listAgents(options) {
        this.agentHub.initialize();
        const agents = this.agentHub.listAgents();

        console.log(chalk.bold.cyan('\n🤖 Agent Hub - Agent List\n'));

        Object.entries(agents).forEach(([type, agentList]) => {
            if (options.type && type !== options.type) return;

            console.log(chalk.bold.yellow(`\n📁 ${type.toUpperCase()} Agents (${agentList.length})`));

            const table = new Table({
                head: [
                    chalk.white('Agent Name'),
                    chalk.white('Status'),
                    chalk.white('Type')
                ],
                style: { head: [], border: [] }
            });

            agentList.forEach(agentName => {
                const agent = this.agentHub.agents.get(agentName);
                if (options.status && agent.status !== options.status) return;

                const statusIcon = agent.status === 'active' ? '✅' : '⏸️';
                const statusColor = agent.status === 'active' ? chalk.green : chalk.red;

                table.push([
                    chalk.cyan(agentName),
                    statusColor(`${statusIcon} ${agent.status}`),
                    chalk.gray(agent.type)
                ]);
            });

            console.log(table.toString());
        });

        console.log(chalk.bold.green(`\n✅ Total: ${this.agentHub.agents.size} agents\n`));
    }

    showStatus() {
        this.agentHub.initialize();
        const status = this.agentHub.getStatus();

        console.log(chalk.bold.cyan('\n📊 Agent Hub Status\n'));

        const table = new Table({
            head: [chalk.white('Metric'), chalk.white('Value')],
            style: { head: [], border: [] }
        });

        table.push(
            ['Total Agents', chalk.cyan(status.totalAgents)],
            ['Active Agents', chalk.green(status.activeAgents)],
            ['DMCA Requests', chalk.yellow(status.compliance.dmcaRequests)],
            ['Active Threats', chalk.red(status.security.activeThreats)],
            ['KPIs Tracked', chalk.blue(status.businessIntelligence.kpis)],
            ['Active Incidents', chalk.magenta(status.operations.incidents)]
        );

        console.log(table.toString());
        console.log('');
    }

    startAgent(agentName) {
        const spinner = ora(`Starting agent: ${agentName}`).start();

        this.agentHub.initialize();
        const agent = this.agentHub.agents.get(agentName);

        if (!agent) {
            spinner.fail(chalk.red(`Agent "${agentName}" not found`));
            return;
        }

        agent.status = 'active';
        agent.startTime = Date.now();

        setTimeout(() => {
            spinner.succeed(chalk.green(`Agent "${agentName}" started successfully`));
        }, 500);
    }

    stopAgent(agentName) {
        const spinner = ora(`Stopping agent: ${agentName}`).start();

        this.agentHub.initialize();
        const agent = this.agentHub.agents.get(agentName);

        if (!agent) {
            spinner.fail(chalk.red(`Agent "${agentName}" not found`));
            return;
        }

        agent.status = 'stopped';
        agent.stopTime = Date.now();

        setTimeout(() => {
            spinner.succeed(chalk.green(`Agent "${agentName}" stopped successfully`));
        }, 500);
    }

    restartAgent(agentName) {
        const spinner = ora(`Restarting agent: ${agentName}`).start();

        this.agentHub.initialize();
        const agent = this.agentHub.agents.get(agentName);

        if (!agent) {
            spinner.fail(chalk.red(`Agent "${agentName}" not found`));
            return;
        }

        agent.status = 'stopped';
        setTimeout(() => {
            agent.status = 'active';
            agent.startTime = Date.now();
            spinner.succeed(chalk.green(`Agent "${agentName}" restarted successfully`));
        }, 1000);
    }

    bulkStartAgents(type) {
        this.agentHub.initialize();
        const spinner = ora(`Starting all ${type} agents`).start();

        let count = 0;
        this.agentHub.agents.forEach((agent) => {
            if (agent.type === type && agent.status !== 'active') {
                agent.status = 'active';
                agent.startTime = Date.now();
                count++;
            }
        });

        setTimeout(() => {
            spinner.succeed(chalk.green(`Started ${count} ${type} agents`));
        }, 500);
    }

    bulkStopAgents(type) {
        this.agentHub.initialize();
        const spinner = ora(`Stopping all ${type} agents`).start();

        let count = 0;
        this.agentHub.agents.forEach((agent) => {
            if (agent.type === type && agent.status === 'active') {
                agent.status = 'stopped';
                agent.stopTime = Date.now();
                count++;
            }
        });

        setTimeout(() => {
            spinner.succeed(chalk.green(`Stopped ${count} ${type} agents`));
        }, 500);
    }

    showAgentInfo(agentName) {
        this.agentHub.initialize();
        const agent = this.agentHub.agents.get(agentName);

        if (!agent) {
            console.log(chalk.red(`\n❌ Agent "${agentName}" not found\n`));
            return;
        }

        console.log(chalk.bold.cyan(`\n📋 Agent Information: ${agentName}\n`));

        const table = new Table({
            head: [chalk.white('Property'), chalk.white('Value')],
            style: { head: [], border: [] }
        });

        table.push(
            ['Name', chalk.cyan(agentName)],
            ['Type', chalk.yellow(agent.type)],
            ['Status', agent.status === 'active' ? chalk.green('✅ Active') : chalk.red('⏸️ Stopped')],
            ['Start Time', agent.startTime ? new Date(agent.startTime).toLocaleString() : 'N/A'],
            ['Requests', agent.requestCount || 0],
            ['Errors', agent.errorCount || 0]
        );

        console.log(table.toString());
        console.log('');
    }

    healthCheck() {
        this.agentHub.initialize();
        const spinner = ora('Performing health check...').start();

        setTimeout(() => {
            let healthy = 0;
            let unhealthy = 0;

            this.agentHub.agents.forEach(agent => {
                if (agent.status === 'active') healthy++;
                else unhealthy++;
            });

            spinner.succeed(chalk.green('Health check completed'));

            console.log(chalk.bold.cyan('\n🏥 Health Check Results\n'));

            const table = new Table({
                head: [chalk.white('Status'), chalk.white('Count'), chalk.white('Percentage')],
                style: { head: [], border: [] }
            });

            const total = healthy + unhealthy;
            table.push(
                [chalk.green('✅ Healthy'), healthy, `${((healthy / total) * 100).toFixed(1)}%`],
                [chalk.red('❌ Unhealthy'), unhealthy, `${((unhealthy / total) * 100).toFixed(1)}%`]
            );

            console.log(table.toString());
            console.log('');

            if (unhealthy > 0) {
                console.log(chalk.yellow(`⚠️  Warning: ${unhealthy} agents are not active\n`));
            } else {
                console.log(chalk.green('✅ All agents are healthy\n'));
            }
        }, 1000);
    }

    async interactiveMode() {
        const { default: inquirer } = await import('inquirer');

        this.agentHub.initialize();

        const mainMenu = async () => {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: '🤖 Agent Hub Manager - What would you like to do?',
                    choices: [
                        { name: '📋 List all agents', value: 'list' },
                        { name: '📊 Show status', value: 'status' },
                        { name: '▶️  Start an agent', value: 'start' },
                        { name: '⏸️  Stop an agent', value: 'stop' },
                        { name: '↻  Restart an agent', value: 'restart' },
                        { name: '🚀 Bulk start agents', value: 'bulk-start' },
                        { name: '🛑 Bulk stop agents', value: 'bulk-stop' },
                        { name: '🏥 Health check', value: 'health' },
                        { name: '❌ Exit', value: 'exit' }
                    ]
                }
            ]);

            switch (action) {
                case 'list': {
                    this.listAgents({});
                    break;
                }
                case 'status': {
                    this.showStatus();
                    break;
                }
                case 'start': {
                    const { startAgent } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'startAgent',
                            message: 'Enter agent name to start:'
                        }
                    ]);
                    this.startAgent(startAgent);
                    break;
                }
                case 'stop': {
                    const { stopAgent } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'stopAgent',
                            message: 'Enter agent name to stop:'
                        }
                    ]);
                    this.stopAgent(stopAgent);
                    break;
                }
                case 'restart': {
                    const { restartAgent } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'restartAgent',
                            message: 'Enter agent name to restart:'
                        }
                    ]);
                    this.restartAgent(restartAgent);
                    break;
                }
                case 'bulk-start': {
                    const { bulkStartType } = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'bulkStartType',
                            message: 'Select agent type to start:',
                            choices: ['core', 'business', 'security', 'infrastructure', 'service']
                        }
                    ]);
                    this.bulkStartAgents(bulkStartType);
                    break;
                }
                case 'bulk-stop': {
                    const { bulkStopType } = await inquirer.prompt([
                        {
                            type: 'list',
                            name: 'bulkStopType',
                            message: 'Select agent type to stop:',
                            choices: ['core', 'business', 'security', 'infrastructure', 'service']
                        }
                    ]);
                    this.bulkStopAgents(bulkStopType);
                    break;
                }
                case 'health': {
                    this.healthCheck();
                    break;
                }
                case 'exit': {
                    console.log(chalk.green('\n✅ Goodbye!\n'));
                    process.exit(0);
                }
            }

            if (action !== 'exit') {
                setTimeout(() => mainMenu(), 1000);
            }
        };

        console.log(chalk.bold.cyan('\n🤖 Welcome to Agent Hub Interactive Mode\n'));
        mainMenu();
    }
}

// Run CLI
new AgentHubCLI();
