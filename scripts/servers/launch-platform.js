#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🦉 HOOTNER Enterprise Platform Launcher');
console.log('=====================================');

const services = [
  {
    name: 'Enhanced Dashboard Server',
    command: 'node',
    args: ['serve-html-enhanced.js'],
    port: 3005,
    color: '\x1b[32m' // Green
  },
  {
    name: 'GraphQL API Server',
    command: 'node',
    args: ['api/graphql/server.js'],
    port: 4000,
    color: '\x1b[34m' // Blue
  },
  {
    name: 'AI Video Generation API',
    command: 'python',
    args: ['services/video-generation/api_enhanced.py'],
    port: 5003,
    color: '\x1b[35m' // Magenta
  }
];

const processes = [];

function startService(service) {
  return new Promise((resolve) => {
    console.log(`${service.color}🚀 Starting ${service.name}...`);
    
    const proc = spawn(service.command, service.args, {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    proc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`${service.color}[${service.name}] ${output}\x1b[0m`);
      }
    });
    
    proc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('Warning')) {
        console.log(`${service.color}[${service.name}] ${output}\x1b[0m`);
      }
    });
    
    proc.on('close', (code) => {
      console.log(`\x1b[31m❌ ${service.name} exited with code ${code}\x1b[0m`);
    });
    
    processes.push({ name: service.name, process: proc });
    
    // Give service time to start
    setTimeout(() => {
      console.log(`${service.color}✅ ${service.name} started on port ${service.port}\x1b[0m`);
      resolve();
    }, 2000);
  });
}

async function startAllServices() {
  console.log('\n🔄 Starting all HOOTNER services...\n');
  
  for (const service of services) {
    await startService(service);
  }
  
  console.log('\n🎉 All HOOTNER services are running!');
  console.log('=====================================');
  console.log('📊 Enhanced Dashboard: http://localhost:3005');
  console.log('🧠 Advanced Analytics: http://localhost:3005/analytics');
  console.log('🎬 AI Video Generator: http://localhost:3005/ai-video');
  console.log('📡 Live Streaming: http://localhost:3005/live-stream');
  console.log('🛒 Marketplace: http://localhost:3005/marketplace');
  console.log('💻 Code Editor: http://localhost:3005/code-editor');
  console.log('⚙️ Settings: http://localhost:3005/settings');
  console.log('🔷 GraphQL Playground: http://localhost:4000/graphql');
  console.log('🤖 AI Video API: http://localhost:5003');
  console.log('=====================================');
  console.log('\n💡 Press Ctrl+C to stop all services\n');
}

function gracefulShutdown() {
  console.log('\n🛑 Shutting down HOOTNER platform...');
  
  processes.forEach(({ name, process }) => {
    console.log(`⏹️ Stopping ${name}...`);
    process.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('✅ All services stopped. Goodbye! 🦉');
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startAllServices().catch(console.error);