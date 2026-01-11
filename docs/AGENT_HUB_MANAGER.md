# 🤖 Agent Hub Manager - State-of-the-Art Management Interface

Complete management interface for HOOTNER's 75+ AI agents with real-time monitoring, control, and analytics.

## 🌟 Features

### Real-Time Dashboard
- **Live Metrics** - Request rates, error rates, memory usage, CPU usage
- **Visual Charts** - Performance graphs with Chart.js
- **Agent Status** - Real-time status updates via WebSocket
- **Health Monitoring** - Automated health checks every 5 seconds

### Agent Control
- **Individual Control** - Start/Stop/Restart any agent
- **Bulk Operations** - Control entire agent categories at once
- **Status Tracking** - Active, stopped, request counts, error rates
- **Live Updates** - Instant UI updates via Socket.io

### Monitoring & Analytics
- **Activity Logs** - Real-time log streaming with color coding
- **Performance Metrics** - CPU, memory, response times, error rates
- **Category Stats** - Breakdown by agent type (Core, Business, Security, etc.)
- **Health Reports** - Automated system health assessments

### Developer Tools
- **RESTful API** - Complete API for programmatic access
- **CLI Interface** - Command-line tool for quick operations
- **WebSocket Support** - Real-time bidirectional communication
- **Interactive Mode** - Terminal-based interactive menu

## 🚀 Quick Start

### Web Dashboard

```bash
# Start the manager
node agent-hub-manager.js

# Access dashboard
open http://localhost:9001
```

### CLI Tool

```bash
# List all agents
node agent-hub-cli.js list

# Show status
node agent-hub-cli.js status

# Start an agent
node agent-hub-cli.js start personalization-agent

# Stop an agent
node agent-hub-cli.js stop security-service

# Bulk operations
node agent-hub-cli.js bulk-start core
node agent-hub-cli.js bulk-stop security

# Interactive mode
node agent-hub-cli.js interactive

# Health check
node agent-hub-cli.js health
```

## 📊 Dashboard Overview

### Main Metrics
- **Total Agents** - Count of all agents with active/inactive breakdown
- **System Health** - Overall health status with automated checks
- **Requests** - Total request count with error rate percentage
- **Performance** - Average response time and memory usage

### Agent Categories
- **Core AI (12)** - Personalization, ML, NLP, Computer Vision
- **Business Intelligence (15)** - Revenue, Analytics, Pricing
- **Security & Compliance (18)** - Fraud detection, GDPR, Penetration testing
- **Infrastructure (20)** - Auto-scaling, CDN, Database sharding
- **Specialized Services (10)** - Localization, Voice, Blockchain integration

### Real-Time Features
- **Live Agent List** - All agents with individual controls
- **Performance Charts** - Line charts showing requests and memory over time
- **Activity Logs** - Color-coded log stream (info, warning, error, success)
- **Bulk Controls** - Quick start/stop buttons for entire categories

## 🔌 API Reference

### GET Endpoints

```bash
# Get complete status
GET /api/status

# List all agents by type
GET /api/agents

# Get specific agent info
GET /api/agents/:agentName

# Get activity logs
GET /api/logs?limit=100

# Get performance metrics
GET /api/metrics
```

### POST Endpoints

```bash
# Start an agent
POST /api/agents/:agentName/start

# Stop an agent
POST /api/agents/:agentName/stop

# Restart an agent
POST /api/agents/:agentName/restart

# Bulk start agents
POST /api/agents/bulk/start
Body: { "agentType": "core" }

# Bulk stop agents
POST /api/agents/bulk/stop
Body: { "agentType": "security" }

# Health check
POST /api/health-check
```

## 🔧 Configuration

### Environment Variables

```bash
# Set custom port (default: 9001)
AGENT_HUB_PORT=9001

# Set monitoring interval (default: 5000ms)
MONITORING_INTERVAL=5000

# Set max log entries (default: 1000)
MAX_LOGS=1000
```

### Programmatic Usage

```javascript
import AgentHubManager from './agent-hub-manager.js';

const manager = new AgentHubManager();
manager.initialize();

// Access agent hub
manager.agentHub.getStatus();

// Manual operations
manager.startAgent('personalization-agent');
manager.stopAgent('security-service');
manager.bulkStartAgents('core');

// Get metrics
const metrics = manager.getMetrics();
const health = manager.performHealthCheck();
```

## 📈 Monitoring

### Health Checks
Automated health monitoring checks for:
- **Memory Usage** - Alerts if memory exceeds 512MB
- **Error Rate** - Alerts if error rate exceeds 5%
- **Inactive Agents** - Alerts if more than 10 agents are inactive

### Performance Metrics
- **Request Rate** - Total requests over time
- **Response Time** - Average response time in milliseconds
- **Error Rate** - Percentage of failed requests
- **Memory Usage** - Heap memory consumption in MB
- **CPU Usage** - CPU utilization percentage
- **Uptime** - Total system uptime in seconds

### Activity Logging
Four log levels with color coding:
- **Info** (Blue) - General information and status updates
- **Warning** (Yellow) - Non-critical issues and agent stops
- **Error** (Red) - Errors and failures
- **Success** (Green) - Successful operations and starts

