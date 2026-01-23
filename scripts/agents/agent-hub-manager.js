#!/usr/bin/env node

/**
 * Agent Hub Manager - State-of-the-Art Management Interface
 * Provides start/stop/monitor capabilities for 75+ AI agents
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import enhancedAgentHub from './enhanced-agent-hub.js';

class AgentHubManager {
    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new Server(this.httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });
        this.port = process.env.AGENT_HUB_PORT || 9001;
        this.agentHub = enhancedAgentHub;
        this.metrics = {
            startTime: Date.now(),
            totalRequests: 0,
            totalErrors: 0,
            averageResponseTime: 0,
            cpuUsage: 0,
            memoryUsage: 0
        };
        this.agentLogs = [];
        this.maxLogs = 1000;
        this.monitoringInterval = null;
    }

    initialize() {
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.agentHub.initialize();
        this.startMonitoring();
        this.startServer();
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        this.app.use((req, res, next) => {
            this.metrics.totalRequests++;
            const start = Date.now();
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.updateAverageResponseTime(duration);
            });
            next();
        });
    }

    setupRoutes() {
        // Dashboard route
        this.app.get('/', (req, res) => {
            res.send(this.generateDashboardHTML());
        });

        // API routes
        this.app.get('/api/status', (req, res) => {
            res.json({
                success: true,
                data: this.getCompleteStatus()
            });
        });

        this.app.get('/api/agents', (req, res) => {
            res.json({
                success: true,
                data: this.agentHub.listAgents()
            });
        });

        this.app.get('/api/agents/:agentName', (req, res) => {
            const agent = this.agentHub.agents.get(req.params.agentName);
            if (!agent) {
                return res.status(404).json({ success: false, error: 'Agent not found' });
            }
            res.json({ success: true, data: agent });
        });

        this.app.post('/api/agents/:agentName/start', (req, res) => {
            try {
                this.startAgent(req.params.agentName);
                this.logEvent('info', `Agent ` + req.params.agentName + ` started`);
                res.json({ success: true, message: 'Agent started' });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/agents/:agentName/stop', (req, res) => {
            try {
                this.stopAgent(req.params.agentName);
                this.logEvent('warning', `Agent ` + req.params.agentName + ` stopped`);
                res.json({ success: true, message: 'Agent stopped' });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/agents/:agentName/restart', (req, res) => {
            try {
                this.restartAgent(req.params.agentName);
                this.logEvent('info', `Agent ` + req.params.agentName + ` restarted`);
                res.json({ success: true, message: 'Agent restarted' });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/agents/bulk/start', (req, res) => {
            try {
                const { agentType } = req.body;
                const count = this.bulkStartAgents(agentType);
                this.logEvent('info', `Started ${count} agents of type ` + agentType + ``);
                res.json({ success: true, message: `Started ` + count + ` agents` });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/agents/bulk/stop', (req, res) => {
            try {
                const { agentType } = req.body;
                const count = this.bulkStopAgents(agentType);
                this.logEvent('warning', `Stopped ${count} agents of type ` + agentType + ``);
                res.json({ success: true, message: `Stopped ` + count + ` agents` });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/logs', (req, res) => {
            const limit = parseInt(req.query.limit) || 100;
            res.json({
                success: true,
                data: this.agentLogs.slice(-limit)
            });
        });

        this.app.get('/api/metrics', (req, res) => {
            res.json({
                success: true,
                data: this.getMetrics()
            });
        });

        this.app.post('/api/health-check', (req, res) => {
            const health = this.performHealthCheck();
            res.json({ success: true, data: health });
        });

        // Production agent action endpoints
        this.app.post('/api/agents/:agentName/execute', async (req, res) => {
            try {
                const { agentName } = req.params;
                const { action, args } = req.body;

                const result = await this.agentHub.executeAgentAction(agentName, action, ...args);
                this.logEvent('info', `Executed ${action} on ` + agentName + ``);

                res.json({ success: true, data: result });
            } catch (error) {
                this.metrics.totalErrors++;
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Specific agent actions
        this.app.post('/api/personalization/recommend', async (req, res) => {
            try {
                const { userId, contentType } = req.body;
                const agent = this.agentHub.agentInstances.get('personalization-agent');
                if (!agent) {
                    return res.status(503).json({ success: false, error: 'Agent not available' });
                }
                const result = await agent.personalizeContent(userId, contentType);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/moderation/check', async (req, res) => {
            try {
                const { content, contentId, contentType } = req.body;
                const agent = this.agentHub.agentInstances.get('content-moderation-ai');
                if (!agent) {
                    return res.status(503).json({ success: false, error: 'Agent not available' });
                }
                const result = await agent.moderateContent(content, contentId, contentType);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.post('/api/fraud/analyze', async (req, res) => {
            try {
                const transaction = req.body;
                const agent = this.agentHub.agentInstances.get('payment-fraud-detection-agent');
                if (!agent) {
                    return res.status(503).json({ success: false, error: 'Agent not available' });
                }
                const result = await agent.analyzeTransaction(transaction);
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        this.app.get('/api/revenue/metrics', async (req, res) => {
            try {
                const agent = this.agentHub.agentInstances.get('revenue-optimization');
                if (!agent) {
                    return res.status(503).json({ success: false, error: 'Agent not available' });
                }
                const result = await agent.analyzeRevenue();
                res.json({ success: true, data: result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('🔌 Client connected to Agent Hub Manager');

            // Send initial data
            socket.emit('status', this.getCompleteStatus());
            socket.emit('metrics', this.getMetrics());
            socket.emit('logs', this.agentLogs.slice(-50));

            socket.on('start-agent', (agentName) => {
                try {
                    this.startAgent(agentName);
                    this.io.emit('agent-updated', { agentName, status: 'active' });
                } catch (error) {
                    socket.emit('error', error.message);
                }
            });

            socket.on('stop-agent', (agentName) => {
                try {
                    this.stopAgent(agentName);
                    this.io.emit('agent-updated', { agentName, status: 'stopped' });
                } catch (error) {
                    socket.emit('error', error.message);
                }
            });

            socket.on('disconnect', () => {
                console.log('🔌 Client disconnected from Agent Hub Manager');
            });
        });
    }

    startAgent(agentName) {
        const agent = this.agentHub.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ` + agentName + ` not found`);
        }
        agent.status = 'active';
        agent.startTime = Date.now();
        agent.requestCount = 0;
        agent.errorCount = 0;
        this.io.emit('agent-updated', { agentName, status: 'active' });
    }

    stopAgent(agentName) {
        const agent = this.agentHub.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ` + agentName + ` not found`);
        }
        agent.status = 'stopped';
        agent.stopTime = Date.now();
        this.io.emit('agent-updated', { agentName, status: 'stopped' });
    }

    restartAgent(agentName) {
        this.stopAgent(agentName);
        setTimeout(() => this.startAgent(agentName), 100);
    }

    bulkStartAgents(agentType) {
        let count = 0;
        this.agentHub.agents.forEach((agent, name) => {
            if (agent.type === agentType && agent.status !== 'active') {
                this.startAgent(name);
                count++;
            }
        });
        return count;
    }

    bulkStopAgents(agentType) {
        let count = 0;
        this.agentHub.agents.forEach((agent, name) => {
            if (agent.type === agentType && agent.status === 'active') {
                this.stopAgent(name);
                count++;
            }
        });
        return count;
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.io.emit('metrics', this.getMetrics());
            this.io.emit('status', this.getCompleteStatus());

            // Perform periodic health check
            const health = this.performHealthCheck();
            if (health.status === 'unhealthy') {
                this.logEvent('error', `Health check failed: ` + health.issues.join(', ') + ``);
            }
        }, 5000); // Update every 5 seconds
    }

    updateMetrics() {
        const usage = process.memoryUsage();
        this.metrics.memoryUsage = Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100;

        // Simulate CPU usage (in production, use actual CPU metrics)
        const cpuUsage = process.cpuUsage();
        this.metrics.cpuUsage = Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100) / 100;
    }

    updateAverageResponseTime(duration) {
        const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
        this.metrics.averageResponseTime = Math.round((total + duration) / this.metrics.totalRequests);
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: Math.floor((Date.now() - this.metrics.startTime) / 1000),
            errorRate: this.metrics.totalRequests > 0
                ? ((this.metrics.totalErrors / this.metrics.totalRequests) * 100).toFixed(2)
                : 0
        };
    }

    getCompleteStatus() {
        const hubStatus = this.agentHub.getStatus();
        const agentsByType = this.agentHub.listAgents();
        const typeStats = {};

        Object.keys(agentsByType).forEach(type => {
            const agents = agentsByType[type];
            typeStats[type] = {
                total: agents.length,
                active: agents.filter(name => {
                    const agent = this.agentHub.agents.get(name);
                    return agent && agent.status === 'active';
                }).length
            };
        });

        return {
            ...hubStatus,
            typeStats,
            timestamp: Date.now()
        };
    }

    performHealthCheck() {
        const issues = [];
        const status = {
            healthy: true,
            issues: []
        };

        // Check memory usage
        if (this.metrics.memoryUsage > 512) {
            issues.push('High memory usage detected');
        }

        // Check error rate
        const errorRate = (this.metrics.totalErrors / Math.max(this.metrics.totalRequests, 1)) * 100;
        if (errorRate > 5) {
            issues.push(`High error rate: ` + errorRate.toFixed(2) + `%`);
        }

        // Check agent status
        let inactiveAgents = 0;
        this.agentHub.agents.forEach(agent => {
            if (agent.status !== 'active') inactiveAgents++;
        });

        if (inactiveAgents > 10) {
            issues.push(`` + inactiveAgents + ` agents are inactive`);
        }

        status.issues = issues;
        status.healthy = issues.length === 0;
        status.status = issues.length === 0 ? 'healthy' : 'unhealthy';
        status.timestamp = Date.now();

        return status;
    }

    logEvent(level, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message
        };

        this.agentLogs.push(logEntry);

        // Keep only last N logs
        if (this.agentLogs.length > this.maxLogs) {
            this.agentLogs = this.agentLogs.slice(-this.maxLogs);
        }

        // Emit to connected clients
        this.io.emit('log', logEntry);

        // Console output with colors
        const colors = {
            info: '\x1b[36m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            success: '\x1b[32m'
        };
        const reset = '\x1b[0m';
        console.log(`${colors[level] || ''}[${level.toUpperCase()}] ${message}` + reset + ``);
    }

    generateDashboardHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🤖 Agent Hub Manager - HOOTNER</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      background: rgba(255, 255, 255, 0.95);
      padding: 30px;
      border-radius: 20px;
      margin-bottom: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 2.5em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 1.1em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: rgba(255, 255, 255, 0.95);
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
    }
    .card-title {
      font-size: 1.2em;
      font-weight: 600;
      color: #333;
    }
    .metric-value {
      font-size: 2.5em;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .metric-label {
      color: #666;
      font-size: 0.9em;
      margin-top: 5px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .status-active { background: #10b981; color: white; }
    .status-stopped { background: #ef4444; color: white; }
    .status-healthy { background: #10b981; color: white; }
    .status-unhealthy { background: #ef4444; color: white; }
    .agent-list {
      max-height: 400px;
      overflow-y: auto;
    }
    .agent-item {
      padding: 12px;
      margin-bottom: 10px;
      background: #f8fafc;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s ease;
    }
    .agent-item:hover {
      background: #e2e8f0;
    }
    .agent-name {
      font-weight: 500;
      color: #333;
    }
    .agent-type {
      color: #64748b;
      font-size: 0.85em;
      margin-left: 10px;
    }
    .agent-controls {
      display: flex;
      gap: 5px;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      font-size: 0.85em;
    }
    .btn-start { background: #10b981; color: white; }
    .btn-stop { background: #ef4444; color: white; }
    .btn-restart { background: #f59e0b; color: white; }
    .btn-bulk { background: #667eea; color: white; padding: 10px 20px; margin: 5px; }
    button:hover { transform: scale(1.05); opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .logs-container {
      background: #1e293b;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 10px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .log-entry {
      margin-bottom: 8px;
      padding: 5px;
      border-left: 3px solid #64748b;
      padding-left: 10px;
    }
    .log-info { border-left-color: #3b82f6; }
    .log-warning { border-left-color: #f59e0b; }
    .log-error { border-left-color: #ef4444; }
    .log-success { border-left-color: #10b981; }
    .chart-container {
      position: relative;
      height: 300px;
      margin-top: 20px;
    }
    .bulk-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 10px;
      margin-top: 15px;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse { animation: pulse 2s infinite; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🤖 Agent Hub Manager</h1>
      <p class="subtitle">Real-time monitoring and control for 75+ AI agents</p>
    </header>

    <div class="grid">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Total Agents</span>
          <span class="status-badge status-active" id="status-badge">Active</span>
        </div>
        <div class="metric-value" id="total-agents">75</div>
        <div class="metric-label">Active: <span id="active-agents">75</span></div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">System Health</span>
        </div>
        <div class="metric-value" id="health-status">✓</div>
        <div class="metric-label">Status: <span id="health-label">Healthy</span></div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Requests</span>
        </div>
        <div class="metric-value" id="total-requests">0</div>
        <div class="metric-label">Error Rate: <span id="error-rate">0%</span></div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Performance</span>
        </div>
        <div class="metric-value" id="avg-response">0ms</div>
        <div class="metric-label">Memory: <span id="memory-usage">0 MB</span></div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Agent Categories</span>
        </div>
        <div id="category-stats"></div>
        <div class="bulk-controls">
          <button class="btn-bulk" onclick="bulkStart('core')">▶ Start Core</button>
          <button class="btn-bulk" onclick="bulkStop('core')">⏸ Stop Core</button>
          <button class="btn-bulk" onclick="bulkStart('business')">▶ Start Business</button>
          <button class="btn-bulk" onclick="bulkStop('business')">⏸ Stop Business</button>
          <button class="btn-bulk" onclick="bulkStart('security')">▶ Start Security</button>
          <button class="btn-bulk" onclick="bulkStop('security')">⏸ Stop Security</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Active Agents</span>
        </div>
        <div class="agent-list" id="agent-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Performance Metrics</span>
      </div>
      <div class="chart-container">
        <canvas id="metricsChart"></canvas>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">📜 Activity Logs</span>
      </div>
      <div class="logs-container" id="logs"></div>
    </div>
  </div>

  <script>
    const socket = io();
    let metricsData = { labels: [], requests: [], errors: [], memory: [] };
    let chart;

    // Initialize chart
    const ctx = document.getElementById('metricsChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Requests',
            data: [],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4
          },
          {
            label: 'Memory (MB)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Socket listeners
    socket.on('status', (data) => {
      document.getElementById('total-agents').textContent = data.totalAgents;
      document.getElementById('active-agents').textContent = data.activeAgents;

      // Update category stats
      const categoryStats = document.getElementById('category-stats');
      categoryStats.innerHTML = '';
      Object.entries(data.typeStats || {}).forEach(([type, stats]) => {
        categoryStats.innerHTML += \`
          <div style="margin-bottom: 10px; padding: 10px; background: #f8fafc; border-radius: 5px;">
            <strong style="text-transform: capitalize;">\${type}</strong>:
            \${stats.active}/\${stats.total} active
          </div>
        \`;
      });
    });

    socket.on('metrics', (data) => {
      document.getElementById('total-requests').textContent = data.totalRequests;
      document.getElementById('error-rate').textContent = data.errorRate + '%';
      document.getElementById('avg-response').textContent = data.averageResponseTime + 'ms';
      document.getElementById('memory-usage').textContent = data.memoryUsage + ' MB';

      // Update chart
      const time = new Date().toLocaleTimeString();
      if (metricsData.labels.length > 20) {
        metricsData.labels.shift();
        metricsData.requests.shift();
        metricsData.memory.shift();
      }
      metricsData.labels.push(time);
      metricsData.requests.push(data.totalRequests);
      metricsData.memory.push(data.memoryUsage);

      chart.data.labels = metricsData.labels;
      chart.data.datasets[0].data = metricsData.requests;
      chart.data.datasets[1].data = metricsData.memory;
      chart.update('none');
    });

    socket.on('logs', (logs) => {
      const logsContainer = document.getElementById('logs');
      logsContainer.innerHTML = logs.map(log =>
        \`<div class="log-entry log-\${log.level}">[\${new Date(log.timestamp).toLocaleTimeString()}] \` + log.message + `</div>\`
      ).join('');
      logsContainer.scrollTop = logsContainer.scrollHeight;
    });

    socket.on('log', (log) => {
      const logsContainer = document.getElementById('logs');
      const logEntry = document.createElement('div');
      logEntry.className = \`log-entry log-\` + log.level + `\`;
      logEntry.textContent = \`[\${new Date(log.timestamp).toLocaleTimeString()}] \` + log.message + `\`;
      logsContainer.appendChild(logEntry);
      logsContainer.scrollTop = logsContainer.scrollHeight;
    });

    socket.on('agent-updated', (data) => {
      loadAgents();
    });

    // Load agents
    async function loadAgents() {
      const response = await fetch('/api/agents');
      const { data } = await response.json();
      const agentList = document.getElementById('agent-list');
      agentList.innerHTML = '';

      Object.entries(data).forEach(([type, agents]) => {
        agents.forEach(agentName => {
          fetch(\`/api/agents/\` + agentName + `\`)
            .then(r => r.json())
            .then(({ data: agent }) => {
              const item = document.createElement('div');
              item.className = 'agent-item';
              item.innerHTML = \`
                <div>
                  <span class="agent-name">\${agentName}</span>
                  <span class="agent-type">[\${type}]</span>
                  <span class="status-badge status-\${agent.status}">\${agent.status}</span>
                </div>
                <div class="agent-controls">
                  <button class="btn-start" onclick="startAgent('\${agentName}')" \${agent.status === 'active' ? 'disabled' : ''}>▶</button>
                  <button class="btn-stop" onclick="stopAgent('\${agentName}')" \${agent.status === 'stopped' ? 'disabled' : ''}>⏸</button>
                  <button class="btn-restart" onclick="restartAgent('\` + agentName + `')">↻</button>
                </div>
              \`;
              agentList.appendChild(item);
            });
        });
      });
    }

    async function startAgent(name) {
      await fetch(\`/api/agents/\` + name + `/start\`, { method: 'POST' });
    }

    async function stopAgent(name) {
      await fetch(\`/api/agents/\` + name + `/stop\`, { method: 'POST' });
    }

    async function restartAgent(name) {
      await fetch(\`/api/agents/\` + name + `/restart\`, { method: 'POST' });
    }

    async function bulkStart(type) {
      await fetch('/api/agents/bulk/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType: type })
      });
    }

    async function bulkStop(type) {
      await fetch('/api/agents/bulk/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentType: type })
      });
    }

    // Initial load
    loadAgents();

    // Auto-refresh agents every 10 seconds
    setInterval(loadAgents, 10000);
  </script>
</body>
</html>
    `;
    }

    startServer() {
        this.httpServer.listen(this.port, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🤖 Agent Hub Manager - State-of-the-Art Interface');
            console.log('='.repeat(60));
            console.log(`📊 Dashboard: http://localhost:` + this.port + ``);
            console.log(`🔌 WebSocket: ws://localhost:` + this.port + ``);
            console.log(`🌐 API: http://localhost:` + this.port + `/api`);
            console.log('='.repeat(60));
            console.log(`✅ Managing ` + this.agentHub.agents.size + ` AI agents`);
            console.log('='.repeat(60) + '\n');

            this.logEvent('success', 'Agent Hub Manager started successfully');
        });
    }

    shutdown() {
        console.log('\n🛑 Shutting down Agent Hub Manager...');

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.io.close();
        this.httpServer.close(() => {
            console.log('✅ Agent Hub Manager shut down gracefully');
            process.exit(0);
        });
    }
}

// Handle graceful shutdown
const manager = new AgentHubManager();

process.on('SIGTERM', () => manager.shutdown());
process.on('SIGINT', () => manager.shutdown());

// Start the manager
manager.initialize();

export default manager;
