#!/usr/bin/env node

import { execSync } from 'child_process';
import os from 'os';

console.log('Setting up PM2 for HOOTNER MCP Server...\n');

try {
  // Check if PM2 is installed
  try {
    execSync('pm2 -v', { stdio: 'ignore' });
    console.log('✓ PM2 already installed');
  } catch {
    console.log('Installing PM2 globally...');
    execSync('npm install -g pm2', { stdio: 'inherit' });
    console.log('✓ PM2 installed');
  }

  // Start MCP server
  console.log('\nStarting HOOTNER MCP server...');
  execSync('pm2 start servers/hootner-mcp-server.js --name hootner-mcp', { stdio: 'inherit' });

  // Save PM2 configuration
  console.log('\nSaving PM2 configuration...');
  execSync('pm2 save', { stdio: 'inherit' });

  // Setup startup script (platform-specific)
  const platform = os.platform();
  if (platform === 'win32') {
    console.log('\nSetting up Windows auto-startup...');
    try {
      execSync('npm install -g pm2-windows-startup', { stdio: 'inherit' });
      execSync('pm2-startup install', { stdio: 'inherit' });
      console.log('✓ Windows startup configured');
    } catch (error) {
      console.log('⚠ Windows startup failed. Manual setup required:');
      console.log('  1. npm install -g pm2-windows-startup');
      console.log('  2. pm2-startup install');
    }
  } else {
    console.log('\nSetting up auto-startup...');
    execSync('pm2 startup', { stdio: 'inherit' });
  }

  console.log('\n✓ Setup complete!\n');
  console.log('Commands:');
  console.log('  pm2 status          - View all processes');
  console.log('  pm2 logs hootner-mcp - View logs');
  console.log('  pm2 restart hootner-mcp - Restart server');
  console.log('  pm2 stop hootner-mcp - Stop server');
  console.log('  pm2 monit           - Monitor in real-time');

} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}
