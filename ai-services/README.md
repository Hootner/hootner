# AI Transformer LLM Service

A hybrid AI service combining PyTorch Transformer model with GPT-3.5 API, integrated with Amazon Q training data via MCP server.

## Architecture

```
┌─────────────────┐
│   Client Apps   │
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│  Node.js API Server     │
│  (transformer-api.js)   │
│  - GPT-3.5 Integration  │
│  - Request Routing      │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  PyTorch LLM Server     │
│  (LLM.py)               │
│  - Transformer Model    │
│  - Training Engine      │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  MCP Server             │
│  - Amazon Q Data        │
│  - Training Datasets    │
└─────────────────────────┘
```

## Components

### 1. PyTorch Transformer LLM (LLM.py)

- Custom transformer architecture using PyTorch
- Flask API server for model inference
- Integration with Amazon Q via MCP server
- Training capabilities with external datasets

### 2. Node.js API Gateway (transformer-api-server.js)

- Express server routing requests
- GPT-3.5 integration via OpenAI API
- Hybrid generation combining both models
- MCP session management

### 3. MCP Integration

- Connects to Amazon Q for training data
- Session management for data access
- Preprocessing and data pipeline

## Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- CUDA (optional, for GPU acceleration)

### Installation

1. **Install Python dependencies:**

```bash
cd ai-services
pip install -r requirements.txt
```

1. **Install Node.js dependencies:**

```bash
npm install
```

1. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Edit `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key
PYTORCH_LLM_URL=http://localhost:5000
MCP_SERVER_URL=http://localhost:3000
```

## Running the Service

### Start both servers

```bash
npm run start:all
```

### Or start separately

**Python LLM Server:**

```bash
python LLM.py
# Runs on http://localhost:5000
```

**Node.js API Server:**

```bash
node transformer-api-server.js
# Runs on http://localhost:3001
```

## API Endpoints

### Health Check

```bash
GET /health
```

### GPT-3.5 Generation

```bash
POST /api/gpt35/generate
{
  "prompt": "Your prompt here",
  "max_tokens": 150,
  "temperature": 0.7
}
```

### PyTorch Transformer Generation

```bash
POST /api/transformer/generate
{
  "prompt": "Your prompt here",
  "max_length": 100
}
```

### Hybrid Generation

```bash
POST /api/hybrid/generate
{
  "prompt": "Your prompt here",
  "use_gpt": true,
  "max_length": 100
}
```

### Train with Amazon Q Data

```bash
POST /api/train/amazonq
{
  "query": "training data query",
  "mcp_session_id": "optional_session_id"
}
```

### Compare Models

```bash
POST /api/compare
{
  "prompt": "Your prompt here",
  "max_length": 100
}
```

## Model Training

To train the transformer with Amazon Q data via MCP:

```bash
curl -X POST http://localhost:3001/api/train/amazonq \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning tutorials"
  }'
```

## MCP Server Integration

The service connects to an MCP server to access Amazon Q training data. Ensure your MCP server is configured and running before starting training.

### MCP Session Management

```bash
POST /api/mcp/session
{
  "action": "create",
  "config": {
    "provider": "amazon-q"
  }
}
```

## Development

### Run in development mode

```bash
npm run dev
```

### Testing

```bash
# Test PyTorch LLM
curl http://localhost:5000/health

# Test Node.js API
curl http://localhost:3001/health
```

## GPU Support

For GPU acceleration, ensure CUDA is installed:

```bash
# Check CUDA availability
python -c "import torch; print(torch.cuda.is_available())"
```

## Performance

- PyTorch model runs on GPU when available
- API caching can be added for frequently requested prompts
- Consider model quantization for production deployment

## License

MIT
