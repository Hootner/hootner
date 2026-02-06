# 🔗 MCP Server Connection Guide

## Quick Connect

Connect to the HOOTNER MCP server in seconds:

```bash
npm run mcp:connect
```

This will:
- ✅ Start the enhanced MCP server
- ✅ Connect via the SDK client
- ✅ Display available tools
- ✅ Show system status
- ✅ Verify protocol information

## Available Endpoints

### HTTP API (via Express)
```
http://localhost:3000/api/mcp
```

**Available routes:**
- `POST /api/mcp/connect` - Connect to Amazon Q
- `POST /api/mcp/route` - Route messages through dual agent system
- `GET /api/mcp/capabilities` - Get MCP capabilities
- `GET /api/mcp/context` - Get chat history and context

### Direct SDK Connection

Use the MCP SDK to connect programmatically:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Start server
const serverProcess = spawn('node', [
  'hexarchy/3-communication/adapters/enhanced-mcp-server.js'
]);

// Create transport
const transport = new StdioClientTransport({
  readable: serverProcess.stdout,
  writable: serverProcess.stdin
});

// Create and connect client
const client = new Client({ name: 'my-client', version: '1.0.0' }, {});
await client.connect(transport);

// Use the client
const tools = await client.listTools();
const result = await client.callTool({ name: 'agent_hub_status', arguments: {} });
```

## Available MCP Tools

1. **dual_agent_route** - Smart routing between Copilot/Amazon Q
2. **agent_hub_status** - Status of all 75+ agents
3. **execute_agent_action** - Direct agent action execution
4. **list_agents_by_category** - Categorized agent listing
5. **orchestrator_stats** - Comprehensive system metrics
6. **connect_external_agent** - External agent integration
7. **mcp_protocol_info** - Protocol version and capabilities

## Example Usage

### Connect via HTTP API

```bash
# Connect to Amazon Q
curl -X POST http://localhost:3000/api/mcp/connect \
  -H "Content-Type: application/json" \
  -d '{"agentType": "amazonQ"}'

# Route a message
curl -X POST http://localhost:3000/api/mcp/route \
  -H "Content-Type: application/json" \
  -d '{
    "type": "aws-specific",
    "query": "How do I optimize Lambda costs?",
    "context": {}
  }'

# Get capabilities
curl http://localhost:3000/api/mcp/capabilities
```

### Connect via SDK

```bash
# Interactive client
npm run mcp:demo

# Quick connection test
npm run mcp:connect

# Validate protocol
npm run mcp:validate
```

## Troubleshooting

### Server not starting?

```bash
# Check if port is in use
npx kill-port 3000

# Validate MCP protocol
npm run mcp:validate

# Auto-fix common issues
npm run mcp:fix
```

### Connection timeout?

The server takes ~1.5 seconds to initialize. The connection script waits automatically.

### Missing dependencies?

```bash
npm install @modelcontextprotocol/sdk
```

## Integration with Amazon Q

The MCP server is integrated with Amazon Q chat at:
- **Chat Interface**: `http://localhost:3000/api/mcp`
- **GraphQL API**: `http://localhost:3000/graphql`
- **Health Check**: `http://localhost:3000/api/health`

## More Information

- **Full Status**: See [MCP_PROTOCOL_STATUS.md](../MCP_PROTOCOL_STATUS.md)
- **Dual Agent Setup**: See [docs/DUAL_AGENT_SETUP.md](../docs/DUAL_AGENT_SETUP.md)
- **Integration Guide**: See [docs/MCP_INTEGRATION.md](../docs/MCP_INTEGRATION.md)

---

**🦉 HOOTNER MCP Server - Ready to connect!**
