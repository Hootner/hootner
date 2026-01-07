import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['servers/hootner-mcp-server.js']
});

const client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });

await client.connect(transport);

console.log('Testing getProjectInfo tool...\n');

const result = await client.callTool({ name: 'getProjectInfo', arguments: {} });

console.log('Result:', JSON.stringify(result, null, 2));

await client.close();
process.exit(0);
