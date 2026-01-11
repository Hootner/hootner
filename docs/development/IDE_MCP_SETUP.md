# 🎯 Amazon Q Developer IDE Integration with MCP

## Quick Setup

```bash
# Setup IDE integration
npm run mcp:ide-setup

# Test MCP integration  
npm run mcp:test
```

## VS Code Setup

### 1. Install Extension
```bash
code --install-extension amazonwebservices.amazon-q-vscode
```

### 2. Configure MCP Servers
- Open VS Code: `code .`
- Press `Ctrl+L` to open Amazon Q chat
- Click "Configure MCP servers" at top
- Verify `hootner-deployment` server loads

### 3. Test Integration
```
"Deploy HOOTNER in dev environment"
"Check system health" 
"Run chaos monkey test for 5 minutes"
```

## JetBrains Setup

### 1. Install Plugin
- Go to Settings → Plugins
- Search "Amazon Q"
- Install and restart IDE

### 2. Configure MCP
- Open Amazon Q panel
- MCP servers auto-load from `.idea/amazonq-mcp.xml`

## Tool Permissions

| Tool | Permission | Description |
|------|------------|-------------|
| `deploy_service` | Ask | Requires confirmation for deployments |
| `run_chaos_test` | Ask | Requires confirmation for chaos tests |
| `check_system_health` | Always | Auto-approved health checks |
| `backup_system` | Ask | Requires confirmation for backups |
| `security_audit` | Always | Auto-approved security scans |

## Example Workflows

### Deployment with Health Check
```
Q: "Deploy frontend service in staging and verify it's healthy"

Amazon Q will:
1. Use deploy_service tool (asks permission)
2. Use check_system_health tool (auto-approved)
3. Provide deployment status and health report
```

### Code Analysis with Security
```
Q: "Analyze this React component for security issues"

Amazon Q will:
1. Analyze the code in context
2. Use security_audit tool (auto-approved)
3. Provide security recommendations
```

### Chaos Testing Workflow
```
Q: "Run load test and monitor system recovery"

Amazon Q will:
1. Use run_chaos_test tool (asks permission)
2. Use check_system_health tool (auto-approved)
3. Provide test results and recovery metrics
```

## Troubleshooting

### MCP Server Not Loading
1. Check VS Code output panel
2. Verify `mcp-server.js` exists
3. Test manually: `npm run mcp:test`

### Tool Permissions Issues
1. Open Amazon Q settings
2. Reset MCP server permissions
3. Reconfigure tool permissions

### Performance Issues
1. Increase MCP timeout in settings
2. Check system resources
3. Restart IDE and MCP servers

## Advanced Configuration

### Custom Tool Permissions
```json
{
  "amazonQ.mcp.toolPermissions": {
    "hootner-deployment": {
      "deploy_service": "always",
      "security_audit": "deny"
    }
  }
}
```

### Environment-Specific Servers
```json
{
  "amazonQ.mcp.servers": {
    "hootner-dev": {
      "env": { "HOOTNER_ENV": "development" }
    },
    "hootner-prod": {
      "env": { "HOOTNER_ENV": "production" }
    }
  }
}
```

## Integration Benefits

- **Context-Aware**: Q understands your HOOTNER architecture
- **Deployment Ready**: Deploy directly from chat
- **Security First**: Built-in security scanning
- **Chaos Testing**: Test resilience on demand
- **Health Monitoring**: Real-time system status

---

**Made with 🦉 by the HOOTNER Team**