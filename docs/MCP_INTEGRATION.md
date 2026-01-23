# 🚀 Amazon Q Developer MCP Integration for HOOTNER

## Overview

This guide sets up Amazon Q Developer with Model Context Protocol (MCP) to boost your HOOTNER development workflow with deployment, monitoring, and chaos testing capabilities.

## Quick Setup

```bash
# 1. Run setup script
setup-mcp.bat

# 2. Install dependencies
npm install

# 3. Start Amazon Q CLI
q

# 4. List available tools
/tools

# 5. Trust tools (for auto-approval)
/tools trust
```

## Available MCP Tools

### 🚢 Deployment Tools

**deploy_service** - Deploy HOOTNER services

```
"Deploy HOOTNER in production environment"
"Deploy frontend service in dev environment"
"Deploy all services using blue-green strategy"
```

### 🧪 Chaos Engineering

**run_chaos_test** - Execute chaos tests

```
"Run chaos monkey test for 10 minutes"
"Execute load test on the system"
"Start spike test to check resilience"
```

### 🏥 Health Monitoring

**check_system_health** - Monitor system status

```
"Check overall system health"
"Check frontend service health"
"Monitor database connectivity"
```

### 💾 Backup Management

**backup_system** - Trigger backups

```
"Create full system backup"
"Run incremental backup with 30 day retention"
"Execute PITR backup"
```

### 🔒 Security Auditing

**security_audit** - Run security scans

```
"Run comprehensive security audit"
"Scan for dependency vulnerabilities"
"Check for hardcoded secrets"
"Test for injection vulnerabilities"
```

## Example Workflows

### Deployment Workflow

```
Q: "Deploy HOOTNER in staging environment and run health checks"

Amazon Q will:
1. Use deploy_service tool with environment="staging"
2. Use check_system_health tool to verify deployment
3. Provide deployment status and health report
```

### Chaos Testing Workflow

```
Q: "Run chaos monkey test for 5 minutes then check system recovery"

Amazon Q will:
1. Use run_chaos_test with test_type="chaos-monkey", duration=5
2. Use check_system_health to verify recovery
3. Provide test results and recovery status
```

### Security Audit Workflow

```
Q: "Perform full security audit and backup the system"

Amazon Q will:
1. Use security_audit with scan_type="full"
2. Use backup_system with backup_type="full"
3. Provide security report and backup confirmation
```

## Configuration

### MCP Server Config (`~/.aws/amazonq/mcp.json`)

```json
{
  "mcpServers": {
    "hootner-deployment": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "c:\\Users\\12182\\Projects\\my-local-repo",
      "env": {
        "HOOTNER_ENV": "development",
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

### Environment Variables

- `HOOTNER_ENV`: Deployment environment (development/staging/production)
- `FASTMCP_LOG_LEVEL`: MCP logging level (ERROR/INFO/DEBUG)
- `AWS_PROFILE`: AWS profile for CDK operations

## Troubleshooting

### Common Issues

**MCP Server Not Loading**

```bash
# Check syntax
node -c mcp-server.js

# Test manually
node mcp-server.js

# Check logs
export Q_LOG_LEVEL=trace
q
```

**Tool Execution Fails**

```bash
# Verify dependencies
npm install

# Check Docker services
docker-compose ps

# Verify file paths
ls -la scripts/
```

**Timeout Issues**

```bash
# Increase timeout
q settings mcp.initTimeout 30000
```

### Debug Commands

```bash
# Test MCP server
npm run mcp:test

# Manual tool testing
node -e "
const server = require('./mcp-server.js');
// Test tool execution
"

# Check Q logs
cat $TMPDIR/qlog
```

## Integration with HOOTNER Architecture

### Microservices Integration

- Connects to all 10+ HOOTNER microservices
- Monitors service mesh (Istio) health
- Manages blue-green deployments

### DevOps Pipeline Integration

- Triggers CI/CD workflows
- Executes chaos engineering tests
- Manages backup strategies

### Security Integration

- Runs comprehensive security audits
- Scans for injection vulnerabilities
- Validates compliance requirements

## Advanced Usage

### Custom Tool Development

```javascript
// Add new tool to mcp-server.js
{
  name: 'custom_tool',
  description: 'Your custom functionality',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string' }
    }
  }
}
```

### Multi-Environment Support

```json
{
  "mcpServers": {
    "hootner-dev": { "env": { "HOOTNER_ENV": "development" } },
    "hootner-prod": { "env": { "HOOTNER_ENV": "production" } }
  }
}
```

## Best Practices

1. **Security**: Never hardcode credentials in MCP config
2. **Performance**: Use appropriate timeouts for long-running operations
3. **Monitoring**: Enable logging for debugging
4. **Testing**: Test tools manually before using with Q
5. **Backup**: Always backup before major deployments

## Next Steps

1. Explore AWS CDK MCP server for infrastructure management
2. Create custom tools for your specific workflows
3. Integrate with external APIs (Jira, Slack, etc.)
4. Set up automated MCP server deployment
5. Configure monitoring and alerting for MCP operations

---

**Made with 🦉 by the HOOTNER Team**
