#!/usr/bin/env node

/**
 * Amazon Q Chat API Routes
 * Handles chat communication between UI and Amazon Q via MCP
 */

import express from 'express';
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';

const router = express.Router();

// Global MCP client instance
let mcpClient = null;
let mcpServerProcess = null;

// Initialize MCP connection
const initializeMCP = async () => {
  if (mcpClient) return mcpClient;

  try {
    console.log('🤖 Starting Enhanced MCP Server for Amazon Q chat...');

    // Start enhanced MCP server process
    const serverScriptPath = fs.existsSync('heptagonal/3-communication/adapters/enhanced-mcp-server.js')
      ? 'heptagonal/3-communication/adapters/enhanced-mcp-server.js'
      : 'hexarchy/3-communication/adapters/enhanced-mcp-server.js';

    mcpServerProcess = spawn('node', [serverScriptPath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create transport
    const transport = new StdioClientTransport({
      readable: mcpServerProcess.stdout,
      writable: mcpServerProcess.stdin
    });

    // Create client
    mcpClient = new Client({
      name: 'amazon-q-chat-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    // Connect
    await mcpClient.connect(transport);
    console.log('✅ Amazon Q Chat MCP Client connected');

    return mcpClient;
  } catch (error) {
    console.error('❌ Failed to initialize MCP for Amazon Q chat:', error.message);
    throw error;
  }
};

// Connect to Amazon Q
router.post('/connect', async (req, res) => {
  try {
    const { agentType } = req.body;

    if (agentType !== 'amazonQ') {
      return res.status(400).json({
        success: false,
        error: 'Invalid agent type. Expected: amazonQ'
      });
    }

    // Initialize MCP connection
    await initializeMCP();

    // Get agent hub status to verify connection
    const response = await mcpClient.callTool({
      name: 'agent_hub_status',
      arguments: {}
    });

    const status = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      message: 'Amazon Q connected successfully',
      agentCount: status.agentHub?.totalAgents || 0,
      activeAgents: status.agentHub?.activeAgents || 0,
      sessionId: status.sessionId
    });
  } catch (error) {
    console.error('Amazon Q connection failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Amazon Q: ' + error.message
    });
  }
});

// Route message through dual agent system
router.post('/route', async (req, res) => {
  try {
    const { type, query, context } = req.body;

    if (!type || !query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and query'
      });
    }

    // Ensure MCP connection
    if (!mcpClient) {
      await initializeMCP();
    }

    const startTime = Date.now();

    // Route through dual agent system
    const response = await mcpClient.callTool({
      name: 'dual_agent_route',
      arguments: {
        type,
        query,
        context: {
          ...context,
          chatInterface: true,
          timestamp: new Date().toISOString()
        }
      }
    });

    const result = JSON.parse(response.content[0].text);
    const processingTime = Date.now() - startTime;

    // Enhanced response for chat interface
    const chatResponse = {
      success: true,
      response: result.response || `Amazon Q: ${query}`,
      agent: result.agent || 'Amazon Q',
      type: type,
      processingTimeMs: processingTime,
      timestamp: result.timestamp || new Date().toISOString(),
      confidence: result.confidence || 0.95,
      suggestions: generateSuggestions(type, query)
    };

    res.json(chatResponse);
  } catch (error) {
    console.error('Message routing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message: ' + error.message
    });
  }
});

// Get Amazon Q capabilities
router.get('/capabilities', async (req, res) => {
  try {
    if (!mcpClient) {
      await initializeMCP();
    }

    const response = await mcpClient.callTool({
      name: 'mcp_protocol_info',
      arguments: {}
    });

    const info = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      capabilities: info.capabilities,
      supportedFeatures: info.supportedFeatures,
      protocolVersion: info.protocolVersion,
      serverVersion: info.serverVersion
    });
  } catch (error) {
    console.error('Failed to get capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get capabilities: ' + error.message
    });
  }
});

// Get chat history and context
router.get('/context', async (req, res) => {
  try {
    if (!mcpClient) {
      await initializeMCP();
    }

    const response = await mcpClient.callTool({
      name: 'orchestrator_stats',
      arguments: {}
    });

    const stats = JSON.parse(response.content[0].text);

    res.json({
      success: true,
      stats: {
        amazonQRequests: stats.orchestrator?.amazonQRequests || 0,
        copilotRequests: stats.orchestrator?.copilotRequests || 0,
        fallbacks: stats.orchestrator?.fallbacks || 0,
        connectedAgents: stats.orchestrator?.connectedAgents || 0
      },
      sessionId: stats.sessionId,
      timestamp: stats.timestamp
    });
  } catch (error) {
    console.error('Failed to get context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get context: ' + error.message
    });
  }
});

// Generate contextual suggestions
const generateSuggestions = (type, query) => {
  const suggestions = {
    'aws-specific': [
      'Show me S3 best practices',
      'How to optimize Lambda costs',
      'Setup CloudFront CDN',
      'Configure VPC security groups'
    ],
    'security-audit': [
      'Scan for SQL injection',
      'Check HTTPS configuration',
      'Review IAM permissions',
      'Audit API endpoints'
    ],
    'compliance-check': [
      'GDPR compliance checklist',
      'SOC2 requirements',
      'Data retention policies',
      'Privacy by design'
    ],
    'business-analytics': [
      'Show revenue trends',
      'User engagement metrics',
      'Performance KPIs',
      'Cost optimization report'
    ]
  };

  return suggestions[type] || [
    'Help with AWS services',
    'Security best practices',
    'Business analytics',
    'Compliance guidance'
  ];
};

// Cleanup on process exit
process.on('exit', () => {
  if (mcpServerProcess) {
    mcpServerProcess.kill('SIGTERM');
  }
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Amazon Q Chat API...');
  if (mcpClient) {
    mcpClient.close();
  }
  if (mcpServerProcess) {
    mcpServerProcess.kill('SIGTERM');
  }
  process.exit(0);
});

export default router;
