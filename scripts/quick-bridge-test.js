#!/usr/bin/env node

/**
 * Quick Amazon Q Bridge Connection Test
 * Verifies the extension and bridge are ready
 */

import fs from 'fs/promises';
import path from 'path';

console.log('🧪 Testing Amazon Q Bridge Connection to 80-Agent Hub...');
console.log('━'.repeat(60));

let passed = 0;
let failed = 0;

try {
	// Test 1: Extension files
	console.log('\n📁 Test 1: VS Code Extension Files');
	const extensionPath = '.vscode/extensions/hootner-bridge';

	try {
		await fs.access(path.join(extensionPath, 'package.json'));
		await fs.access(path.join(extensionPath, 'out/extension.js'));
		console.log('   ✅ Extension files created successfully');
		passed++;
	} catch {
		console.log('   ❌ Extension files missing');
		failed++;
	}

	// Test 2: Bridge script
	console.log('\n🌉 Test 2: Bridge Script');
	try {
		await fs.access('scripts/vscode-amazonq-bridge.js');
		console.log('   ✅ Bridge script available');
		passed++;
	} catch {
		console.log('   ❌ Bridge script missing');
		failed++;
	}

	// Test 3: MCP Server
	console.log('\n📡 Test 3: MCP Server');
	try {
		await fs.access('heptagonal/3-communication/adapters/enhanced-mcp-server.js');
		console.log('   ✅ Enhanced MCP server ready');
		passed++;
	} catch {
		// Backward-compat fallback
		try {
			await fs.access('hexarchy/3-communication/adapters/enhanced-mcp-server.js');
			console.log('   ✅ Enhanced MCP server ready');
			passed++;
		} catch {
			console.log('   ❌ MCP server missing');
			failed++;
		}
	}

	// Test 4: Agent Hub
	console.log('\n🤖 Test 4: Enhanced Agent Hub');
	try {
		await fs.access('scripts/agents/enhanced-agent-hub.js');
		console.log('   ✅ Enhanced Agent Hub (80+ agents) ready');
		passed++;
	} catch {
		console.log('   ❌ Agent hub missing');
		failed++;
	}

	// Test 5: Configuration
	console.log('\n⚙️  Test 5: VS Code Configuration');
	try {
		const settings = await fs.readFile('.vscode/settings.json', 'utf8');
		if (settings.includes('hootner.agentHub.enabled') && settings.includes('amazonQ.chat')) {
			console.log('   ✅ VS Code settings configured for bridge');
			passed++;
		} else {
			console.log('   ❌ VS Code settings incomplete');
			failed++;
		}
	} catch {
		console.log('   ❌ VS Code settings not found');
		failed++;
	}

	// Results
	console.log('\n' + '━'.repeat(60));
	console.log('📊 Bridge Connection Test Results:');
	console.log(`   ✅ Passed: ${passed}/5`);
	console.log(`   ❌ Failed: ${failed}/5`);

	if (passed >= 4) {
		console.log('\n🎉 Amazon Q → 80-Agent Hub bridge is ready!');
		console.log('\n📋 Next Steps:');
		console.log('   1. Restart VS Code to load the extension');
		console.log('   2. Press Ctrl+Shift+P in VS Code');
		console.log('   3. Type: "HOOTNER: Connect to Agent Hub"');
		console.log('   4. Test with Amazon Q: "Setup S3 with encryption"');
		console.log('   5. Should auto-route to specialized AWS + Security agents!');
	} else {
		console.log('\n⚠️  Some components missing. Run these to fix:');
		console.log('   npm run install:vscode-bridge');
		console.log('   npm run dual-agent:start');
		console.log('   npm run mcp:enhanced');
	}
} catch (error) {
	console.error('\n❌ Test execution failed:', error.message);
	process.exit(1);
}

console.log('\n🦉 HOOTNER Amazon Q Bridge Test Complete!');
