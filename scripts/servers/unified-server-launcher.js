#!/usr/bin/env node

/**
 * 🚀 Unified HOOTNER Server Launcher
 * Combines all server startup scripts into one with multiple modes
 */

import { spawn } from 'child_process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UnifiedServerLauncher {
    constructor() {
        this.services = [];
        this.projectRoot = path.resolve(__dirname, '../..');
        this.modes = {
            frontend: 'Frontend only (React dev server)',
            basic: 'Basic platform (HTML + GraphQL)',
            complete: 'Complete platform (All services)',
            production: 'Production mode (Docker + All services)'
        };
    }

    async launchFrontend() {
        console.log('🦉 Starting HOOTNER Frontend Only...\n');
        
        try {
            console.log('📦 Installing dependencies...');
            execSync('npm install', { 
                cwd: join(this.projectRoot, 'apps/frontend'),
                stdio: 'inherit' 
            });

            console.log('🚀 Starting development server...');
            execSync('npm run dev', { 
                cwd: join(this.projectRoot, 'apps/frontend'),
                stdio: 'inherit' 
            });

        } catch (error) {
            console.error('❌ Failed to start frontend:', error.message);
            process.exit(1);
        }
    }

    async launchBasic() {
        console.log('🦉 HOOTNER - Basic Platform Launch');
        console.log('🚀 Starting Core Services...\n');

        // Start HTML/Frontend Server
        console.log('📱 Starting Frontend Server...');
        const frontend = spawn('node', ['serve-html.js'], {
            stdio: 'inherit',
            cwd: join(this.projectRoot, 'scripts/servers')
        });
        this.services.push({ name: 'Frontend', process: frontend });

        // Start GraphQL API
        console.log('🔗 Starting GraphQL API...');
        const api = spawn('node', ['server.js'], {
            stdio: 'inherit',
            cwd: join(this.projectRoot, 'api/graphql')
        });
        this.services.push({ name: 'GraphQL API', process: api });

        this.displayAccessPoints('basic');
    }

    async launchComplete() {
        console.log('\n' + '='.repeat(70));
        console.log('🦉 HOOTNER Complete Platform Startup');
        console.log('='.repeat(70) + '\n');

        console.log('📋 Startup Sequence:\n');
        console.log('1️⃣  Docker Infrastructure (MongoDB + Redis)');
        console.log('   Status: ⏳ Starting...\n');

        // Start Docker compose
        this.startService(
            'Docker Infrastructure',
            'docker-compose',
            ['-f', 'docker-compose.dev.yml', 'up'],
            this.projectRoot
        );

        // Wait for Docker to initialize
        await this.delay(5000);

        console.log('\n2️⃣  GraphQL API + Backend Services');
        console.log('   Status: ⏳ Starting...\n');

        // Start backend services
        this.startService(
            'Backend Services',
            'npm',
            ['run', 'start:backend'],
            this.projectRoot
        );

        // Start AI Video Generation Service
        console.log('🤖 Starting AI Video Service...');
        this.startService(
            'AI Video Service',
            'python',
            ['api.py'],
            join(this.projectRoot, 'services/video-generation')
        );

        this.displayAccessPoints('complete');
    }

    async launchProduction() {
        console.log('🚀 HOOTNER Production Mode');
        console.log('🏭 Starting Production Services...\n');

        // Production-specific services
        this.startService(
            'Production Frontend',
            'npm',
            ['run', 'build', '&&', 'npm', 'run', 'serve'],
            join(this.projectRoot, 'apps/frontend')
        );

        this.startService(
            'Production API',
            'npm',
            ['run', 'start:prod'],
            this.projectRoot
        );

        this.displayAccessPoints('production');
    }

    startService(name, command, args, cwd) {
        console.log(`\n🚀 Starting ${name}...`);
        
        const proc = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true,
        });

        proc.on('error', (err) => {
            console.error(`❌ ${name} error:`, err);
        });

        this.services.push({ name, proc });
        return proc;
    }

    displayAccessPoints(mode) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ STARTUP INITIATED');
        console.log('='.repeat(70));
        console.log('\n📊 Access Points:');

        switch (mode) {
            case 'basic':
                console.log('   🌐 Frontend: http://localhost:3001');
                console.log('   📊 Dashboard: http://localhost:3001/dashboard');
                console.log('   🎬 Video Player: http://localhost:3001/video-player');
                console.log('   🔗 GraphQL API: http://localhost:4000/graphql');
                break;
            
            case 'complete':
                console.log('   🎬 Video Player: http://localhost:3005/video-player');
                console.log('   📊 Dashboard: http://localhost:3005/dashboard');
                console.log('   🔥 Live Activity: http://localhost:3005/live-activity');
                console.log('   🔗 GraphQL API: http://localhost:4000/graphql');
                console.log('   📹 Video Gen: http://localhost:5003');
                console.log('\n⏳ Services starting... Wait 10-15 seconds for full initialization');
                break;
            
            case 'production':
                console.log('   🌐 Production App: http://localhost:8080');
                console.log('   🔗 Production API: http://localhost:8081');
                break;
        }

        console.log('\n🔴 Press Ctrl+C to stop all services\n');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            console.log('\n\n🛑 Shutting down all services...');
            this.services.forEach(({ name, proc }) => {
                console.log(`   Stopping ${name}...`);
                proc.kill('SIGTERM');
            });
            
            setTimeout(() => {
                console.log('\n✅ All services stopped');
                process.exit(0);
            }, 2000);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    showHelp() {
        console.log('🦉 HOOTNER Unified Server Launcher\n');
        console.log('Available modes:');
        Object.entries(this.modes).forEach(([mode, description]) => {
            console.log(`  ${mode.padEnd(12)} - ${description}`);
        });
        console.log('\nUsage:');
        console.log('  node unified-server-launcher.js [mode]');
        console.log('\nExamples:');
        console.log('  node unified-server-launcher.js frontend');
        console.log('  node unified-server-launcher.js complete');
    }

    async launch(mode = 'basic') {
        this.setupGracefulShutdown();

        switch (mode) {
            case 'frontend':
                await this.launchFrontend();
                break;
            case 'basic':
                await this.launchBasic();
                break;
            case 'complete':
                await this.launchComplete();
                break;
            case 'production':
                await this.launchProduction();
                break;
            default:
                this.showHelp();
                return;
        }
    }
}

// Main execution
const launcher = new UnifiedServerLauncher();
const [,, mode] = process.argv;

launcher.launch(mode).catch(console.error);