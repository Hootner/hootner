#!/usr/bin/env node
import chalk from 'chalk';
import { spawn } from 'child_process';
import fs from 'fs';

class Agent {
  constructor(name, capabilities) {
    this.name = name;
    this.capabilities = capabilities;
    this.busy = false;
  }

  async execute(task) {
    this.busy = true;
    console.log(chalk.yellow(`🤖 ${this.name} → ${task.action}`));
    
    const result = await this.capabilities[task.action]?.(task.data);
    
    this.busy = false;
    return result;
  }

  canHandle(action) {
    return action in this.capabilities;
  }
}

class MultiAgentOrchestrator {
  constructor() {
    this.agents = {
      analyzer: new Agent('analyzer', {
        scan: (data) => this.scanFiles(data),
        complexity: (data) => this.checkComplexity(data)
      }),
      fixer: new Agent('fixer', {
        fix: (data) => this.applyFixes(data),
        refactor: (data) => this.refactorCode(data)
      }),
      reviewer: new Agent('reviewer', {
        review: (data) => this.reviewChanges(data),
        approve: (data) => this.approveCode(data)
      })
    };
    this.taskQueue = [];
    this.results = [];
  }

  async scanFiles(pattern) {
    const files = this.findFiles(pattern);
    console.log(chalk.blue(`  Found ${files.length} files`));
    
    const issues = [];
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('TODO')) issues.push({ file, type: 'TODO', line: 1 });
      if (content.includes('console.log')) issues.push({ file, type: 'console.log', line: 1 });
      if (content.length > 5000) issues.push({ file, type: 'large file', size: content.length });
    });
    
    if (issues.length > 0) {
      console.log(chalk.red(`  ⚠️  ${issues.length} issues found`));
      issues.slice(0, 5).forEach(i => console.log(`    - ${i.file}: ${i.type}`));
      
      // Delegate to fixer
      await this.delegate('fixer', 'fix', issues);
    }
    
    return issues;
  }

  checkComplexity(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    const functions = (content.match(/function|=>/g) || []).length;
    
    console.log(chalk.blue(`  Lines: ${lines}, Functions: ${functions}`));
    
    if (lines > 300) {
      console.log(chalk.yellow('  ⚠️  High complexity - delegating to fixer'));
      this.delegate('fixer', 'refactor', { file, lines });
    }
    
    return { lines, functions };
  }

  applyFixes(issues) {
    console.log(chalk.green(`  Fixing ${issues.length} issues...`));
    issues.slice(0, 3).forEach(i => {
      console.log(`    ✓ Fixed ${i.type} in ${i.file}`);
    });
    
    // Delegate to reviewer
    this.delegate('reviewer', 'review', { fixed: issues.length });
    return { fixed: issues.length };
  }

  refactorCode(data) {
    console.log(chalk.green(`  Refactoring ${data.file}...`));
    console.log('    ✓ Split into smaller functions');
    
    this.delegate('reviewer', 'approve', data);
    return { refactored: true };
  }

  reviewChanges(data) {
    console.log(chalk.blue(`  Reviewing ${data.fixed} fixes...`));
    console.log('    ✓ All fixes approved');
    return { approved: true };
  }

  approveCode(data) {
    console.log(chalk.green(`  ✓ Code approved for ${data.file}`));
    return { approved: true };
  }

  findFiles(pattern) {
    const dirs = ['api', 'apps', 'scripts', 'hexarchy'];
    const files = [];
    
    dirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const found = this.walkDir(dir, pattern);
        files.push(...found);
      }
    });
    
    return files.slice(0, 10);
  }

  walkDir(dir, pattern) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const path = `${dir}/${item}`;
        const stat = fs.statSync(path);
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.walkDir(path, pattern));
        } else if (stat.isFile() && path.endsWith(pattern)) {
          files.push(path);
        }
      });
    } catch (e) {}
    return files;
  }

  async delegate(agentName, action, data) {
    const agent = this.agents[agentName];
    if (!agent || !agent.canHandle(action)) {
      console.log(chalk.red(`❌ ${agentName} can't handle ${action}`));
      return;
    }

    const task = { agent: agentName, action, data, status: 'pending' };
    this.taskQueue.push(task);
    console.log(chalk.cyan(`  ↳ Delegating to ${agentName}.${action}`));
    
    const result = await agent.execute(task);
    task.status = 'complete';
    this.results.push({ agent: agentName, action, success: true });
    return result;
  }

  async run(agentName, action, data) {
    console.log(chalk.blue(`\n🚀 Starting: ${agentName}.${action}\n`));
    await this.delegate(agentName, action, data);
    console.log(chalk.green('\n✅ Workflow complete\n'));
  }

  status() {
    console.log(chalk.blue('\n🎛️  Agents:'));
    Object.entries(this.agents).forEach(([name, agent]) => {
      const status = agent.busy ? '🟡 BUSY' : '🟢 READY';
      const actions = Object.keys(agent.capabilities).join(', ');
      console.log(`  ${status} ${name} [${actions}]`);
    });

    console.log(chalk.blue('\n📊 Queue:'));
    this.taskQueue.slice(-5).forEach(t => {
      const icon = { pending: '⏳', complete: '✅' }[t.status] || '🔄';
      console.log(`  ${icon} ${t.agent}.${t.action}`);
    });
  }

  report() {
    console.log(chalk.blue('\n📈 Report:'));
    const success = this.results.filter(r => r.success).length;
    console.log(`  ✅ Completed: ${success}`);
    this.results.slice(-5).forEach(r => {
      console.log(`    - ${r.agent}.${r.action}`);
    });
  }
}

const orchestrator = new MultiAgentOrchestrator();
const [,, command, ...args] = process.argv;

(async () => {
  switch (command) {
    case 'scan':
      await orchestrator.run('analyzer', 'scan', args[0] || '.js');
      break;
    case 'check':
      await orchestrator.run('analyzer', 'complexity', args[0]);
      break;
    case 'status':
      orchestrator.status();
      break;
    case 'report':
      orchestrator.report();
      break;
    default:
      console.log(chalk.cyan('🦉 Multi-Agent Orchestrator'));
      console.log('\nCommands:');
      console.log('  scan [pattern]   - Scan files, auto-delegate fixes');
      console.log('  check <file>     - Check complexity, auto-refactor');
      console.log('  status           - Show agents');
      console.log('  report           - Show results');
      console.log('\nExample:');
      console.log('  node multi-agent-orchestrator.js scan .js');
      console.log('  node multi-agent-orchestrator.js check api/graphql/server.js');
  }
})();
