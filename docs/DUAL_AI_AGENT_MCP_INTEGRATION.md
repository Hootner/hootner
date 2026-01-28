# 🤖 Dual AI Agent MCP Server Integration

## Overview

The HOOTNER platform now features a fully integrated dual AI agent system that connects GitHub Copilot and Amazon Q through Model Context Protocol (MCP) servers, coordinated by an Enhanced Agent Hub managing 75+ specialized agents.

## Architecture

```
🦉 HOOTNER Dual AI System
├── 🧠 Dual Agent Orchestrator
│   ├── GitHub Copilot (Code completion, refactoring)
│   └── Amazon Q (AWS integration, security)
├── 🌐 Enhanced MCP Server
│   ├── Tool routing & coordination
│   └── Cross-agent communication
└── 🚀 Enhanced Agent Hub (75+ Agents)
    ├── Core AI Agents (12)
    ├── Business Intelligence (15)
    ├── Security & Compliance (18)
    ├── Infrastructure & Operations (20)
    └── Specialized Services (10)
```

## Quick Start

### 1. Start the Dual Agent System
```bash
npm run dual-agent:start
```

### 2. Check Agent Status
```bash
npm run dual-agent:status
```

### 3. Run Connection Tests
```bash
npm run dual-agent:test
```

### 4. Demo MCP Integration
```bash
npm run mcp:demo
```

## Key Features

### ✅ Intelligent Routing
- **Code tasks** → GitHub Copilot
- **AWS tasks** → Amazon Q
- **Security tasks** → Security agents
- **Analytics tasks** → Business Intelligence agents
- **Automatic fallback** between agents

### ✅ 75+ Specialized Agents
- **Real implementations** with actual functionality
- **Auto-start production agents**
- **Event-driven communication**
- **Metrics and monitoring**

### ✅ MCP Server Integration
- **Unified communication protocol**
- **Cross-agent task coordination**
- **Tool discovery and execution**
- **Session management**

## Request Routing Examples

### Code Completion (→ GitHub Copilot)
```javascript
{
  type: 'inline-code',
  query: 'Generate async function for user authentication',
  context: { language: 'javascript' }
}
```

### AWS Infrastructure (→ Amazon Q)
```javascript
{
  type: 'aws-specific',
  query: 'Setup S3 bucket with CloudFront distribution',
  context: { region: 'us-east-1' }
}
```

### Security Audit (→ Security Agent)
```javascript
{
  type: 'security-audit',
  query: 'Scan for SQL injection vulnerabilities',
  context: { files: ['src/api/*.js'] }
}
```

## MCP Tools Available

### `dual_agent_route`
Route requests through the dual agent system
```javascript
await client.callTool({
  name: 'dual_agent_route',
  arguments: {
    type: 'inline-code',
    query: 'Generate React component',
    context: {}
  }
});
```

### `agent_hub_status`
Get status of all 75+ agents
```javascript
await client.callTool({
  name: 'agent_hub_status',
  arguments: {}
});
```

### `execute_agent_action`
Execute specific action on a named agent
```javascript
await client.callTool({
  name: 'execute_agent_action',
  arguments: {
    agentName: 'security-service',
    action: 'performSecurityScan',
    args: []
  }
});
```

## Agent Categories

### 🧠 Core AI Agents (12)
- `personalization-agent` - User personalization
- `recommendation-ml` - ML recommendations
- `content-moderation-ai` - Content moderation
- `computer-vision` - Image/video analysis
- `sentiment-analysis` - Text sentiment
- And 7 more...

### 💼 Business Intelligence (15)
- `revenue-optimization` - Revenue analysis
- `pricing-algorithms` - Dynamic pricing
- `performance-monitor` - Performance tracking
- `ab-testing` - A/B test management
- And 11 more...

### 🔒 Security & Compliance (18)
- `security-service` - Threat detection
- `payment-fraud-detection-agent` - Fraud prevention
- `gdpr-compliance-tools` - GDPR compliance
- `penetration-testing` - Security testing
- And 14 more...

### 🏗️ Infrastructure & Operations (20)
- `auto-scaling` - Auto-scaling management
- `load-testing-tools` - Performance testing
- `health-checks` - System health
- `cdn-management` - CDN optimization
- And 16 more...

### 🎯 Specialized Services (10)
- `multi-language-support` - Internationalization
- `voice-assistants` - Voice interfaces
- `blockchain-integration` - Blockchain services
- `crm-integration` - CRM connectivity
- And 6 more...

## Configuration

### Event Bus Integration
The system uses an event bus for inter-agent communication:

```javascript
// Subscribe to agent requests
eventBus.subscribe('agent:request', handleAgentRequest);

// Publish agent responses
eventBus.publish({
  type: 'agent:response',
  correlationId: event.correlationId,
  payload: { success: true, result }
});
```

### MCP Server Setup
Each agent category has its own MCP server configuration:

```javascript
const mcpServer = new Server({
  name: 'github-copilot-mcp',
  version: '1.0.0'
}, {
  capabilities: { tools: {} }
});
```

## Monitoring & Stats

### Get Comprehensive Stats
```bash
npm run dual-agent:status
```

Example output:
```
📊 Agent Status:
   GitHub Copilot: ACTIVE
   Amazon Q: ACTIVE
   Enhanced Agent Hub: 75 agents

📈 Enhanced Stats:
   copilot: 42 requests
   amazonQ: 18 requests
   fallbacks: 2
   connectedAgents: 75
   agentHub: 72/75 active
```

## Troubleshooting

### Check System Health
```bash
npm run dual-agent:test
```

### Common Issues

1. **MCP Connection Failed**
   ```bash
   # Restart the enhanced MCP server
   npm run mcp:enhanced
   ```

2. **Agent Hub Not Connected**
   ```bash
   # Check agent status
   npm run agents:status
   
   # Restart dual agent system
   npm run dual-agent:start
   ```

3. **Routing Issues**
   ```bash
   # Run connection tests
   npm run dual-agent:test
   
   # Check orchestrator stats
   npm run dual-agent:status
   ```

## Development

### Adding New Agents
1. Create agent class extending `BaseAgent`
2. Add to `production-agent-implementations.js`
3. Register in appropriate category
4. Add routing rules in orchestrator

### Custom Routing Rules
Add routing rules in `dual-agent-orchestrator.js`:

```javascript
this.routingRules = {
  'my-custom-type': 'specialized-agent-name',
  // ...existing rules
};
```

### Testing
```bash
# Run all connection tests
npm run dual-agent:test

# Test specific functionality
npm run mcp:demo
```

## Integration Points

- **Event Bus**: [hexarchy/0-core/orchestration/event-bus.js](../hexarchy/0-core/orchestration/event-bus.js)
- **Dual Orchestrator**: [hexarchy/2-intelligence/ai-services/agents/dual-agent-orchestrator.js](../hexarchy/2-intelligence/ai-services/agents/dual-agent-orchestrator.js)
- **Enhanced Agent Hub**: [scripts/agents/enhanced-agent-hub.js](../scripts/agents/enhanced-agent-hub.js)
- **MCP Server**: [hexarchy/3-communication/adapters/enhanced-mcp-server.js](../hexarchy/3-communication/adapters/enhanced-mcp-server.js)

## Performance

- **Sub-second routing** between agents
- **Concurrent agent execution** for independent tasks
- **Intelligent fallback** with < 100ms overhead
- **Real-time metrics** collection
- **Auto-scaling** for high-load scenarios

---

🦉 **HOOTNER Dual AI System - Connecting 75+ agents for intelligent task coordination**