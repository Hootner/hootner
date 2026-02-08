#!/usr/bin/env node

/**
 * Publish HOOTNER Amazon Q Bridge to VS Code Marketplace
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION_PATH = path.join(__dirname, '..', '.vscode', 'extensions', 'hootner-bridge');

console.log('🦉 Publishing HOOTNER Amazon Q Bridge to VS Code Marketplace\n');

try {
    process.chdir(EXTENSION_PATH);
    
    console.log('📦 Installing vsce...');
    execSync('npm install -g @vscode/vsce', { stdio: 'inherit' });
    
    console.log('\n📦 Packaging extension...');
    execSync('vsce package', { stdio: 'inherit' });
    
    console.log('\n🚀 Publishing to marketplace...');
    console.log('Run: vsce publish');
    console.log('Or: vsce publish --pat YOUR_PERSONAL_ACCESS_TOKEN\n');
    
    console.log('✅ Package created! Find .vsix file in:', EXTENSION_PATH);
    console.log('\n📚 Next steps:');
    console.log('1. Get Personal Access Token: https://dev.azure.com');
    console.log('2. Run: vsce publish --pat YOUR_TOKEN');
    console.log('3. Extension will be live on VS Code Marketplace\n');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
