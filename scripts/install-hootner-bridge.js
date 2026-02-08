#!/usr/bin/env node

/**
 * HOOTNER Amazon Q Bridge - Installation & Testing Script
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSION_PATH = path.join(__dirname, '..', '.vscode', 'extensions', 'hootner-bridge');

console.log('🦉 HOOTNER Amazon Q Agent Bridge - Setup\n');

// Check extension exists
if (!fs.existsSync(EXTENSION_PATH)) {
    console.error('❌ Extension not found at:', EXTENSION_PATH);
    process.exit(1);
}

console.log('✅ Extension found');
console.log('📁 Path:', EXTENSION_PATH);

// Check required files
const requiredFiles = ['package.json', 'extension.js', 'README.md', 'LICENSE'];
const missing = requiredFiles.filter(f => !fs.existsSync(path.join(EXTENSION_PATH, f)));

if (missing.length > 0) {
    console.error('❌ Missing files:', missing.join(', '));
    process.exit(1);
}

console.log('✅ All required files present\n');

// Check MCP server
const mcpServerPath = path.join(__dirname, '..', 'heptagonal', '3-communication', 'adapters', 'enhanced-mcp-server.js');
if (!fs.existsSync(mcpServerPath)) {
    console.error('❌ MCP server not found at:', mcpServerPath);
    process.exit(1);
}

console.log('✅ MCP server found');
console.log('📁 Path:', mcpServerPath);

// Check agent hub
const agentHubPath = path.join(__dirname, 'agents', 'enhanced-agent-hub.js');
if (!fs.existsSync(agentHubPath)) {
    console.error('❌ Agent hub not found at:', agentHubPath);
    process.exit(1);
}

console.log('✅ Agent hub found\n');

// Test MCP connection
console.log('🧪 Testing MCP connection...');
try {
    const testResult = execSync('node scripts/test-mcp-simple.js', { 
        encoding: 'utf8',
        timeout: 10000 
    });
    console.log('✅ MCP connection test passed\n');
} catch (error) {
    console.warn('⚠️ MCP test failed (may be normal if server not running)\n');
}

// Installation instructions
console.log('📦 Installation Complete!\n');
console.log('🚀 Next Steps:\n');
console.log('1. Open VS Code');
console.log('2. Press Ctrl+Shift+P');
console.log('3. Run: "HOOTNER: Connect to Agent Hub"');
console.log('4. Start using Amazon Q with 80+ specialized agents!\n');

console.log('📚 Documentation:');
console.log('   README: .vscode/extensions/hootner-bridge/README.md');
console.log('   Pricing: https://hootner.com/pricing\n');

console.log('💡 Commands:');
console.log('   - HOOTNER: Connect to Agent Hub');
console.log('   - HOOTNER: List Available Agents');
console.log('   - HOOTNER: Route Query to Agent');
console.log('   - HOOTNER: Show Agent Statistics\n');

console.log('🦉 The Owl Never Sleeps - 24/7 AI Intelligence Ready!\n');
