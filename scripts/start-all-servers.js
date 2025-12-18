#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Server configurations
const servers = [
  {
    name: 'Main Server',
    script: 'server.js',
    port: 3000,
    color: '\x1b[32m', // Green
  },
  {
    name: 'MCP Server',
    script: 'servers/mcp-server.js',
    port: 3001,
    color: '\x1b[34m', // Blue
  },
  {
    name: 'Collaboration Server',
    script: 'servers/collab-server.js',
    port: 3002,
    color: '\x1b[35m', // Magenta
  },
  {
    name: 'Electron Code Editor Server',
    script: 'servers/electron-code-editor-server.js',
    port: 3003,
    color: '\x1b[36m', // Cyan
  },
  {
    name: 'HTML Pages Server',
    script: 'servers/html-pages-server.js',
    port: 3004,
    color: '\x1b[33m', // Yellow
  },
  {
    name: 'Hub App Server',
    script: 'servers/hub-app.js',
    port: 3005,
    color: '\x1b[31m', // Red
  },
  {
    name: 'Secure Server',
    script: 'servers/secure-server.js',
    port: 3006,
    color: '\x1b[37m', // White
  },
  {
    name: 'Video Player Server',
    script: 'servers/video-player-server.js',
    port: 3007,
    color: '\x1b[90m', // Gray
  },
  {
    name: 'HOOTNER MCP Server',
    script: 'servers/hootner-mcp-server.js',
    port: 3008,
    color: '\x1b[92m', // Bright Green
  },
];

const processes = [];
const reset = '\x1b[0m';

// Graceful shutdown handler
const shutdown = () => {
  console.log('\n🛑 Shutting down all servers...');

  processes.forEach((proc, index) => {
    if (proc && !proc.killed) {
      console.log(`${servers[index].color}⏹️  Stopping ${servers[index].name}${reset}`);
      proc.kill('SIGTERM');
    }
  });

  // Force kill after 5 seconds
  setTimeout(() => {
    processes.forEach((proc, index) => {
      if (proc && !proc.killed) {
        console.log(`${servers[index].color}💀 Force killing ${servers[index].name}${reset}`);
        proc.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

// Start servers
const startServers = async () => {
  console.log('🚀 Starting HOOTNER servers...\n');

  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    const scriptPath = path.join(rootDir, server.script);

    // Check if server file exists
    if (!fs.existsSync(scriptPath)) {
      console.log(`${server.color}⚠️  ${server.name} script not found: ${server.script}${reset}`);
      processes[i] = null;
      continue;
    }

    console.log(`${server.color}🔄 Starting ${server.name} on port ${server.port}...${reset}`);

    const proc = spawn('node', [server.script], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: server.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
    });

    processes[i] = proc;

    // Handle stdout
    proc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`${server.color}[${server.name}]${reset} ${output}`);
      }
    });

    // Handle stderr
    proc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`${server.color}[${server.name} ERROR]${reset} ${output}`);
      }
    });

    // Handle process exit
    proc.on('exit', (code, signal) => {
      if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') {
        console.log(`${server.color}💥 ${server.name} exited with code ${code}${reset}`);
      } else {
        console.log(`${server.color}✅ ${server.name} stopped${reset}`);
      }
    });

    proc.on('error', (error) => {
      console.log(`${server.color}❌ Failed to start ${server.name}: ${error.message}${reset}`);
    });

    // Small delay between server starts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 All servers started! Press Ctrl+C to stop all servers.\n');

  // Display server status
  console.log('📊 Server Status:');
  servers.forEach((server, index) => {
    const status = processes[index] ? '🟢 Running' : '🔴 Failed';
    console.log(`${server.color}  ${server.name}: ${status} - http://localhost:${server.port}${reset}`);
  });
  console.log('');
};

startServers().catch(console.error);
