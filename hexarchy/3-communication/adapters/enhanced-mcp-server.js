#!/usr/bin/env node

/**
 * Enhanced MCP Server - Central hub for all AI agent communication
 * Integrates Dual Agent Orchestrator with Enhanced Agent Hub
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import DualAgentOrchestrator from '../../2-intelligence/ai-services/agents/dual-agent-orchestrator.js'
import enhancedAgentHub from '../../../scripts/agents/enhanced-agent-hub.js'
import crypto from 'crypto'

class EnhancedMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'hootner-enhanced-mcp-server',
        version: '2.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.orchestrator = new DualAgentOrchestrator()
    this.agentHubEnabled = process.env.DISABLE_SPECIALIZED_AGENTS !== 'true'
    this.agentHub = null
    this.isInitialized = false
    this.sessionId = crypto.randomUUID()
  }

  async initialize() {
    if (this.isInitialized) return

    console.log('🦉 Initializing Enhanced MCP Server...')

    // Initialize orchestrator and agent hub
    await this.orchestrator.initialize()
    this.agentHub = this.agentHubEnabled ? this.orchestrator.enhancedAgentHub || enhancedAgentHub : null

    if (this.agentHubEnabled) {
      if (this.agentHub && this.agentHub !== enhancedAgentHub) {
        console.log('✅ Agent hub provided by orchestrator')
      } else if (this.agentHub) {
        await this.agentHub.initialize()
      } else {
        console.log('⚠️  Specialized agents disabled at MCP server level')
      }
    } else {
      console.log('⚠️  Specialized agents disabled at MCP server level')
    }

    this.setupToolHandlers()
    this.isInitialized = true

    console.log('✅ Enhanced MCP Server initialized successfully')
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'dual_agent_route',
            description: 'Route request through dual agent system (Copilot + Amazon Q)',
            inputSchema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: 'Request type (aws-specific, inline-code, security-audit, etc.)',
                },
                query: {
                  type: 'string',
                  description: 'The actual query or request',
                },
                context: {
                  type: 'object',
                  description: 'Additional context for the request',
                },
              },
              required: ['type', 'query'],
            },
          },
          {
            name: 'agent_hub_status',
            description: 'Get status of all 75+ agents in the enhanced agent hub',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'execute_agent_action',
            description: 'Execute specific action on a named agent',
            inputSchema: {
              type: 'object',
              properties: {
                agentName: {
                  type: 'string',
                  description: 'Name of the agent to execute action on',
                },
                action: {
                  type: 'string',
                  description: 'Action method to call on the agent',
                },
                args: {
                  type: 'array',
                  description: 'Arguments to pass to the action',
                },
              },
              required: ['agentName', 'action'],
            },
          },
          {
            name: 'list_agents_by_category',
            description: 'List all agents organized by category',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter by category (core, business, security, infrastructure, service)',
                },
              },
            },
          },
          {
            name: 'orchestrator_stats',
            description: 'Get comprehensive stats from the dual agent orchestrator',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'connect_external_agent',
            description: 'Connect an external agent to the orchestration system',
            inputSchema: {
              type: 'object',
              properties: {
                agentName: {
                  type: 'string',
                  description: 'Name of the external agent',
                },
                endpoint: {
                  type: 'string',
                  description: 'MCP endpoint of the external agent',
                },
              },
              required: ['agentName', 'endpoint'],
            },
          },
          {
            name: 'mcp_protocol_info',
            description: 'Get MCP protocol version and server capabilities information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        const result = await this.handleToolCall(name, args)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: error.message,
                  sessionId: this.sessionId,
                  timestamp: new Date().toISOString(),
                },
                null,
                2
              ),
            },
          ],
        }
      }
    })
  }

  async handleToolCall(name, args) {
    // Validate MCP request structure
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid tool name provided')
    }

    switch (name) {
      case 'dual_agent_route':
        if (!args.type || !args.query) {
          throw new Error('Missing required arguments: type and query')
        }
        return await this.orchestrator.route({
          type: args.type,
          query: args.query,
          context: args.context || {},
        })

      case 'agent_hub_status':
        if (!this.agentHubEnabled || !this.agentHub) {
          throw new Error('Specialized agents disabled. Agent hub status unavailable.')
        }
        return {
          sessionId: this.sessionId,
          agentHub: this.agentHub.getStatus(),
          mcpVersion: '1.25.3',
          serverVersion: '2.0.0',
          timestamp: new Date().toISOString(),
        }

      case 'execute_agent_action':
        if (!args.agentName || !args.action) {
          throw new Error('Missing required arguments: agentName and action')
        }
        if (!this.agentHubEnabled || !this.agentHub) {
          throw new Error('Specialized agents disabled. Cannot execute agent actions.')
        }
        return await this.agentHub.executeAgentAction(
          args.agentName,
          args.action,
          ...(args.args || [])
        )

      case 'list_agents_by_category':
        if (!this.agentHubEnabled || !this.agentHub) {
          throw new Error('Specialized agents disabled. No agents to list.')
        }
        const agents = this.agentHub.listAgents()
        const result = args.category ? { [args.category]: agents[args.category] || [] } : agents
        return {
          ...result,
          sessionId: this.sessionId,
          totalCategories: Object.keys(agents).length
        }

      case 'orchestrator_stats':
        return {
          sessionId: this.sessionId,
          orchestrator: this.orchestrator.getStats(),
          mcpProtocol: {
            version: '1.25.3',
            capabilities: this.server.capabilities,
            connectedClients: 1
          },
          timestamp: new Date().toISOString(),
        }

      case 'connect_external_agent':
        if (!args.agentName || !args.endpoint) {
          throw new Error('Missing required arguments: agentName and endpoint')
        }
        const connected = await this.orchestrator.connectAgent(args.agentName, args.endpoint)
        return {
          success: connected,
          agentName: args.agentName,
          endpoint: args.endpoint,
          sessionId: this.sessionId,
          connectionTime: new Date().toISOString()
        }

      case 'mcp_protocol_info':
        return {
          protocolVersion: '1.25.3',
          serverVersion: '2.0.0',
          capabilities: {
            tools: 6,
            dualAgent: true,
            agentHub: true,
            eventBus: true
          },
          supportedFeatures: [
            'dual_agent_routing',
            'specialized_agents',
            'cross_agent_communication',
            'real_time_metrics',
            'auto_fallback'
          ],
          sessionId: this.sessionId
        }

      default:
        throw new Error(`Unknown tool: ${name}. Available tools: dual_agent_route, agent_hub_status, execute_agent_action, list_agents_by_category, orchestrator_stats, connect_external_agent, mcp_protocol_info`)
    }
  }

  async start() {
    await this.initialize()
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log('🦉 Enhanced MCP Server running with dual agent integration')
  }

  async shutdown() {
    console.log('🛑 Shutting down Enhanced MCP Server...')
    if (this.agentHubEnabled && this.agentHub) {
      await this.agentHub.shutdown()
    }
    console.log('✅ Enhanced MCP Server shutdown complete')
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const mcpServer = new EnhancedMCPServer()

  process.on('SIGINT', async () => {
    await mcpServer.shutdown()
    process.exit(0)
  })

  mcpServer.start().catch(console.error)
}

export default EnhancedMCPServer
