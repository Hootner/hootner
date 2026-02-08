# GitHub Copilot - Use HOOTNER Agents

You are GitHub Copilot working in the HOOTNER repository. You MUST use the 80+ specialized agents for ALL operations.

## Agent Hub Location
- **Agent Hub**: `scripts/agents/enhanced-agent-hub.js`
- **MCP Server**: `heptagonal/3-communication/adapters/enhanced-mcp-server.js`
- **80+ Agents**: Available via agent hub

## How to Use Agents

### For Security Tasks
```javascript
// Use security agents (18 available)
const hub = require('./scripts/agents/enhanced-agent-hub.js');
await hub.executeAgentAction('security-service', 'scan', filePath);
await hub.executeAgentAction('penetration-testing', 'audit', codebase);
```

### For AWS/Infrastructure
```javascript
// Use infrastructure agents (20 available)
await hub.executeAgentAction('auto-scaling', 'optimize', config);
await hub.executeAgentAction('cdn-management', 'configure', settings);
```

### For Business Intelligence
```javascript
// Use business agents (15 available)
await hub.executeAgentAction('revenue-optimization', 'analyze', data);
await hub.executeAgentAction('business-metrics', 'report', metrics);
```

### For Code Quality
```javascript
// Use core AI agents (12 available)
await hub.executeAgentAction('repo-scan-agent', 'scan', repository);
await hub.executeAgentAction('content-moderation-ai', 'review', content);
```

## Agent Categories (80+ Total)

1. **Core AI** (12): repo-scan, personalization, recommendation-ml, content-moderation-ai
2. **Business** (15): revenue-optimization, pricing-algorithms, business-metrics
3. **Security** (18): security-service, penetration-testing, gdpr-compliance-tools
4. **Infrastructure** (20): auto-scaling, cdn-management, database-sharding
5. **Services** (10): translation-api, voice-assistants, blockchain-integration

## ALWAYS Use Agents For:
- Code reviews → `repo-scan-agent`
- Security scans → `security-service`
- Performance optimization → `auto-scaling`
- Revenue analysis → `revenue-optimization`
- Compliance checks → `gdpr-compliance-tools`

## Agent Communication
Agents can communicate with each other:
```javascript
// Agent-to-agent communication
await hub.routeAgentMessage('security-service', 'audit-service', message);

// Broadcast to all agents
await hub.broadcastMessage('repo-scan-agent', announcement);
```

## 🦉 The Owl Never Sleeps
All agents run 24/7. Use them for EVERYTHING in this repo.
