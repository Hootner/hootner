#!/usr/bin/env node

/**
 * HOOTNER Platform Launcher
 * Starts all services and components
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🦉 HOOTNER - The Owl Never Sleeps');
console.log('🚀 Starting Enterprise Video Platform...\n');

const services = [];

// Start HTML/Frontend Server
console.log('📱 Starting Frontend Server...');
const frontend = spawn('node', ['serve-html.js'], {
  stdio: 'inherit',
  cwd: __dirname
});
services.push({ name: 'Frontend', process: frontend });

// Start GraphQL API
console.log('🔗 Starting GraphQL API...');
const api = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: join(__dirname, 'api/graphql')
});
services.push({ name: 'GraphQL API', process: api });

// Start AI Video Generation Service
console.log('🤖 Starting AI Video Service...');
const aiVideo = spawn('python', ['api.py'], {
  stdio: 'inherit',
  cwd: join(__dirname, 'services/video-generation')
});
services.push({ name: 'AI Video', process: aiVideo });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HOOTNER services...');
  services.forEach(service => {
    console.log(`   Stopping ${service.name}...`);
    service.process.kill('SIGTERM');
  });
  process.exit(0);
});

console.log('\n✅ All services started!');
console.log('🌐 Access HOOTNER at: http://localhost:3001');
console.log('📊 Dashboard: http://localhost:3001/dashboard');
console.log('🎬 Video Player: http://localhost:3001/video-player');
console.log('🔗 GraphQL API: http://localhost:4000/graphql');
console.log('🤖 AI Video API: http://localhost:5003');
console.log('\nPress Ctrl+C to stop all services');