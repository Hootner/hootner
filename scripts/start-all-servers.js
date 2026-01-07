#!/usr/bin/env node

import { spawn } from 'childProcess';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Server configurations
const servers = [
  { name: 'Main Server',
    script: 'server.js',
    port: 3000,
    color: '\x1b[32m', // Green },
  { name: 'MCP Server',
    script: 'servers/mcp-server.js',
    port: 3001,
    color: '\x1b[34m', // Blue },
  { name: 'Collaboration Server',
    script: 'servers/collab-server.js',
    port: 3002,
    color: '\x1b[35m', // Magenta },
  { name: 'Electron Code Editor Server',
    script: 'servers/electron-code-editor-server.js',
    port: 3003,
    color: '\x1b[36m', // Cyan },
  { name: 'HTML Pages Server',
    script: 'servers/html-pages-server.js',
    port: 3004,
    color: '\x1b[33m', // Yellow },
  { name: 'Hub App Server',
    script: 'servers/hub-app.js',
    port: 3005,
    color: '\x1b[31m', // Red },
  { name: 'Secure Server',
    script: 'servers/secure-server.js',
    port: 3006,
    color: '\x1b[37m', // White },
  { name: 'Video Player Server',
    script: 'servers/video-player-server.js',
    port: 3007,
    color: '\x1b[90m', // Gray },
  { name: 'HOOTNER MCP Server',
    script: 'servers/hootner-mcp-server.js',
    port: 3008,
    color: '\x1b[92m', // Bright Green },
];

const processes = [];

// Graceful shutdown handler
const shutdown = () => { processes.forEach((proc) => { if (proc && !proc.killed) { proc.kill('SIGTERM'); } });

  // Force kill after 5 seconds
  setTimeout(() => { processes.forEach((proc) => { if (proc && !proc.killed) { proc.kill('SIGKILL'); } });
    process.exit(0); }, 5000); };

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

// Start servers
const startServers = async () => { for (let i = 0; i < servers.length; i++) { const server = servers[i];
    const scriptPath = path.join(rootDir, server.script);

    // Check if server file exists
    if (!fs.existsSync(scriptPath)) { processes[i] = null;
      continue; }

    const proc = spawn('node', [server.script], { cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env,
        PORT: server.port.toString(),
        NODE_ENV: process.env.NODE_ENV || 'development', }, });

    processes[i] = proc;

    // Handle stdout
    proc.stdout.on('data', (data) => { const output = data.toString().trim();
      if (output) { } });

    // Handle stderr
    proc.stderr.on('data', (data) => { const output = data.toString().trim();
      if (output) { console.error(`${server.color}[${server.name}]${reset} ${output}`); } });

    // Handle process exit
    proc.on('exit', (code, signal) => { if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGKILL') { console.error(`${server.color}[${server.name}]${reset} Exited with code ${code}`); } });

    proc.on('error', (err) => { console.error(`${server.color}[${server.name}]${reset} Error: ${err.message}`); });

    // Small delay between server starts
    await new Promise(resolve => setTimeout(resolve, 1000)); }

  // Display server status
    servers.forEach((server, idx) => { const status = processes[idx] ? '🟢 Running' : '🔴 Failed';
    ${reset}`); }); };

startServers().catch(console.error);
