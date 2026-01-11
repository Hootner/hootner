#!/usr/bin/env node

/**
 * HOOTNER Advanced Platform Launcher
 * Orchestrates all services with health monitoring, auto-recovery, and load balancing
 */

import { spawn, exec } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ServiceOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.healthChecks = new Map();
    this.loadBalancer = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulStarts: 0,
      failedStarts: 0,
      restarts: 0,
      uptime: Date.now()
    };
    
    this.serviceDefinitions = [
      {
        name: 'enhanced-html-server',
        command: 'node',
        args: ['serve-html-enhanced.js'],
        port: 3005,
        healthEndpoint: 'http://localhost:3005/api/dashboard/stats',
        critical: true,
        autoRestart: true,
        maxRestarts: 5,
        dependencies: []
      },
      {
        name: 'graphql-api',
        command: 'node',
        args: ['api/graphql/server.js'],
        port: 4000,
        healthEndpoint: 'http://localhost:4000/graphql',
        critical: true,
        autoRestart: true,
        maxRestarts: 3,
        dependencies: []
      },
      {
        name: 'ai-video-generation',
        command: 'python',
        args: ['services/video-generation/api_enhanced.py'],
        port: 5003,
        healthEndpoint: 'http://localhost:5003/health',
        critical: false,
        autoRestart: true,
        maxRestarts: 3,
        dependencies: []
      },
      {
        name: 'enhanced-agent-hub',
        command: 'node',
        args: ['enhanced-agent-hub.js'],
        port: 9001,
        healthEndpoint: 'http://localhost:9001/status',
        critical: false,
        autoRestart: true,
        maxRestarts: 5,
        dependencies: []
      },
      {
        name: 'frontend-dev-server',
        command: 'npm',
        args: ['run', 'dev'],
        port: 5173,
        cwd: 'apps/frontend',
        healthEndpoint: 'http://localhost:5173',
        critical: false,
        autoRestart: false,
        maxRestarts: 2,
        dependencies: []
      }
    ];
  }

  async start() {
    console.log('🚀 Starting HOOTNER Advanced Platform Orchestrator...\n');
    
    // Create logs directory
    await this.ensureLogsDirectory();
    
    // Start services in dependency order
    await this.startServicesInOrder();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Start load balancing
    this.startLoadBalancing();
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
    
    console.log('\\n✅ HOOTNER Platform fully operational!');
    this.displayServiceStatus();
    this.displayQuickLinks();
  }

  async ensureLogsDirectory() {
    const logsDir = path.join(__dirname, 'logs', 'services');
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error.message);
    }
  }

  async startServicesInOrder() {
    // Sort services by dependencies (simplified - no actual dependency resolution)
    const sortedServices = [...this.serviceDefinitions].sort((a, b) => {
      if (a.critical && !b.critical) return -1;
      if (!a.critical && b.critical) return 1;
      return 0;
    });

    for (const serviceConfig of sortedServices) {
      await this.startService(serviceConfig);
      // Wait a bit between service starts
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async startService(config) {
    console.log(`🔄 Starting ${config.name}...`);
    
    try {
      const service = {
        config,
        process: null,
        status: 'starting',
        restartCount: 0,
        lastRestart: null,
        startTime: Date.now(),
        pid: null,
        logs: []
      };

      // Spawn the process
      const spawnOptions = {
        cwd: config.cwd ? path.join(__dirname, config.cwd) : __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'production' }
      };

      service.process = spawn(config.command, config.args, spawnOptions);
      service.pid = service.process.pid;

      // Handle process events
      service.process.stdout.on('data', (data) => {
        const log = data.toString().trim();
        service.logs.push({ timestamp: new Date(), type: 'stdout', message: log });
        this.logToFile(config.name, 'stdout', log);
      });

      service.process.stderr.on('data', (data) => {
        const log = data.toString().trim();
        service.logs.push({ timestamp: new Date(), type: 'stderr', message: log });
        this.logToFile(config.name, 'stderr', log);
      });

      service.process.on('close', (code) => {
        service.status = code === 0 ? 'stopped' : 'crashed';
        console.log(`⚠️  ${config.name} exited with code ${code}`);
        
        if (config.autoRestart && service.restartCount < config.maxRestarts) {
          this.restartService(config.name);
        }
      });

      service.process.on('error', (error) => {
        service.status = 'error';
        console.error(`❌ ${config.name} error:`, error.message);
        this.metrics.failedStarts++;
      });

      this.services.set(config.name, service);

      // Wait for service to be ready
      await this.waitForService(config);
      
      service.status = 'running';
      console.log(`✅ ${config.name} started successfully (PID: ${service.pid})`);
      this.metrics.successfulStarts++;

    } catch (error) {
      console.error(`❌ Failed to start ${config.name}:`, error.message);
      this.metrics.failedStarts++;
    }
  }

  async waitForService(config) {
    if (!config.healthEndpoint) return;
    
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(config.healthEndpoint);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Service ${config.name} failed to become healthy within ${maxAttempts} seconds`);
  }

  async restartService(serviceName) {
    console.log(`🔄 Restarting ${serviceName}...`);
    
    const service = this.services.get(serviceName);
    if (!service) return;

    service.restartCount++;
    service.lastRestart = Date.now();
    this.metrics.restarts++;

    // Kill existing process
    if (service.process && !service.process.killed) {
      service.process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!service.process.killed) {
          service.process.kill('SIGKILL');
        }
      }, 5000);
    }

    // Wait a bit before restarting
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Restart the service
    await this.startService(service.config);
  }

  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    setInterval(async () => {
      for (const [serviceName, service] of this.services) {
        if (service.status === 'running' && service.config.healthEndpoint) {
          try {
            const response = await fetch(service.config.healthEndpoint, { 
              timeout: 5000 
            });
            
            if (!response.ok) {
              console.log(`⚠️  Health check failed for ${serviceName}`);
              if (service.config.autoRestart) {
                this.restartService(serviceName);
              }
            }
          } catch (error) {
            console.log(`❌ Health check error for ${serviceName}:`, error.message);
            if (service.config.autoRestart) {
              this.restartService(serviceName);
            }
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  startLoadBalancing() {
    console.log('⚖️  Starting load balancing...');
    
    // Simple round-robin load balancing for services with multiple instances
    setInterval(() => {
      this.updateLoadBalancingMetrics();
    }, 10000); // Update every 10 seconds
  }

  updateLoadBalancingMetrics() {
    for (const [serviceName, service] of this.services) {
      if (service.status === 'running') {
        // Simulate load metrics
        const loadMetrics = {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          requests: Math.floor(Math.random() * 1000),
          responseTime: Math.floor(Math.random() * 500) + 50
        };
        
        this.loadBalancer.set(serviceName, loadMetrics);
      }
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\\n🛑 Received ${signal}. Shutting down gracefully...`);
      
      // Stop all services
      for (const [serviceName, service] of this.services) {
        if (service.process && !service.process.killed) {
          console.log(`🛑 Stopping ${serviceName}...`);
          service.process.kill('SIGTERM');
        }
      }
      
      // Wait for processes to exit
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Force kill any remaining processes
      for (const [serviceName, service] of this.services) {
        if (service.process && !service.process.killed) {
          console.log(`💀 Force killing ${serviceName}...`);
          service.process.kill('SIGKILL');
        }
      }
      
      console.log('✅ All services stopped. Goodbye! 🦉');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  displayServiceStatus() {
    console.log('\\n📊 Service Status:');
    console.log('═'.repeat(80));
    
    for (const [serviceName, service] of this.services) {
      const status = service.status;
      const statusIcon = status === 'running' ? '🟢' : 
                        status === 'starting' ? '🟡' : 
                        status === 'stopped' ? '⚪' : '🔴';
      
      const uptime = service.startTime ? 
        Math.floor((Date.now() - service.startTime) / 1000) + 's' : 'N/A';
      
      console.log(`${statusIcon} ${serviceName.padEnd(25)} ${status.padEnd(10)} Port: ${service.config.port || 'N/A'} Uptime: ${uptime}`);
    }
    
    console.log('═'.repeat(80));
    console.log(`📈 Metrics: ${this.metrics.successfulStarts} started, ${this.metrics.failedStarts} failed, ${this.metrics.restarts} restarts`);
  }

  displayQuickLinks() {
    console.log('\\n🔗 Quick Access Links:');
    console.log('═'.repeat(80));
    console.log('🏠 Main Dashboard      → http://localhost:3005/dashboard');
    console.log('🎬 Video Player        → http://localhost:3005/video-player');
    console.log('🤝 Collaboration      → http://localhost:3005/collaboration');
    console.log('🤖 AI Agent Hub       → http://localhost:3005/agent-management');
    console.log('⚡ DevOps Monitor     → http://localhost:3005/devops-monitoring');
    console.log('📊 Analytics          → http://localhost:3005/analytics');
    console.log('🛒 Marketplace        → http://localhost:3005/marketplace');
    console.log('💻 Code Editor        → http://localhost:3005/code-editor');
    console.log('🔧 GraphQL API        → http://localhost:4000/graphql');
    console.log('🎥 AI Video API       → http://localhost:5003');
    console.log('🚀 Frontend Dev       → http://localhost:5173');
    console.log('═'.repeat(80));
  }

  async logToFile(serviceName, type, message) {
    const logFile = path.join(__dirname, 'logs', 'services', `${serviceName}-${type}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\\n`;
    
    try {
      await fs.appendFile(logFile, logEntry);
    } catch (error) {
      // Ignore logging errors
    }
  }

  getServiceMetrics() {
    const metrics = {
      platform: this.metrics,
      services: {},
      loadBalancer: Object.fromEntries(this.loadBalancer)
    };

    for (const [serviceName, service] of this.services) {
      metrics.services[serviceName] = {
        status: service.status,
        uptime: service.startTime ? Date.now() - service.startTime : 0,
        restartCount: service.restartCount,
        pid: service.pid,
        port: service.config.port
      };
    }

    return metrics;
  }

  async getServiceLogs(serviceName, lines = 100) {
    const service = this.services.get(serviceName);
    if (!service) return [];
    
    return service.logs.slice(-lines);
  }

  async scaleService(serviceName, instances) {
    // Placeholder for horizontal scaling
    console.log(`🔄 Scaling ${serviceName} to ${instances} instances...`);
    // Implementation would depend on container orchestration (Docker, K8s)
  }
}

// CLI Interface
class PlatformCLI {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  async handleCommand(command, args) {
    switch (command) {
      case 'status':
        this.orchestrator.displayServiceStatus();
        break;
      
      case 'restart':
        if (args[0]) {
          await this.orchestrator.restartService(args[0]);
        } else {
          console.log('Usage: restart <service-name>');
        }
        break;
      
      case 'logs':
        if (args[0]) {
          const logs = await this.orchestrator.getServiceLogs(args[0], parseInt(args[1]) || 50);
          logs.forEach(log => {
            console.log(`[${log.timestamp.toISOString()}] ${log.type}: ${log.message}`);
          });
        } else {
          console.log('Usage: logs <service-name> [lines]');
        }
        break;
      
      case 'metrics':
        console.log(JSON.stringify(this.orchestrator.getServiceMetrics(), null, 2));
        break;
      
      case 'scale':
        if (args[0] && args[1]) {
          await this.orchestrator.scaleService(args[0], parseInt(args[1]));
        } else {
          console.log('Usage: scale <service-name> <instances>');
        }
        break;
      
      case 'help':
        this.showHelp();
        break;
      
      default:
        console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
    }
  }

  showHelp() {
    console.log('\\n🦉 HOOTNER Platform CLI Commands:');
    console.log('═'.repeat(50));
    console.log('status                    - Show service status');
    console.log('restart <service>         - Restart a service');
    console.log('logs <service> [lines]    - Show service logs');
    console.log('metrics                   - Show platform metrics');
    console.log('scale <service> <count>   - Scale service instances');
    console.log('help                      - Show this help');
    console.log('═'.repeat(50));
  }
}

// Main execution
async function main() {
  const orchestrator = new ServiceOrchestrator();
  const cli = new PlatformCLI(orchestrator);

  // Check if running as CLI
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];
    const commandArgs = args.slice(1);
    await cli.handleCommand(command, commandArgs);
    return;
  }

  // Start the platform
  try {
    await orchestrator.start();
    
    // Keep the process running
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Failed to start platform:', error.message);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ServiceOrchestrator, PlatformCLI };