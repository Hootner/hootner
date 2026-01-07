#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', '.amazonq', 'agents', 'q-agents-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const args = process.argv.slice(2);
const command = args[0];

function showTemplates(category) {
  const templatePath = path.join(__dirname, '..', '.amazonq', 'agents', category);
  if (!fs.existsSync(templatePath)) {
    console.log(`No templates found for ${category}`);
    return;
  }
  
  const indexFile = path.join(templatePath, 'index.json');
  if (fs.existsSync(indexFile)) {
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    console.log(`\n${index.category} Templates:\n`);
    index.projects.forEach((proj, i) => {
      console.log(`${i + 1}. ${proj.name} (${proj.language})`);
      console.log(`   File: ${proj.file}`);
      console.log(`   Lines: ${proj.lines}`);
      console.log(`   Features: ${proj.features.join(', ')}`);
      console.log(`   Agent: @${proj.agent}\n`);
    });
  }
}

function createAgent(agentName) {
  const agent = config.agents.find(a => a.name === agentName);
  if (!agent) {
    console.error(`Agent ${agentName} not found`);
    process.exit(1);
  }

  const agentConfig = JSON.stringify({
    name: agent.name,
    description: agent.description,
    model: agent.model,
    tools: agent.tools,
    promptTemplate: agent.promptTemplate
  });

  try {
    execSync(`aws q create-agent --name ${agent.name} --configuration '${agentConfig}'`, {
      stdio: 'inherit'
    });
    console.log(`✓ Created agent: ${agent.name}`);
  } catch (error) {
    console.error(`✗ Failed to create ${agent.name}`);
  }
}

function createAllAgents() {
  console.log('Creating all 11 Amazon Q agents...\n');
  config.agents.forEach(agent => createAgent(agent.name));
  console.log('\n✓ All agents created');
}

function listAgents() {
  console.log('Available Amazon Q Agents:\n');
  config.agents.forEach((agent, i) => {
    console.log(`${i + 1}. ${agent.name}`);
    console.log(`   ${agent.description}\n`);
  });
}

function invokeAgent(agentName, project, language = 'C++') {
  const agent = config.agents.find(a => a.name === agentName);
  if (!agent) {
    console.error(`Agent ${agentName} not found`);
    process.exit(1);
  }

  const prompt = agent.promptTemplate
    .replace('{project}', project)
    .replace('{language}', language);

  console.log(`Invoking @${agentName} for: ${project}\n`);
  console.log(`Prompt: ${prompt}\n`);
  console.log('Use this in VS Code Q Chat:');
  console.log(`@${agentName} ${prompt}`);
}

switch (command) {
  case 'create':
    if (args[1] === 'all') {
      createAllAgents();
    } else if (args[1]) {
      createAgent(args[1]);
    } else {
      console.log('Usage: node q-agents.js create <agent-name|all>');
    }
    break;

  case 'list':
    listAgents();
    break;

  case 'invoke':
    if (args[1] && args[2]) {
      invokeAgent(args[1], args[2], args[3]);
    } else {
      console.log('Usage: node q-agents.js invoke <agent-name> <project> [language]');
    }
    break;

  case 'parallel':
    console.log('Parallel execution agents:');
    config.scaling.parallel.forEach(name => console.log(`  - ${name}`));
    console.log(`\nMax concurrent: ${config.scaling.maxConcurrent}`);
    break;

  case 'chain':
    console.log('Agent chaining dependencies:');
    config.scaling.chaining.forEach(chain => {
      console.log(`  ${chain.from} → ${chain.to}`);
    });
    break;

  case 'templates':
    if (args[1]) {
      showTemplates(args[1]);
    } else {
      console.log('Available template categories:');
      console.log('  - foundational-builds');
      console.log('  - language-compilation-builds');
      console.log('  - os-kernel-builds');
      console.log('  - virtualization-runtime-builds');
      console.log('  - networking-communication-builds');
      console.log('  - data-storage-builds');
      console.log('  - web-app-server-builds');
      console.log('  - browser-ui-builds');
      console.log('  - games-graphics-media-builds');
      console.log('  - dev-tools-workflow-builds');
      console.log('  - advanced-specialized-builds');
      console.log('\nUsage: node q-agents.js templates <category>');
    }
    break;

  default:
    console.log(`
Amazon Q Agents CLI

Usage:
  node q-agents.js create <agent-name|all>  - Create agent(s) via AWS CLI
  node q-agents.js list                     - List all agents
  node q-agents.js invoke <agent> <project> - Generate invoke prompt
  node q-agents.js parallel                 - Show parallel agents
  node q-agents.js chain                    - Show chaining dependencies
  node q-agents.js templates <category>     - View code templates

Examples:
  node q-agents.js create all
  node q-agents.js invoke FoundationalQ "CPU emulator" C++
  node q-agents.js templates foundational-builds
    `);
}
