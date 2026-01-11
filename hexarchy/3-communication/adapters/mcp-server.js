#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import crypto from 'crypto';

const server = new Server(
  {
    name: 'hootner-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'hexarchy_status',
        description: 'Get hexagonal architecture status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'start_layer',
        description: 'Start a specific hexagonal layer',
        inputSchema: {
          type: 'object',
          properties: {
            layer: {
              type: 'string',
              description: 'Layer name (0-core, 1-foundation, etc.)',
            },
          },
          required: ['layer'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'hexarchy_status':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'active',
              sessionId: crypto.randomUUID(),
              layers: {
                '0-core': 'Domain logic & business rules',
                '1-foundation': 'Infrastructure & services',
                '2-intelligence': 'AI & analytics',
                '3-communication': 'APIs & integrations',
                '4-interface': 'UI & frontend',
                '5-economy': 'Business & commerce',
                '6-governance': 'Security & compliance',
                '7-data': 'Data & repositories',
                '8-operations': 'DevOps & monitoring'
              }
            }, null, 2),
          },
        ],
      };

    case 'start_layer':
      const layer = args?.layer;
      if (!layer) {
        throw new Error('Layer parameter is required');
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `Starting hexagonal layer: ${layer}`,
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🦉 HOOTNER MCP Server running');
}

runServer().catch(console.error);