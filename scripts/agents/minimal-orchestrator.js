#!/usr/bin/env node
import chalk from 'chalk';
import { execSync } from 'child_process';

class MinimalAgentOrchestrator {
  constructor() {
    this.config = {
      security: { enabled: true, command: 'node copilot-delegate.js security' },
      analyze: { enabled: true, command: 'node copilot-delegate.js analyze' },
      validate: { enabled: true, command: 'node copilot-delegate.js validate' }
    };
  }

  run(agent, ...args) {
    if (!this.config[agent]?.enabled) {
      console.log(chalk.red(`❌ Agent ${agent} disabled`));
      return;
    }

    console.log(chalk.blue(`🤖 Running ${agent} agent...`));
    try {
      const cmd = `${this.config[agent].command} ${args.join(' ')}`;
      execSync(cmd, { stdio: 'inherit' });
      console.log(chalk.green(`✅ ${agent} completed`));
    } catch (error) {
      console.log(chalk.red(`❌ ${agent} failed`));
    }
  }

  enable(agent) {
    if (this.config[agent]) {
      this.config[agent].enabled = true;
      console.log(chalk.green(`✅ ${agent} enabled`));
    }
  }

  disable(agent) {
    if (this.config[agent]) {
      this.config[agent].enabled = false;
      console.log(chalk.yellow(`⏸️  ${agent} disabled`));
    }
  }

  status() {
    console.log(chalk.blue('🎛️  Agent Status:'));
    Object.entries(this.config).forEach(([name, config]) => {
      const status = config.enabled ? '🟢' : '🔴';
      console.log(`  ${status} ${name}`);
    });
  }
}

const orchestrator = new MinimalAgentOrchestrator();
const [,, command, ...args] = process.argv;

switch (command) {
  case 'run': orchestrator.run(...args); break;
  case 'enable': orchestrator.enable(args[0]); break;
  case 'disable': orchestrator.disable(args[0]); break;
  case 'status': orchestrator.status(); break;
  default:
    console.log(chalk.yellow('Minimal Agent Orchestrator'));
    console.log('Commands:');
    console.log('  run <agent> [args]  - Run specific agent');
    console.log('  enable <agent>      - Enable agent');
    console.log('  disable <agent>     - Disable agent');
    console.log('  status              - Show agent status');
    console.log('\\nAgents: security, analyze, validate');
}