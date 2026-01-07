import { execSync } from 'child_process';

console.log('Testing MCP Tools...\n');

const tools = [
  { name: 'getProjectInfo', args: '{}' },
  { name: 'listServices', args: '{}' },
  { name: 'gitStatus', args: '{}' },
  { name: 'getServerFiles', args: '{}' }
];

for (const tool of tools) {
  console.log(`\n=== Testing ${tool.name} ===`);
  try {
    const result = execSync(
      `echo {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"${tool.name}","arguments":${tool.args}}} | node servers/hootner-mcp-server.js`,
      { encoding: 'utf-8', shell: true }
    );
    console.log(result);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

console.log('\n\nCheck logs: pm2 logs hootner-mcp --lines 20');
