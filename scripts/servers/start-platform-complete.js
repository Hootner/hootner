#!/usr/bin/env node

/**
 * 🚀 HOOTNER Complete Platform Startup
 * Starts all services needed for real-time live activity
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '='.repeat(70));
console.log('🦉 HOOTNER Complete Platform Startup');
console.log('='.repeat(70) + '\n');

const services = [];

function startService(name, command, args, cwd) {
    console.log(`\n🚀 Starting ${name}...`);
    
    const proc = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        shell: true,
    });

    proc.on('error', (err) => {
        console.error(`❌ ${name} error:`, err);
    });

    services.push({ name, proc });
    return proc;
}

function shutdown() {
    console.log('\n\n🛑 Shutting down all services...');
    services.forEach(({ name, proc }) => {
        console.log(`   Stopping ${name}...`);
        proc.kill('SIGTERM');
    });
    
    setTimeout(() => {
        console.log('\n✅ All services stopped');
        process.exit(0);
    }, 2000);
}

// Handle Ctrl+C
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Main startup
async function main() {
    const projectRoot = path.resolve(__dirname);

    console.log('📋 Startup Sequence:\n');
    console.log('1️⃣  Docker Infrastructure (MongoDB + Redis)');
    console.log('   Status: ⏳ Starting...\n');

    // Start Docker compose
    startService(
        'Docker',
        'docker-compose',
        ['-f', 'docker-compose.dev.yml', 'up'],
        projectRoot
    );

    // Wait 5 seconds for Docker to initialize
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n2️⃣  GraphQL API + Backend Services');
    console.log('   Status: ⏳ Starting...\n');

    // Start backend services
    startService(
        'Backend Services',
        'npm',
        ['run', 'start:backend'],
        projectRoot
    );

    console.log('\n' + '='.repeat(70));
    console.log('✅ STARTUP INITIATED');
    console.log('='.repeat(70));
    console.log('\n📊 Access Points:');
    console.log('   🎬 Video Player: http://localhost:3005/video-player');
    console.log('   📊 Dashboard:    http://localhost:3005/dashboard');
    console.log('   🔥 Live Activity: http://localhost:3005/live-activity (NOW WITH REAL DATA!)');
    console.log('   🔗 GraphQL API:  http://localhost:4000/graphql');
    console.log('   📹 Video Gen:    http://localhost:5003');
    console.log('\n⏳ Services starting... Wait 10-15 seconds for full initialization\n');
    console.log('🔴 Press Ctrl+C to stop all services\n');
}

main().catch(console.error);