## 🎨 UI Features

### Modern Design
- **Gradient Background** - Purple gradient theme
- **Glassmorphism** - Frosted glass effect cards
- **Smooth Animations** - Hover effects and transitions
- **Responsive Layout** - Grid-based responsive design
- **Live Updates** - Real-time UI updates without refresh

### Visual Indicators
- **Status Badges** - Color-coded status (green=active, red=stopped)
- **Metric Cards** - Large, easy-to-read metric displays
- **Progress Indicators** - Visual feedback for operations
- **Chart Visualizations** - Line charts for trends

## 🔐 Security

### Built-in Protections
- **CORS Support** - Configurable cross-origin resource sharing
- **Request Tracking** - All requests logged and tracked
- **Error Handling** - Comprehensive error catching and reporting
- **Graceful Shutdown** - Clean shutdown on SIGTERM/SIGINT

### Best Practices
- Run behind reverse proxy (nginx) in production
- Enable authentication for production deployments
- Use HTTPS for secure communications
- Implement rate limiting for API endpoints

## 🧪 Testing

```bash
# Test health check
curl http://localhost:9001/api/health-check -X POST

# Test status endpoint
curl http://localhost:9001/api/status

# Test agent operations
curl http://localhost:9001/api/agents/personalization-agent/start -X POST
curl http://localhost:9001/api/agents/personalization-agent/stop -X POST

# Test bulk operations
curl http://localhost:9001/api/agents/bulk/start -X POST \
  -H "Content-Type: application/json" \
  -d '{"agentType":"core"}'
```

## 📱 CLI Commands

### Basic Commands
```bash
agent-hub list                          # List all agents
agent-hub list -t core                  # List core agents only
agent-hub list -s active                # List active agents only
agent-hub status                        # Show overall status
agent-hub health                        # Perform health check
```

### Agent Operations
```bash
agent-hub start <agent>                 # Start specific agent
agent-hub stop <agent>                  # Stop specific agent
agent-hub restart <agent>               # Restart specific agent
agent-hub info <agent>                  # Show agent details
```

### Bulk Operations
```bash
agent-hub bulk-start core               # Start all core agents
agent-hub bulk-stop security            # Stop all security agents
agent-hub bulk-start business           # Start all business agents
```

### Interactive Mode
```bash
agent-hub interactive                   # Launch interactive menu
```

## 🚀 Production Deployment

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 9001
CMD ["node", "agent-hub-manager.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  agent-hub-manager:
    build: .
    ports:
      - "9001:9001"
    environment:
      - NODE_ENV=production
      - AGENT_HUB_PORT=9001
    restart: unless-stopped
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-hub-manager
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: manager
        image: hootner/agent-hub-manager:latest
        ports:
        - containerPort: 9001
        env:
        - name: AGENT_HUB_PORT
          value: "9001"
```

## 🎯 Use Cases

### Development
- Monitor agent status during development
- Test individual agent behaviors
- Debug agent interactions
- Validate agent performance

### Operations
- Monitor production agent health
- Respond to incidents quickly
- Perform bulk operations
- Track system metrics

### Analysis
- Analyze agent performance trends
- Identify problematic agents
- Optimize resource usage
- Generate health reports

## 🔄 Integration

### With Main Orchestration System

```javascript
// Example integration with agent-hub-manager.js
import AgentHubManager from './agent-hub-manager.js';

const hubManager = new AgentHubManager();
await hubManager.initialize();

// Access agent hub functionality
const status = hubManager.agentHub.getStatus();
console.log('Agent Hub Status:', status);

// Start specific agents programmatically
hubManager.startAgent('personalization-agent');
hubManager.bulkStartAgents('security');
```

### With Monitoring Stack

```javascript
// Export metrics to Prometheus
app.get('/metrics', (req, res) => {
  const metrics = manager.getMetrics();
  res.set('Content-Type', 'text/plain');
  res.send(`
    agent_hub_requests_total ${metrics.totalRequests}
    agent_hub_errors_total ${metrics.totalErrors}
    agent_hub_memory_mb ${metrics.memoryUsage}
    agent_hub_uptime_seconds ${metrics.uptime}
  `);
});
```

## 📚 Resources

- [Enhanced Agent Hub Source](../enhanced-agent-hub.js)
- [Agent Hub Manager Source](../agent-hub-manager.js)
- [Agent Hub CLI Source](../agent-hub-cli.js)
- [AI Agent Orchestration](./AI_AGENT_ORCHESTRATION.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change port
AGENT_HUB_PORT=9002 node agent-hub-manager.js
```

### WebSocket Connection Issues
- Check firewall settings
- Verify CORS configuration
- Ensure port is accessible

### High Memory Usage
- Reduce MAX_LOGS setting
- Increase monitoring interval
- Review agent resource consumption

### Agents Not Starting
- Check agent hub initialization
- Verify agent names are correct
- Review activity logs for errors

## 🤝 Contributing

Contributions welcome! Please:
1. Test thoroughly with CLI and web interface
2. Add tests for new features
3. Update documentation
4. Follow existing code style

## 📄 License

MIT License - See [LICENSE](../LICENSE)

---

**Made with 🤖 by the HOOTNER Team**
