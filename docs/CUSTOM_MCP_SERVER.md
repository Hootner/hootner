# 🛠️ Custom MCP Server for HOOTNER

## Overview

Modern MCP server using ES modules and streamlined tool execution for Amazon Q Developer integration.

## Quick Start

```bash
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Test tools
npm run mcp:test-tools

# Start server
npm run mcp:start
```

## Server Architecture

### Modern SDK Approach
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'hootner-mcp',
  version: '1.0.0'
}, {
  capabilities: { tools: {} }
});
```

### Tool Registration
```javascript
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'deploy_service',
      description: 'Deploy HOOTNER microservices',
      inputSchema: {
        type: 'object',
        properties: {
          service: { type: 'string' },
          environment: { type: 'string', enum: ['dev', 'prod'] }
        }
      },
      execute: async (input) => {
        return await deployService(input);
      }
    }
  ]
}));
```

## Available Tools

### 🚢 deploy_service
Deploy HOOTNER microservices
```javascript
{
  service: 'frontend',      // Optional: specific service
  environment: 'dev'        // Required: dev, prod, staging, blue-green
}
```

### 🧪 chaos_test  
Run chaos engineering tests
```javascript
{
  scenario: 'chaos-monkey', // Required: chaos-monkey, load-test, spike-test
  duration: 5               // Optional: duration in minutes
}
```

### 🏥 system_health
Check system health status
```javascript
{
  component: 'all'          // Optional: all, frontend, backend, database
}
```

### 💾 backup_system
Trigger system backups
```javascript
{
  type: 'full'              // Required: full, incremental, pitr
}
```

### 🔒 security_scan
Run security audits
```javascript
{
  scan_type: 'full'         // Required: full, dependencies, secrets
}
```

## Tool Execution Flow

1. **Tool Registration** - Tools registered with `execute` functions
2. **Request Handling** - `tools/call` method routes to tool execution
3. **Streamlined Response** - Direct JSON responses, no complex content wrapping
4. **Error Handling** - Simple error objects returned

## Testing Tools

### Individual Tool Test
```bash
npm run mcp:test-tools
```

### Manual Testing
```javascript
// Test deploy_service
const result = await tool.execute({
  environment: 'dev',
  service: 'frontend'
});
// Returns: { status: 'deployed', environment: 'dev', service: 'frontend' }
```

### Integration Testing
```bash
# Start server
node mcp-server.js

# Send test message
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp-server.js
```

## Amazon Q Integration

### Natural Language Examples
```
"Deploy frontend service to development environment"
→ Uses deploy_service tool

"Run chaos monkey test for 10 minutes"  
→ Uses chaos_test tool

"Check if all systems are healthy"
→ Uses system_health tool

"Create full backup of the system"
→ Uses backup_system tool

"Scan for security vulnerabilities"
→ Uses security_scan tool
```

### Tool Permissions
- **deploy_service**: Ask (requires confirmation)
- **chaos_test**: Ask (requires confirmation)  
- **system_health**: Always (auto-approved)
- **backup_system**: Ask (requires confirmation)
- **security_scan**: Always (auto-approved)

## Advanced Features

### Custom Tool Development
```javascript
{
  name: 'custom_tool',
  description: 'Your custom functionality',
  inputSchema: {
    type: 'object',
    properties: {
      param: { type: 'string', description: 'Parameter description' }
    },
    required: ['param']
  },
  execute: async (input) => {
    // Your custom logic here
    return { result: 'success', data: input.param };
  }
}
```

### Error Handling
```javascript
execute: async (input) => {
  try {
    const result = await someOperation(input);
    return { success: true, data: result };
  } catch (error) {
    return { error: error.message };
  }
}
```

### Environment Configuration
```javascript
const server = new Server({
  name: 'hootner-mcp',
  version: '1.0.0'
}, {
  capabilities: { tools: {} },
  env: {
    HOOTNER_ENV: process.env.HOOTNER_ENV || 'development',
    NODE_ENV: 'production'
  }
});
```

## Best Practices

1. **Streamlined Responses** - Return simple JSON objects
2. **Clear Schemas** - Define precise input schemas with enums
3. **Error Handling** - Return error objects, don't throw
4. **Tool Naming** - Use descriptive, action-oriented names
5. **Documentation** - Provide clear descriptions for all tools

## Troubleshooting

### Common Issues

**ES Module Errors**
```bash
# Ensure package.json has "type": "module"
# Use import/export syntax consistently
```

**Tool Not Found**
```bash
# Check tool registration in tools/list handler
# Verify tool name matches exactly
```

**Execution Failures**
```bash
# Check tool execute function exists
# Verify input schema validation
```

---

**Made with 🦉 by the HOOTNER Team**