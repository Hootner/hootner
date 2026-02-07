#!/usr/bin/env node

/**
 * Dual-Agent Orchestrator for GitHub Copilot + Amazon Q
 * Manages request routing, capability coordination, and fallback logic
 * Now integrates with Enhanced Agent Hub and MCP servers
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { eventBus } from '../../../0-core/orchestration/event-bus.js'

class DualAgentOrchestrator {
  constructor() {
    this.copilot = {
      name: 'GitHub Copilot',
      capabilities: [
        'code-completion',
        'inline-suggestions',
        'chat-mode',
        'refactoring',
        'test-generation',
        'documentation',
      ],
      model: 'Claude-based',
      mode: 'active',
      mcpServer: null,
    }

    this.amazonQ = {
      name: 'Amazon Q',
      capabilities: [
        'codebase-search',
        'aws-integration',
        'enterprise-policies',
        'security-scanning',
        'compliance-checks',
        'custom-context',
      ],
      model: 'Anthropic Claude',
      mode: 'active',
      mcpServer: null,
    }

    this.enhancedAgentHub = null
    this.mcpClients = new Map()
    this.specializedAgentsEnabled = process.env.DISABLE_SPECIALIZED_AGENTS !== 'true'

    this.routingRules = {
      'aws-specific': 'amazonQ',
      'codebase-context': 'amazonQ',
      'inline-code': 'copilot',
      'chat-refactor': 'copilot',
      'security-audit': 'amazonQ',
      'general-coding': 'copilot',
      documentation: 'copilot',
      'enterprise-compliance': 'amazonQ',
    }

    this.stats = {
      copilotRequests: 0,
      amazonQRequests: 0,
      fallbacks: 0,
      avgResponseTime: 0,
    }
  }

  /**
   * Route a request to the appropriate agent based on context
   */
  async route(request) {
    const { type, context, query } = request

    // Determine primary agent
    let primaryAgent = this.routingRules[type] || 'copilot'
    let fallbackAgent = primaryAgent === 'copilot' ? 'amazonQ' : 'copilot'

    console.log(`🤖 Routing '${type}' to ${primaryAgent}`)

    try {
      // Check if we need to involve specialized agents from hub
      if (this.specializedAgentsEnabled) {
        const specializedAgent = this.getSpecializedAgent(type)
        if (specializedAgent) {
          console.log(`🎯 Using specialized agent: ${specializedAgent}`)
          return await this.executeOnAgent(specializedAgent, 'processRequest', request)
        }
      } else {
        console.log('⚙️  Specialized agents disabled; routing stays within dual agents')
      }

      // Try primary agent
      return await this.executeAgent(primaryAgent, query, context)
    } catch (error) {
      console.warn(`⚠️  ${primaryAgent} failed, falling back to ${fallbackAgent}`)
      this.stats.fallbacks++
      return await this.executeAgent(fallbackAgent, query, context)
    }
  }

  /**
   * Get specialized agent for specific request types
   */
  getSpecializedAgent(requestType) {
    const specializedRouting = {
      'security-audit': 'security-service',
      'payment-fraud': 'payment-fraud-detection-agent',
      'content-moderation': 'content-moderation-ai',
      'business-analytics': 'revenue-analytics',
      'performance-monitoring': 'performance-monitor',
      'compliance-check': 'gdpr-compliance-tools'
    }

    return specializedRouting[requestType]
  }

  /**
   * Execute request on specified agent
   */
  async executeAgent(agentName, query, context) {
    const startTime = Date.now()

    if (agentName === 'copilot') {
      this.stats.copilotRequests++
      return this.executeCopilot(query, context)
    } else if (agentName === 'amazonQ') {
      this.stats.amazonQRequests++
      return this.executeAmazonQ(query, context)
    }

    throw new Error(`Unknown agent: ${agentName}`)
  }

  /**
   * Execute via GitHub Copilot (simulated)
   */
  async executeCopilot(query, context) {
    return {
      agent: 'GitHub Copilot',
      response: `[Copilot] Processing: ${query}`,
      context,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Execute via Amazon Q (simulated)
   */
  async executeAmazonQ(query, context) {
    return {
      agent: 'Amazon Q',
      response: `[Q] Processing: ${query}`,
      context,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Initialize dual agent system with MCP servers and enhanced agent hub
   */
  async initialize() {
    console.log('🤖 Initializing Dual-Agent Orchestrator with MCP integration...')

    try {
      if (this.specializedAgentsEnabled) {
        // Connect to Enhanced Agent Hub
        const { default: enhancedAgentHub } = await import('../../../../scripts/agents/enhanced-agent-hub.js')
        this.enhancedAgentHub = enhancedAgentHub
        await this.enhancedAgentHub.initialize()

        // Setup manual agent controller
        const { default: ManualAgentController } = await import('../../../../scripts/agents/manual-agent-controller.js')
        this.manualController = new ManualAgentController()
        await this.manualController.initialize()
      } else {
        console.log('⚠️  Specialized agents disabled via DISABLE_SPECIALIZED_AGENTS=true')
      }

      // Setup MCP servers for each agent
      await this.setupMCPServers()

      // Subscribe to event bus
      this.setupEventSubscriptions()

      console.log('✅ Dual-Agent Orchestrator initialized with manual control and MCP integration')
    } catch (error) {
      console.error('❌ Failed to initialize Dual-Agent Orchestrator:', error.message)
      throw error
    }
  }

  /**
   * Manually start an agent via the orchestrator
   */
  async startAgent(agentName, options = {}) {
    if (!this.specializedAgentsEnabled) {
      throw new Error('Specialized agents disabled. Enable them to start manual agents.')
    }

    if (!this.manualController) {
      throw new Error('Manual controller not initialized. Call initialize() first.')
    }

    return await this.manualController.startAgent(agentName, options)
  }

  /**
   * Manually stop an agent via the orchestrator
   */
  async stopAgent(agentName) {
    if (!this.specializedAgentsEnabled) {
      throw new Error('Specialized agents disabled. Enable them to stop manual agents.')
    }

    if (!this.manualController) {
      throw new Error('Manual controller not initialized. Call initialize() first.')
    }

    return await this.manualController.stopAgent(agentName)
  }

  /**
   * Test communication between agents
   */
  async testAgentCommunication(fromAgent, toAgent, message) {
    if (!this.specializedAgentsEnabled) {
      throw new Error('Specialized agents disabled. Enable them to test agent communication.')
    }

    if (!this.manualController) {
      throw new Error('Manual controller not initialized. Call initialize() first.')
    }

    return await this.manualController.testAgentCommunication(fromAgent, toAgent, message)
  }

  /**
   * Setup MCP servers for agent communication
   */
  async setupMCPServers() {
    // Setup GitHub Copilot MCP Server
    this.copilot.mcpServer = new Server({
      name: 'github-copilot-mcp',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    })

    // Setup Amazon Q MCP Server
    this.amazonQ.mcpServer = new Server({
      name: 'amazon-q-mcp',
      version: '1.0.0'
    }, {
      capabilities: { tools: {} }
    })

    console.log('✅ MCP Servers initialized for both agents')
  }

  /**
   * Setup event bus subscriptions for inter-agent communication
   */
  setupEventSubscriptions() {
    // Subscribe to agent requests
    eventBus.subscribe('agent:request', this.handleAgentRequest)
    eventBus.subscribe('agent:response', this.handleAgentResponse)
    eventBus.subscribe('agent:fallback', this.handleAgentFallback)

    console.log('✅ Event bus subscriptions established')
  }

  /**
   * Handle agent requests via event bus
   */
  handleAgentRequest = async (event) => {
    const { agentType, request } = event.payload
    console.log(`📨 Handling ${agentType} request:`, request.type)

    try {
      const result = await this.route(request)
      eventBus.publish({
        type: 'agent:response',
        correlationId: event.correlationId,
        payload: { success: true, result }
      })
    } catch (error) {
      eventBus.publish({
        type: 'agent:response',
        correlationId: event.correlationId,
        payload: { success: false, error: error.message }
      })
    }
  }

  /**
   * Handle agent responses via event bus
   */
  handleAgentResponse = async (event) => {
    console.log('📨 Agent response received:', event.correlationId)
  }

  /**
   * Handle agent fallbacks via event bus
   */
  handleAgentFallback = async (event) => {
    console.log('⚠️ Agent fallback triggered:', event.payload)
  }

  /**
   * Connect to external agent via MCP
   */
  async connectAgent(agentName, mcpEndpoint) {
    try {
      if (!this.specializedAgentsEnabled || !this.enhancedAgentHub) {
        throw new Error('Specialized agents disabled. Cannot connect external agents.')
      }

      const agentInstance = await this.enhancedAgentHub.getAgentInstance(agentName)
      if (agentInstance) {
        this.mcpClients.set(agentName, agentInstance)
        console.log(`✅ Connected to agent: ${agentName}`)
        return true
      }
      return false
    } catch (error) {
      console.error(`❌ Failed to connect to agent ${agentName}:`, error.message)
      return false
    }
  }

  /**
   * Execute action on connected agent
   */
  async executeOnAgent(agentName, action, ...args) {
    try {
      if (!this.specializedAgentsEnabled || !this.enhancedAgentHub) {
        throw new Error('Specialized agents disabled. No agent hub available.')
      }

      return await this.enhancedAgentHub.executeAgentAction(agentName, action, ...args)
    } catch (error) {
      console.error(`❌ Failed to execute ${action} on ${agentName}:`, error.message)
      throw error
    }
  }

  /**
   * Get orchestrator stats
   */
  getStats() {
    const baseStats = {
      ...this.stats,
      agents: {
        copilot: this.copilot,
        amazonQ: this.amazonQ,
      },
      connectedAgents: this.mcpClients.size,
      enhancedAgentHub: this.enhancedAgentHub && this.specializedAgentsEnabled
        ? this.enhancedAgentHub.getStatus()
        : null,
      specializedAgentsEnabled: this.specializedAgentsEnabled
    }

    // Add manual control stats if available
    if (this.manualController) {
      baseStats.manualControl = {
        available: true,
        controller: 'initialized'
      }
    }

    return baseStats
  }

  /**
   * Enable dual-agent mode with both active
   */
  enableDualMode() {
    this.copilot.mode = 'active'
    this.amazonQ.mode = 'active'
    console.log('✅ Dual-agent mode ENABLED')
  }

  /**
   * Disable dual-agent mode (use Copilot only)
   */
  disableDualMode() {
    this.amazonQ.mode = 'disabled'
    console.log('✅ Dual-agent mode DISABLED (Copilot only)')
  }
}

export default DualAgentOrchestrator
