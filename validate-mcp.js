/**
 * Simple MCP Server Validation
 * Quick check of MCP server configuration and tools
 */

import fs from 'fs/promises';

console.log('🔍 MCP Server Configuration Test\n');
console.log('='.repeat(50) + '\n');

// Test 1: Check server file
console.log('1️⃣ Server File Check:');
try {
  const serverPath = './servers/hootner-mcp-server.js';
  await fs.access(serverPath);
  const stats = await fs.stat(serverPath);
  console.log(`   ✅ File exists: ${serverPath}`);
  console.log(`   📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   📅 Modified: ${stats.mtime.toLocaleString()}\n`);
} catch (error) {
  console.log(`   ❌ Server file not accessible: ${error.message}\n`);
}

// Test 2: Check VS Code settings
console.log('2️⃣ VS Code MCP Configuration:');
try {
  const settingsPath = './.vscode/settings.json';
  const settingsContent = await fs.readFile(settingsPath, 'utf-8');
  const settings = JSON.parse(settingsContent);

  if (settings['amazonQ.mcp.servers']) {
    const mcpServers = settings['amazonQ.mcp.servers'];
    console.log(`   ✅ Amazon Q MCP configured`);
    console.log(`   📋 Registered servers: ${Object.keys(mcpServers).length}`);

    for (const [name, config] of Object.entries(mcpServers)) {
      console.log(`\n   📦 Server: ${name}`);
      console.log(`      Transport: ${config.transport}`);
      console.log(`      Command: ${config.command} ${config.args?.join(' ') || ''}`);
    }

    if (settings['amazonQ.mcp.toolPermissions']) {
      console.log(`\n   🔐 Tool permissions configured`);
      const permissions = settings['amazonQ.mcp.toolPermissions'];
      for (const [server, perms] of Object.entries(permissions)) {
        console.log(`      ${server}: ${Object.keys(perms).length} tools`);
      }
    }
  } else {
    console.log(`   ⚠️ No Amazon Q MCP configuration found`);
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Settings check failed: ${error.message}\n`);
}

// Test 3: Check agent configuration
console.log('3️⃣ Agent Configuration:');
try {
  const agentConfigPath = './.amazonq/agents/q-agents-config.json';
  const agentContent = await fs.readFile(agentConfigPath, 'utf-8');
  const agentConfig = JSON.parse(agentContent);

  if (agentConfig.agents) {
    console.log(`   ✅ Agents configured: ${agentConfig.agents.length}`);
    console.log(`   🤖 Agent names:`);
    agentConfig.agents.forEach(agent => {
      console.log(`      - ${agent.name} (${agent.model})`);
    });

    if (agentConfig.scaling) {
      console.log(`\n   ⚙️ Scaling: Max ${agentConfig.scaling.maxConcurrent} concurrent`);
    }
  }
  console.log('');
} catch (error) {
  console.log(`   ⚠️ Agent config not found: ${error.message}\n`);
}

// Test 4: Check package dependencies
console.log('4️⃣ MCP Dependencies:');
try {
  const packagePath = './package.json';
  const packageContent = await fs.readFile(packagePath, 'utf-8');
  const pkg = JSON.parse(packageContent);

  const mcpDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(
    dep => dep.includes('mcp') || dep.includes('model-context-protocol')
  );

  if (mcpDeps.length > 0) {
    console.log(`   ✅ MCP dependencies installed:`);
    mcpDeps.forEach(dep => {
      const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
      console.log(`      - ${dep}@${version}`);
    });
  } else {
    console.log(`   ⚠️ No MCP dependencies found`);
  }
  console.log('');
} catch (error) {
  console.log(`   ❌ Package check failed: ${error.message}\n`);
}

// Test 5: Environment variables
console.log('5️⃣ Environment Configuration:');
console.log(`   HOOTNER_ENV: ${process.env.HOOTNER_ENV || 'not set'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   AWS_PROFILE: ${process.env.AWS_PROFILE || 'not set'}`);
console.log('');

// Summary
console.log('='.repeat(50));
console.log('✨ Configuration Check Complete\n');
console.log('To use Amazon Q with MCP:');
console.log('1. Ensure VS Code is reloaded after configuration changes');
console.log('2. Open Amazon Q chat and use @ to invoke MCP tools');
console.log('3. The hootner-deployment server provides custom tools');
console.log('4. The aws-cdk server provides AWS infrastructure tools\n');
