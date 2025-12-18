#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';

class HootnerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'hootner-mcp',
        vame: 'hootner-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
ls: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_project_info',
            description: 'Get information about the Hootner project structure and configuration',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'list_services',
            description: 'List all available services in the Hootner platform',
            inputSchema: {
   type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'get_service_status',
            description: 'Get the status of a specific service',
            inputSchema: {
              type: 'object',
              properties: {
                serviceName: {
                  type: 'string',
                  description: 'Name of the service to check',
                },
              },
              required: ['serviceName'],
            },
          },
          {
            name: 'read_logs',
            description: 'Read application logs',
            inputSchema: {
              type: 'object',
              properties: {
                logFile: {
                  type: 'string',
                  description: 'Log file to read (optional)',
                },
                lines: {
                  type: 'number',
        description: 'Number of lines to read from the end',
                  default: 50,
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_project_info':
          return await this.getProjectInfo();
        case 'list_services':
          return await this.listServices();
        case 'get_service_status':
          return await this.getServiceStatus(request.params.arguments?.serviceName);
        case 'read_logs':
          return await this.readLogs(
            request.params.arguments?.logFile,
            request.params.arguments?.lines || 50
          );
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async getProjectInfo() {
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
      const projectStructure = await this.getProjectStructure();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              name: packageJson.name,
              version: packageJson.version,
              description: packageJson.description,
              engines: packageJson.engines,
              scripts: Object.keys(packageJson.scripts),
              structure: projectStructure,
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get project info: ${error.message}`);
    }
  }

  async getProjectStructure() {
    const structure = {};
    constrectories = ['apps', 'services', 'servers', 'lib', 'middleware'];

    for (const dir of directories) {
      try {
        const items = await fs.readdir(dir);
        structure[dir] = items;
      } catch (error) {
        // Directory doesn't exist, skip
      }
    }

    return structure;
  }

  async listServices() {
    try {
      const services = [];

      // Check servers directory
      try {
        const serverFiles = await fs.readdir('servers');
        services.push(...serverFiles.map(file => ({ type: 'server', name: file })));
      } catch (error) {
        // Directory doesn't exist
