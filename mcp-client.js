#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class HootnerMCPClient {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    console.log('🦉 Connecting to HOOTNER MCP Server...');
    
    // Start MCP server process
    const serverProcess = spawn('node', ['hexarchy/3-communication/adapters/mcp-server.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Create transport
    this.transport = new StdioClientTransport({
      readable: serverProcess.stdout,
      writable: serverProcess.stdin
    });

    // Create client
    this.client = new Client({
      name: 'hootner-mcp-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    await this.client.connect(this.transport);
    console.log('✅ Connected to HOOTNER MCP Server');
    
    return this;
  }

  async getTools() {
    const response = await this.client.listTools();
    return response.tools;
  }

  async callTool(name, args = {}) {
    const response = await this.client.callTool({ name, arguments: args });
    return response.content;
  }

  async getHexarchyStatus() {
    return await this.callTool('hexarchy_status');
  }

  async startLayer(layer) {
    return await this.callTool('start_layer', { layer });
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MCP Server');
    }
  }
}

// CLI Interface
async function main() {
  const client = new HootnerMCPClient();
  
  try {
    await client.connect();
    
    // List available tools
    const tools = await client.getTools();
    console.log('🛠️  Available tools:', tools.map(t => t.name));
    
    // Get hexarchy status
    const status = await client.getHexarchyStatus();
    console.log('📊 Hexarchy Status:', status[0].text);
    
    // Interactive mode
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n🤖 MCP Client Ready. Commands:');
    console.log('- status: Get hexarchy status');
    console.log('- start <layer>: Start a layer (0-core, 1-foundation, etc.)');
    console.log('- exit: Quit');
    
    const askCommand = () => {
      rl.question('\n> ', async (input) => {
        const [cmd, ...args] = input.trim().split(' ');
        
        try {
          switch (cmd) {
            case 'status': {
              const result = await client.getHexarchyStatus();
              console.log(result[0].text);
              break;
            }
              
            case 'start':
              if (args[0]) {
                const result = await client.startLayer(args[0]);
                console.log(result[0].text);
              } else {
                console.log('Usage: start <layer>');
              }
              break;
              
            case 'exit':
              rl.close();
              return;
              
            default:
              console.log('Unknown command');
          }
        } catch (error) {
          console.error('Error:', error.message);
        }
        
        askCommand();
      });
    };
    
    askCommand();
    
    rl.on('close', async () => {
      await client.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { HootnerMCPClient };