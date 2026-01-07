/**
 * Node.js API Server with GPT-3.5 Integration
 * Acts as gateway to PyTorch Transformer LLM and OpenAI GPT-3.5
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PYTORCH_LLM_URL = process.env.PYTORCH_LLM_URL || 'http://localhost:5000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000';

// Initialize OpenAI
let openai;
if (OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    // Check PyTorch LLM health
    const llmHealth = await axios.get(`${PYTORCH_LLM_URL}/health`);

    res.json({
      status: 'healthy',
      services: {
        api_server: 'running',
        pytorch_llm: llmHealth.data.status,
        openai: openai ? 'configured' : 'not_configured',
        mcp_server: 'configured',
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * Generate text using GPT-3.5
 */
app.post('/api/gpt35/generate', async (req, res) => {
  try {
    const { prompt, max_tokens = 150, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API not configured' });
    }

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens,
      temperature,
    });

    res.json({
      model: 'gpt-3.5-turbo',
      response: completion.data.choices[0].message.content,
      usage: completion.data.usage,
    });
  } catch (error) {
    console.error('Error with GPT-3.5:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate text using PyTorch Transformer
 */
app.post('/api/transformer/generate', async (req, res) => {
  try {
    const { prompt, max_length = 100 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await axios.post(`${PYTORCH_LLM_URL}/generate`, {
      prompt,
      max_length,
    });

    res.json({
      model: 'pytorch-transformer',
      response: response.data.response,
    });
  } catch (error) {
    console.error('Error with PyTorch Transformer:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Hybrid generation: Use GPT-3.5 to enhance Transformer output
 */
app.post('/api/hybrid/generate', async (req, res) => {
  try {
    const { prompt, use_gpt = true, max_length = 100 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // First, get response from PyTorch Transformer
    const transformerResponse = await axios.post(`${PYTORCH_LLM_URL}/generate`, {
      prompt,
      max_length,
    });

    let finalResponse = transformerResponse.data.response;

    // Optionally enhance with GPT-3.5
    if (use_gpt && openai) {
      const gptEnhancement = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Enhance and improve the following AI-generated text while maintaining its meaning.',
          },
          { role: 'user', content: finalResponse },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      finalResponse = gptEnhancement.data.choices[0].message.content;
    }

    res.json({
      model: 'hybrid',
      transformer_output: transformerResponse.data.response,
      final_response: finalResponse,
      enhanced: use_gpt && openai,
    });
  } catch (error) {
    console.error('Error with hybrid generation:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Train transformer with Amazon Q data via MCP
 */
app.post('/api/train/amazonq', async (req, res) => {
  try {
    const { query, mcp_session_id } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Create or use existing MCP session
    let sessionId = mcp_session_id;
    if (!sessionId) {
      const mcpSession = await axios.post(`${PYTORCH_LLM_URL}/mcp/session`, {
        config: {
          provider: 'amazon-q',
          timestamp: Date.now(),
        },
      });
      sessionId = mcpSession.data.session_id;
    }

    // Initiate training with Amazon Q data
    const trainingResponse = await axios.post(`${PYTORCH_LLM_URL}/train`, {
      query,
      session_id: sessionId,
    });

    res.json({
      status: 'training_initiated',
      session_id: sessionId,
      training_details: trainingResponse.data,
    });
  } catch (error) {
    console.error('Error training with Amazon Q data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * MCP Server session management
 */
app.post('/api/mcp/session', async (req, res) => {
  try {
    const { action, session_id, config } = req.body;

    let response;
    switch (action) {
      case 'create':
        response = await axios.post(`${PYTORCH_LLM_URL}/mcp/session`, { config });
        break;
      case 'query':
        // Query MCP server for Amazon Q data
        response = await axios.get(`${MCP_SERVER_URL}/tools/list`);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error with MCP session:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compare outputs from different models
 */
app.post('/api/compare', async (req, res) => {
  try {
    const { prompt, max_length = 100 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const results = {
      prompt,
      models: {},
    };

    // Get Transformer response
    try {
      const transformerResp = await axios.post(`${PYTORCH_LLM_URL}/generate`, {
        prompt,
        max_length,
      });
      results.models.transformer = {
        response: transformerResp.data.response,
        status: 'success',
      };
    } catch (err) {
      results.models.transformer = { status: 'error', error: err.message };
    }

    // Get GPT-3.5 response
    if (openai) {
      try {
        const gptResp = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: max_length,
        });
        results.models.gpt35 = {
          response: gptResp.data.choices[0].message.content,
          status: 'success',
        };
      } catch (err) {
        results.models.gpt35 = { status: 'error', error: err.message };
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error comparing models:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Transformer API Server running on port ${PORT}`);
  console.log(`PyTorch LLM: ${PYTORCH_LLM_URL}`);
  console.log(`MCP Server: ${MCP_SERVER_URL}`);
  console.log(`OpenAI configured: ${openai ? 'Yes' : 'No'}`);
});

module.exports = app;
