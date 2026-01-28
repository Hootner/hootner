#!/usr/bin/env node

/**
 * HOOTNER - Hexagonal Architecture Entry Point
 * The Owl Never Sleeps - 24/7 Video Streaming Platform
 */

import 'dotenv/config';
import { spawn } from 'child_process';
import express from 'express';
import cors from 'cors';
import amazonQChatRouter from './api/routes/amazon-q-chat.js';

class HootnerOrchestrator {
  constructor() {
    this.services = new Map()
    this.healthChecks = new Map()
    this.app = express()
    this.setupExpress()
  }

  async start() {
    const port = process.env.PORT || 3000
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        console.log(`🦉 HOOTNER API Server running on port ${port}`)
        console.log(`📱 Amazon Q Chat available at http://localhost:${port}/api/mcp`)
        resolve(this.server)
      })
    })
  }

  async stop() {
    if (this.server) {
      this.server.close()
    }
    for (const [name, service] of this.services) {
      service.kill()
    }
  }

  setupExpress() {
    // Secure CORS configuration
    const corsOptions = {
      origin: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
      credentials: true,
      optionsSuccessStatus: 200
    }
    
    this.app.use(cors(corsOptions))
    this.app.use(express.json())
    this.app.use(express.static('hexarchy/4-interface/ui/pages'))

    // Amazon Q Chat API routes
    this.app.use('/api/mcp', amazonQChatRouter)

    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        services: Array.from(this.services.keys()),
        timestamp: new Date().toISOString()
      })
    })
  }

  async startService(name, command, args = [], options = {}) {
    // SECURITY: Validate command and args
    if (!command || typeof command !== 'string' || !Array.isArray(args)) {
      throw new Error('Invalid command parameters');
    }
    
    // SECURITY: Prevent command injection
    const allowedCommands = ['node', 'docker-compose', 'npm'];
    if (!allowedCommands.includes(command)) {
      throw new Error(`Command not allowed: ${command}`);
    }
    
    return new Promise((resolve) => {
      const service = spawn(command, args, {
        stdio: 'pipe',
        cwd: options.cwd || process.cwd(),
        shell: false, // SECURITY: Disable shell to prevent injection
        ...options
      });

      service.stdout.on('data', (data) => {
        console.log(`[${name}] ${data.toString().trim()}`);
      });

      service.stderr.on('data', (data) => {
        console.error(`[${name}] ${data.toString().trim()}`);
      });

      service.on('close', (code) => {
        if (code !== 0) {
          console.error(`[${name}] Process exited with code ${code}`);
        }
      });

      this.services.set(name, service);
      
      // Give service time to start
      setTimeout(() => resolve(service), 2000);
    });
  }

  async healthCheck(url) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async startLayer(layer, services) {
    console.log(`🔧 ${layer}: Starting services...`);
    for (const service of services) {
      try {
        await this.startService(service.name, service.command, service.args, service.options);
        if (service.healthUrl) {
          this.healthChecks.set(service.name, service.healthUrl);
        }
      } catch (error) {
        console.error(`❌ ${layer}: Failed to start ${service.name}:`, error.message);
      }
    }
    console.log(`✅ ${layer}: Complete`);
  }
}

// Start main application
async function startHootner() {
  console.log('🦉 HOOTNER - The Owl Never Sleeps')
  console.log('🏗️ Hexagonal Architecture Starting...\n')
  
  const orchestrator = new HootnerOrchestrator()
  
  try {
    // Start the Express server first
    await orchestrator.start()
    
    // Initialize layers in dependency order
    console.log('⚡ Initializing hexagonal layers...')
    
    // 0-core: Domain logic
    console.log('   0-core: Domain & business rules ✓');
    
    // 1-foundation: Infrastructure  
    console.log('   1-foundation: Starting infrastructure...');
    await orchestrator.startLayer('1-foundation', [
      { name: 'database', command: 'docker-compose', args: ['up', '-d', 'postgres', 'redis'] }
    ]);
    
    // Wait for database to be ready
    console.log('   Waiting for database connection...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 2-intelligence: AI services
    await orchestrator.startLayer('2-intelligence', [
      { name: 'ai-agents', command: 'node', args: ['hexarchy/5-economy/business/ai/run-all-agents.js'] }
    ]);
    
    // 3-communication: APIs
    await orchestrator.startLayer('3-communication', [
      { name: 'graphql-api', command: 'node', args: ['server.js'], options: { cwd: 'hexarchy/3-communication/adapters/graphql-api' }, healthUrl: 'http://localhost:4000/graphql' }
    ]);
    
    // 4-interface: Frontend
    await orchestrator.startLayer('4-interface', [
      { name: 'frontend', command: 'node', args: ['frontend-server.js'], healthUrl: 'http://localhost:3000/api/health' }
    ]);
    
    // 5-economy: Business logic
    await orchestrator.startLayer('5-economy', [
      { name: 'payment-service', command: 'node', args: ['hexarchy/5-economy/business/commerce/payment-service.js'] },
      { name: 'revenue-api', command: 'node', args: ['hexarchy/5-economy/business/revenue/revenue-algorithms-api.js'] }
    ]);
    
    // 6-governance: Security
    await orchestrator.startLayer('6-governance', [
      { name: 'security-service', command: 'node', args: ['hexarchy/5-economy/business/compliance/security-service.js'] }
    ]);
    
    // 7-data: Data management
    await orchestrator.startLayer('7-data', [
      { name: 'database-manager', command: 'node', args: ['hexarchy/7-data/storage/database-manager.js'] }
    ]);
    
    // 8-operations: DevOps
    await orchestrator.startLayer('8-operations', [
      { name: 'monitoring', command: 'node', args: ['hexarchy/5-economy/business/analytics/performance-monitor.js'] }
    ]);
    
    console.log('\n🚀 HOOTNER is ready!');
    console.log('📍 Frontend: http://localhost:3000');
    console.log('📍 GraphQL: http://localhost:4000/graphql');
    
    // Health monitoring
    setInterval(async () => {
      for (const [name, url] of orchestrator.healthChecks) {
        const healthy = await orchestrator.healthCheck(url);
        if (!healthy) {
          console.warn(`⚠️  ${name} health check failed`);
        }
      }
    }, 30000);
    
    // Keep process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Failed to start HOOTNER:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HOOTNER gracefully...');
  process.exit(0);
});

startHootner();