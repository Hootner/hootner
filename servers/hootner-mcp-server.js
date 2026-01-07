#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError, } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import { execSync } from 'child_process';
import os from 'os';

class HootnerMCPServer {
  constructor() {
    this.server = new Server(
      { name: 'hootner-mcp', version: '0.1.0' },
      { capabilities: { tools: {} } }
    );
    this.cache = new Map();
    this.allowedScripts = [
      'start', 'dev', 'lint', 'lint:fix', 'test', 'test:unit', 'test:integration', 'test:e2e',
      'build', 'security:audit', 'security:scan', 'backup:full', 'backup:incremental',
      'deploy:dev', 'deploy:prod', 'chaos:test', 'mcp:start', 'mcp:test'
    ];
    this.destructiveActions = ['deploy:prod', 'backup:full', 'chaos:test'];
    this.setupToolHandlers();
  }

  async logAction(tool, args, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tool,
      args,
      result: result.substring(0, 200),
      user: process.env.USER || process.env.USERNAME || 'unknown'
    };
    try {
      await fs.appendFile('docs/reports/mcp-audit.log', JSON.stringify(logEntry) + '\n');
    } catch {}
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'getProjectInfo',
            description: 'Get information about the Hootner project structure and configuration',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'listServices',
            description: 'List all available services and servers',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'getServiceStatus',
            description: 'Get the status of a specific service',
            inputSchema: {
              type: 'object',
              properties: { serviceName: { type: 'string', description: 'Name of the service to check' } },
              required: ['serviceName']
            }
          },
          {
            name: 'readLogs',
            description: 'Read application logs',
            inputSchema: {
              type: 'object',
              properties: {
                logFile: { type: 'string', description: 'Log file to read (optional)' },
                lines: { type: 'number', description: 'Number of lines to read from the end', default: 50 }
              },
              required: []
            }
          },
          {
            name: 'runScript',
            description: 'Execute npm scripts',
            inputSchema: {
              type: 'object',
              properties: { scriptName: { type: 'string', description: 'Script name from package.json' } },
              required: ['scriptName']
            }
          },
          {
            name: 'checkDependencies',
            description: 'List outdated packages',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'getEnvConfig',
            description: 'Read environment variables safely',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'listAgents',
            description: 'List AI agents from .amazonq/agents/',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'readServerFile',
            description: 'Read server source file content',
            inputSchema: {
              type: 'object',
              properties: { serverName: { type: 'string', description: 'Server file name' } },
              required: ['serverName']
            }
          },
          {
            name: 'deployService',
            description: 'Trigger deployments',
            inputSchema: {
              type: 'object',
              properties: { environment: { type: 'string', enum: ['dev', 'prod'], description: 'Deployment environment' } },
              required: ['environment']
            }
          },
          {
            name: 'backupData',
            description: 'Run backup scripts',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'securityScan',
            description: 'Run security audits',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'chaosTest',
            description: 'Execute chaos engineering tests',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'getMetrics',
            description: 'Fetch monitoring metrics',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'restartService',
            description: 'Restart specific servers',
            inputSchema: {
              type: 'object',
              properties: { serviceName: { type: 'string', description: 'Service to restart' } },
              required: ['serviceName']
            }
          },
          {
            name: 'getServerFiles',
            description: 'List specific server implementations',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'gitStatus',
            description: 'Show git branch and uncommitted changes',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'dockerStatus',
            description: 'List running Docker containers',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'k8sStatus',
            description: 'Check Kubernetes pods and services',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'testRunner',
            description: 'Run specific test suites',
            inputSchema: {
              type: 'object',
              properties: { suite: { type: 'string', enum: ['unit', 'integration', 'e2e', 'all'], description: 'Test suite to run' } },
              required: ['suite']
            }
          },
          {
            name: 'buildProject',
            description: 'Build frontend or services',
            inputSchema: {
              type: 'object',
              properties: { target: { type: 'string', description: 'Build target (frontend/server)' } },
              required: ['target']
            }
          },
          {
            name: 'monitorHealth',
            description: 'Check all services health status',
            inputSchema: { type: 'object', properties: {}, required: [] }
          },
          {
            name: 'viewDocs',
            description: 'Read documentation files',
            inputSchema: {
              type: 'object',
              properties: { docName: { type: 'string', description: 'Documentation file name' } },
              required: ['docName']
            }
          },
          {
            name: 'configValidator',
            description: 'Validate configuration files',
            inputSchema: { type: 'object', properties: {}, required: [] }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'getProjectInfo':
          return await this.getProjectInfo();
        case 'listServices':
          return await this.listServices();
        case 'getServiceStatus':
          return await this.getServiceStatus(request.params.arguments?.serviceName);
        case 'readLogs':
          return await this.readLogs(
            request.params.arguments?.logFile,
            request.params.arguments?.lines || 50
          );
        case 'runScript':
          return await this.runScript(request.params.arguments?.scriptName);
        case 'checkDependencies':
          return await this.checkDependencies();
        case 'getEnvConfig':
          return await this.getEnvConfig();
        case 'listAgents':
          return await this.listAgents();
        case 'readServerFile':
          return await this.readServerFile(request.params.arguments?.serverName);
        case 'deployService':
          return await this.deployService(request.params.arguments?.environment);
        case 'backupData':
          return await this.backupData();
        case 'securityScan':
          return await this.securityScan();
        case 'chaosTest':
          return await this.chaosTest();
        case 'getMetrics':
          return await this.getMetrics();
        case 'restartService':
          return await this.restartService(request.params.arguments?.serviceName);
        case 'getServerFiles':
          return await this.getServerFiles();
        case 'gitStatus':
          return await this.gitStatus();
        case 'dockerStatus':
          return await this.dockerStatus();
        case 'k8sStatus':
          return await this.k8sStatus();
        case 'testRunner':
          return await this.testRunner(request.params.arguments?.suite);
        case 'buildProject':
          return await this.buildProject(request.params.arguments?.target);
        case 'monitorHealth':
          return await this.monitorHealth();
        case 'viewDocs':
          return await this.viewDocs(request.params.arguments?.docName);
        case 'configValidator':
          return await this.configValidator();
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
      }
    });
  }

  async getProjectInfo() {
    const cacheKey = 'projectInfo';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data;
    }

    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const projectStructure = await this.getProjectStructure();
      const gitBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      const gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      const gitRemote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      const uncommitted = execSync('git status --short', { encoding: 'utf-8' }).split('\n').filter(l => l).length;
      const dockerRunning = this.checkDockerRunning();
      const nodeVersion = process.version;
      const platform = `${os.platform()} ${os.arch()}`;
      const uptime = Math.floor(process.uptime()) + 's';
      
      // Count total files
      let totalFiles = 0;
      for (const items of Object.values(projectStructure)) {
        totalFiles += items.length;
      }

      // Check PM2 status
      let pm2Running = false;
      let pm2Processes = 0;
      try {
        execSync('pm2 -v', { encoding: 'utf-8', stdio: 'ignore' });
        const pm2List = JSON.parse(execSync('pm2 jlist', { encoding: 'utf-8' }));
        pm2Running = true;
        pm2Processes = pm2List.length;
      } catch {}

      const result = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              project: {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description,
                license: packageJson.license
              },
              environment: {
                node: nodeVersion,
                platform: platform,
                uptime: uptime
              },
              git: {
                branch: gitBranch,
                commit: gitCommit,
                remote: gitRemote,
                uncommitted: uncommitted
              },
              structure: projectStructure,
              stats: {
                totalDirectories: Object.keys(projectStructure).length,
                totalFiles: totalFiles,
                scripts: Object.keys(packageJson.scripts).length,
                dependencies: Object.keys(packageJson.dependencies || {}).length,
                devDependencies: Object.keys(packageJson.devDependencies || {}).length
              },
              services: {
                docker: dockerRunning,
                pm2: pm2Running,
                pm2Processes: pm2Processes
              },
              scripts: Object.keys(packageJson.scripts)
            }, null, 2)
          }
        ]
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get project info: ${error.message}`);
    }
  }

  async getProjectStructure() {
    const structure = {};
    const directories = ['apps', 'services', 'servers', 'lib', 'middleware'];

    for (const dir of directories) {
      try {
        const items = await fs.readdir(dir);
        structure[dir] = items;
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }

    return structure;
  }

  async listServices() {
    const cacheKey = 'listServices';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return cached.data;
    }

    try {
      const services = [];

      // Check servers directory
      try {
        const serverFiles = await fs.readdir('servers');
        services.push(...serverFiles.filter(f => f.endsWith('.js') || f.endsWith('.cjs')).map(file => ({ type: 'server', name: file, path: 'servers/' })));
      } catch {}

      // Check services directory
      try {
        const serviceDirs = await fs.readdir('services');
        for (const dir of serviceDirs) {
          try {
            const stat = await fs.stat(`services/${dir}`);
            if (stat.isDirectory()) {
              services.push({ type: 'service', name: dir, path: 'services/' });
            }
          } catch {}
        }
      } catch {}

      // Check apps directory
      try {
        const appDirs = await fs.readdir('apps');
        for (const dir of appDirs) {
          try {
            const stat = await fs.stat(`apps/${dir}`);
            if (stat.isDirectory()) {
              services.push({ type: 'app', name: dir, path: 'apps/' });
            }
          } catch {}
        }
      } catch {}

      const result = {
        content: [
          { type: 'text', text: JSON.stringify({ services, total: services.length }, null, 2) }
        ]
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list services: ${error.message}`);
    }
  }

  async getServiceStatus(serviceName) {
    try {
      // Try PM2 first
      try {
        execSync('pm2 -v', { encoding: 'utf-8', stdio: 'ignore' });
        const output = execSync('pm2 jlist', { encoding: 'utf-8' });
        const processes = JSON.parse(output);
        const service = processes.find(p => p.name === serviceName || p.name.includes(serviceName));
        if (service) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                service: service.name,
                status: service.pm2_env.status,
                uptime: Math.floor((Date.now() - service.pm2_env.pm_uptime) / 1000) + 's',
                restarts: service.pm2_env.restart_time,
                memory: Math.floor(service.monit.memory / 1024 / 1024) + 'MB',
                cpu: service.monit.cpu + '%',
                pid: service.pid
              }, null, 2)
            }]
          };
        }
      } catch {}

      // Check by port (common server ports)
      const portMap = {
        'collab-server.js': 3000,
        'hub-app.js': 3001,
        'secure-server.js': 3443,
        'video-player-server.js': 3002,
        'mcp-server.js': 3003
      };
      
      const port = portMap[serviceName];
      if (port) {
        const platform = os.platform();
        try {
          const cmd = platform === 'win32' 
            ? `netstat -ano | findstr :${port}` 
            : `lsof -i :${port} -t`;
          const output = execSync(cmd, { encoding: 'utf-8' });
          const isRunning = output.trim().length > 0;
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                service: serviceName,
                status: isRunning ? 'running' : 'stopped',
                port: port,
                method: 'port-check'
              }, null, 2)
            }]
          };
        } catch {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                service: serviceName,
                status: 'stopped',
                port: port,
                method: 'port-check'
              }, null, 2)
            }]
          };
        }
      }

      // Fallback
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            service: serviceName,
            status: 'unknown',
            note: 'Use PM2 for accurate status or configure port mapping'
          }, null, 2)
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get service status: ${error.message}`);
    }
  }

  async readLogs(logFile = 'docs/reports/combined.log', lines = 50) {
    try {
      const content = await fs.readFile(logFile, 'utf-8');
      const allLines = content.split('\n');
      const logLines = allLines.slice(-lines).join('\n');
      const errors = allLines.filter(l => l.toLowerCase().includes('error')).length;
      const warnings = allLines.filter(l => l.toLowerCase().includes('warn')).length;

      return {
        content: [
          { type: 'text', text: `Errors: ${errors} | Warnings: ${warnings}\n\n${logLines}` }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to read logs: ${error.message}`);
    }
  }

  async runScript(scriptName) {
    if (!this.allowedScripts.includes(scriptName)) {
      throw new McpError(ErrorCode.InvalidRequest, `Script '${scriptName}' not in whitelist. Allowed: ${this.allowedScripts.join(', ')}`);
    }
    if (this.destructiveActions.includes(scriptName)) {
      await this.logAction('runScript', { scriptName }, 'DESTRUCTIVE ACTION ATTEMPTED');
      return { 
        content: [{ 
          type: 'text', 
          text: `⚠️  DESTRUCTIVE ACTION: ${scriptName}\n\nThis action requires manual confirmation.\nRun manually: npm run ${scriptName}` 
        }] 
      };
    }
    try {
      const output = execSync(`npm run ${scriptName}`, { encoding: 'utf-8', cwd: process.cwd() });
      await this.logAction('runScript', { scriptName }, output);
      return { content: [{ type: 'text', text: output }] };
    } catch (error) {
      await this.logAction('runScript', { scriptName }, `ERROR: ${error.message}`);
      throw new McpError(ErrorCode.InternalError, `Script failed: ${error.message}`);
    }
  }

  async checkDependencies() {
    try {
      const output = execSync('npm outdated --json', { encoding: 'utf-8', cwd: process.cwd() });
      const outdated = JSON.parse(output || '{}');
      const summary = Object.entries(outdated).map(([pkg, info]) => 
        `${pkg}: ${info.current} → ${info.latest} (wanted: ${info.wanted})`
      ).join('\n');
      return { content: [{ type: 'text', text: summary || 'All dependencies up to date' }] };
    } catch (error) {
      return { content: [{ type: 'text', text: 'All dependencies up to date' }] };
    }
  }

  async getEnvConfig() {
    try {
      const envFile = await fs.readFile('env/.env.example', 'utf-8');
      const keys = envFile.split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('=')[0]);
      return { content: [{ type: 'text', text: JSON.stringify({ requiredEnvVars: keys }, null, 2) }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to read env config: ${error.message}`);
    }
  }

  async listAgents() {
    try {
      const agents = await fs.readdir('.amazonq/agents');
      const agentDetails = [];
      for (const agent of agents.filter(f => f.endsWith('.json'))) {
        const content = JSON.parse(await fs.readFile(`.amazonq/agents/${agent}`, 'utf-8'));
        agentDetails.push({ name: agent, description: content.description || 'N/A' });
      }
      return { content: [{ type: 'text', text: JSON.stringify({ agents: agentDetails }, null, 2) }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list agents: ${error.message}`);
    }
  }

  async readServerFile(serverName) {
    try {
      const content = await fs.readFile(`servers/${serverName}`, 'utf-8');
      const preview = content.length > 2000 ? content.slice(0, 2000) + '\n\n... (truncated, ' + content.length + ' total chars)' : content;
      return { content: [{ type: 'text', text: preview }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to read server file: ${error.message}`);
    }
  }

  async deployService(environment) {
    await this.logAction('deployService', { environment }, 'DEPLOYMENT ATTEMPTED');
    return { 
      content: [{ 
        type: 'text', 
        text: `⚠️  DEPLOYMENT BLOCKED\n\nDeployments require manual approval for safety.\n\nTo deploy:\n1. Review changes: git status\n2. Run tests: npm test\n3. Deploy manually: npm run deploy:${environment}\n\nLog: docs/reports/mcp-audit.log` 
      }] 
    };
  }

  async backupData() {
    await this.logAction('backupData', {}, 'BACKUP ATTEMPTED');
    return { 
      content: [{ 
        type: 'text', 
        text: `⚠️  BACKUP BLOCKED\n\nBackups require manual approval.\n\nTo backup:\nnpm run backup:full\n\nLog: docs/reports/mcp-audit.log` 
      }] 
    };
  }

  async securityScan() {
    try {
      execSync('npm audit --json > docs/reports/security-audit.json', { cwd: process.cwd() });
      const auditData = JSON.parse(await fs.readFile('docs/reports/security-audit.json', 'utf-8'));
      const vulns = auditData.metadata.vulnerabilities;
      const summary = `Security Audit Complete:
- Critical: ${vulns.critical}
- High: ${vulns.high}
- Moderate: ${vulns.moderate}
- Low: ${vulns.low}
- Total: ${vulns.total}

Full report: docs/reports/security-audit.json`;
      await this.logAction('securityScan', {}, summary);
      return { content: [{ type: 'text', text: summary }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Security scan failed: ${error.message}`);
    }
  }

  async chaosTest() {
    await this.logAction('chaosTest', {}, 'CHAOS TEST ATTEMPTED');
    return { 
      content: [{ 
        type: 'text', 
        text: `⚠️  CHAOS TEST BLOCKED\n\nChaos tests can disrupt services and require manual approval.\n\nTo run:\nnpm run chaos:test\n\nLog: docs/reports/mcp-audit.log` 
      }] 
    };
  }

  async getMetrics() {
    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch('http://localhost:9090/metrics');
      const metrics = await response.text();
      return { content: [{ type: 'text', text: metrics.slice(0, 1000) + '\n...\nFull metrics at http://localhost:9090/metrics' }] };
    } catch (error) {
      return { content: [{ type: 'text', text: 'Metrics endpoint unavailable. Start Prometheus: http://localhost:9090/metrics' }] };
    }
  }

  async restartService(serviceName) {
    try {
      // Check if PM2 is available
      try {
        execSync('pm2 -v', { encoding: 'utf-8', stdio: 'ignore' });
        const output = execSync(`pm2 restart ${serviceName}`, { encoding: 'utf-8' });
        return { content: [{ type: 'text', text: `PM2: ${output}` }] };
      } catch {
        // PM2 not available
        return { 
          content: [{ 
            type: 'text', 
            text: `Cannot safely restart ${serviceName}.\n\nOptions:\n1. Install PM2: npm install -g pm2\n2. Use PM2: pm2 start servers/${serviceName} --name ${serviceName}\n3. Manual restart: node servers/${serviceName}\n\nNote: Automatic restart disabled to prevent killing unrelated Node processes.` 
          }] 
        };
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Restart failed: ${error.message}`);
    }
  }

  async getServerFiles() {
    try {
      const files = await fs.readdir('servers');
      return { content: [{ type: 'text', text: JSON.stringify({ serverFiles: files }, null, 2) }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list server files: ${error.message}`);
    }
  }

  checkDockerRunning() {
    try {
      execSync('docker ps', { encoding: 'utf-8' });
      return true;
    } catch {
      return false;
    }
  }

  isProcessRunning(processName) {
    const platform = os.platform();
    try {
      if (platform === 'win32') {
        const output = execSync(`tasklist /FI "IMAGENAME eq ${processName}" /FO CSV`, { encoding: 'utf-8' });
        return output.includes(processName);
      } else {
        const output = execSync(`ps aux | grep ${processName} | grep -v grep`, { encoding: 'utf-8' });
        return output.length > 0;
      }
    } catch {
      return false;
    }
  }

  async gitStatus() {
    const cacheKey = 'gitStatus';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 10000) {
      return cached.data;
    }

    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      const status = execSync('git status --short', { encoding: 'utf-8' });
      const uncommitted = status.split('\n').filter(l => l).length;
      const result = { content: [{ type: 'text', text: `Branch: ${branch}\nUncommitted changes: ${uncommitted}\n\n${status}` }] };
      
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Git status failed: ${error.message}`);
    }
  }

  async dockerStatus() {
    try {
      const output = execSync('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', { encoding: 'utf-8' });
      return { content: [{ type: 'text', text: output || 'No containers running' }] };
    } catch (error) {
      return { content: [{ type: 'text', text: 'Docker not running or not installed' }] };
    }
  }

  async k8sStatus() {
    try {
      const pods = execSync('kubectl get pods', { encoding: 'utf-8' });
      const services = execSync('kubectl get services', { encoding: 'utf-8' });
      return { content: [{ type: 'text', text: `PODS:\n${pods}\n\nSERVICES:\n${services}` }] };
    } catch (error) {
      return { content: [{ type: 'text', text: 'Kubernetes not configured or not running' }] };
    }
  }

  async testRunner(suite) {
    const allowedSuites = ['unit', 'integration', 'e2e', 'all'];
    if (!allowedSuites.includes(suite)) {
      throw new McpError(ErrorCode.InvalidRequest, `Invalid test suite. Allowed: ${allowedSuites.join(', ')}`);
    }
    try {
      const output = execSync(`npm run test:${suite}`, { encoding: 'utf-8', cwd: process.cwd() });
      await this.logAction('testRunner', { suite }, output);
      return { content: [{ type: 'text', text: output }] };
    } catch (error) {
      await this.logAction('testRunner', { suite }, `ERROR: ${error.message}`);
      throw new McpError(ErrorCode.InternalError, `Test failed: ${error.message}`);
    }
  }

  async buildProject(target) {
    try {
      const output = execSync(`npm run build --workspace=${target}`, { encoding: 'utf-8', cwd: process.cwd() });
      return { content: [{ type: 'text', text: `Build complete for ${target}\n${output}` }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Build failed: ${error.message}`);
    }
  }

  async monitorHealth() {
    try {
      // Try PM2 first
      try {
        execSync('pm2 -v', { encoding: 'utf-8', stdio: 'ignore' });
        const output = execSync('pm2 jlist', { encoding: 'utf-8' });
        const processes = JSON.parse(output);
        const health = processes.map(p => ({
          service: p.name,
          status: p.pm2_env.status,
          uptime: Math.floor(p.pm2_env.pm_uptime / 1000) + 's',
          memory: Math.floor(p.monit.memory / 1024 / 1024) + 'MB',
          cpu: p.monit.cpu + '%'
        }));
        return { content: [{ type: 'text', text: JSON.stringify({ pm2: true, services: health }, null, 2) }] };
      } catch {
        // Fallback to basic check
        const servers = await fs.readdir('servers');
        const health = servers.filter(f => f.endsWith('.js')).map(server => ({
          service: server,
          status: 'unknown',
          note: 'Install PM2 for detailed monitoring: npm install -g pm2'
        }));
        return { content: [{ type: 'text', text: JSON.stringify({ pm2: false, services: health }, null, 2) }] };
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Health check failed: ${error.message}`);
    }
  }

  async viewDocs(docName) {
    try {
      const content = await fs.readFile(`docs/${docName}`, 'utf-8');
      return { content: [{ type: 'text', text: content.slice(0, 2000) + '\n\n... (truncated)' }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to read docs: ${error.message}`);
    }
  }

  async configValidator() {
    try {
      const configs = ['package.json', 'mcp-config.json', '.eslintrc.json'];
      const results = [];
      for (const config of configs) {
        try {
          JSON.parse(await fs.readFile(config, 'utf-8'));
          results.push(`✓ ${config}`);
        } catch {
          results.push(`✗ ${config} - Invalid JSON`);
        }
      }
      return { content: [{ type: 'text', text: results.join('\n') }] };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Validation failed: ${error.message}`);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hootner MCP Server started');
  }
}

const server = new HootnerMCPServer();
server.start().catch(console.error);