#!/usr/bin/env node
/**
 * Backend Services Orchestrator
 * Starts and manages all backend services for HOOTNER
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const services = [];
let shuttingDown = false;

// Service configurations
const SERVICE_CONFIGS = [
  {
    name: 'MongoDB',
    check: () => checkPort(27017),
    start: null, // Managed by docker-compose
    color: '\x1b[32m', // Green
  },
  {
    name: 'Redis',
    check: () => checkPort(6379),
    start: null, // Managed by docker-compose
    color: '\x1b[31m', // Red
  },
  {
    name: 'GraphQL API',
    check: () => checkPort(4000),
    start: () => startService('GraphQL API', 'node', ['server-enhanced.js'], path.join(__dirname, '..', 'api', 'graphql')),
    color: '\x1b[35m', // Magenta
  },
  {
    name: 'Video Generation API',
    check: () => checkPort(5003),
    start: () => startService('Video Generation', 'python', ['api.py'], path.join(__dirname, '..', 'services', 'video-generation')),
    color: '\x1b[36m', // Cyan
  },
];

// Check if port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer()
      .once('error', () => resolve(true)) // Port in use
      .once('listening', () => {
        tester.close();
        resolve(false); // Port available
      })
      .listen(port);
  });
}

// Start a service
function startService(name, command, args, cwd) {
  console.log(`\n🚀 Starting ${name}...`);
  
  const proc = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true,
  });
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`[${name}] ${line}`);
      }
    });
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.error(`[${name}] ${line}`);
      }
    });
  });
  
  proc.on('close', (code) => {
    if (!shuttingDown) {
      console.error(`\n❌ ${name} exited with code ${code}`);
      if (code !== 0) {
        console.log(`   Restarting ${name} in 5 seconds...`);
        setTimeout(() => startService(name, command, args, cwd), 5000);
      }
    }
  });
  
  services.push({ name, proc });
  return proc;
}

// Graceful shutdown
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  
  console.log('\n\n🛑 Shutting down services...');
  
  services.forEach(({ name, proc }) => {
    console.log(`   Stopping ${name}...`);
    proc.kill('SIGTERM');
  });
  
  setTimeout(() => {
    console.log('\n✅ All services stopped');
    process.exit(0);
  }, 2000);
}

// Main startup sequence
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🦉 HOOTNER Backend Services Orchestrator');
  console.log('='.repeat(60) + '\n');
  
  // Check infrastructure services
  console.log('📊 Checking infrastructure services...\n');
  
  const mongoRunning = await checkPort(27017);
  const redisRunning = await checkPort(6379);
  
  if (!mongoRunning) {
    console.log('❌ MongoDB not running on port 27017');
    console.log('   Start with: docker-compose -f docker-compose.dev.yml up -d mongodb');
    process.exit(1);
  }
  console.log('✅ MongoDB running on port 27017');
  
  if (!redisRunning) {
    console.log('❌ Redis not running on port 6379');
    console.log('   Start with: docker-compose -f docker-compose.dev.yml up -d redis');
    process.exit(1);
  }
  console.log('✅ Redis running on port 6379');
  
  // Optimize databases
  console.log('\n🔧 Optimizing databases...');
  const optimizeScript = path.join(__dirname, 'optimize-databases.js');
  if (existsSync(optimizeScript)) {
    const optimize = spawn('node', [optimizeScript], { stdio: 'inherit' });
    await new Promise((resolve) => optimize.on('close', resolve));
  }
  
  // Start application services
  console.log('\n🚀 Starting application services...\n');
  
  // Start GraphQL API
  const graphqlPath = path.join(__dirname, '..', 'api', 'graphql', 'server-enhanced.js');
  if (existsSync(graphqlPath)) {
    startService('GraphQL API', 'node', ['server-enhanced.js'], path.join(__dirname, '..', 'api', 'graphql'));
  } else {
    console.log('⚠️  GraphQL API not found, skipping...');
  }
  
  // Wait for GraphQL to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Start Video Generation API (optional)
  const videoApiPath = path.join(__dirname, '..', 'services', 'video-generation', 'api.py');
  if (existsSync(videoApiPath)) {
    console.log('\n🎬 Starting Video Generation API...');
    startService('Video Generation', 'python', ['api.py'], path.join(__dirname, '..', 'services', 'video-generation'));
  } else {
    console.log('⚠️  Video Generation API not found, skipping...');
  }
  
  // Display status
  console.log('\n' + '='.repeat(60));
  console.log('✅ Backend services started successfully!');
  console.log('='.repeat(60));
  console.log('\n📡 Service URLs:');
  console.log('   GraphQL API:        http://localhost:4000/graphql');
  console.log('   GraphQL Playground: http://localhost:4000/graphql');
  console.log('   Health Check:       http://localhost:4000/health');
  console.log('   Video Generation:   http://localhost:5003/health');
  console.log('\n💾 Infrastructure:');
  console.log('   MongoDB:            mongodb://localhost:27017/hootner');
  console.log('   Redis:              redis://localhost:6379');
  console.log('\n📝 Logs: Check console output above');
  console.log('🛑 Stop: Press Ctrl+C\n');
  console.log('='.repeat(60) + '\n');
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start
main().catch((error) => {
  console.error('\n❌ Startup failed:', error);
  process.exit(1);
});
