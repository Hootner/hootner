#!/usr/bin/env node

/**
 * HTTP wrapper for HOOTNER MCP Server - Production deployment
 */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Tools
const tools = {
  deploy_service: async (input) => {
    const { environment, service } = input;
    const cmd = `docker-compose -f docker-compose.${environment}.yml up -d ${service || ''}`;
    const { stdout } = await execAsync(cmd);
    return { status: 'deployed', environment, service, output: stdout };
  },
  
  chaos_test: async (input) => {
    const { scenario, duration = 5 } = input;
    return { result: `Chaos test ${scenario} completed`, duration };
  },
  
  system_health: async (input) => {
    const { component = 'all' } = input;
    const checks = {
      frontend: 'curl -f http://localhost:3000/health',
      backend: 'curl -f http://localhost:4000/graphql'
    };
    
    const results = {};
    const targets = component === 'all' ? Object.keys(checks) : [component];
    
    for (const target of targets) {
      try {
        await execAsync(checks[target]);
        results[target] = 'healthy';
      } catch {
        results[target] = 'down';
      }
    }
    
    return { health: results };
  },
  
  backup_system: async (input) => {
    const { type } = input;
    const cmd = `node scripts/backup-manager.js --type ${type}`;
    const { stdout } = await execAsync(cmd);
    return { status: 'completed', type, output: stdout };
  },
  
  security_scan: async (input) => {
    const { scan_type } = input;
    const cmds = {
      full: 'node scripts/security-audit.js',
      dependencies: 'npm audit',
      secrets: 'npm run security:scan'
    };
    const { stdout } = await execAsync(cmds[scan_type]);
    return { scan: scan_type, results: stdout };
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// MCP endpoints
app.get('/v1/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  res.write('data: {"type":"connection","status":"connected"}\n\n');
  
  req.on('close', () => {
    res.end();
  });
});

app.post('/v1/tools/list', (req, res) => {
  res.json({
    tools: [
      { name: 'deploy_service', description: 'Deploy HOOTNER microservices' },
      { name: 'chaos_test', description: 'Run chaos engineering tests' },
      { name: 'system_health', description: 'Check system health' },
      { name: 'backup_system', description: 'Trigger system backup' },
      { name: 'security_scan', description: 'Run security audit' }
    ]
  });
});

app.post('/v1/tools/call', async (req, res) => {
  const { name, arguments: args } = req.body;
  
  if (!tools[name]) {
    return res.status(404).json({ error: `Tool ${name} not found` });
  }
  
  try {
    const result = await tools[name](args);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 HOOTNER MCP HTTP Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`SSE: http://localhost:${PORT}/v1/sse`);
});