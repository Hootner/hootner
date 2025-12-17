# 🤖 AI Services Commands Reference

## 🚀 Quick Start AI Services

```bash
# Setup AI video generation
npm run ai:setup

# Install video generation dependencies
npm run video:install

# Start video generation API
npm run video:start

# Run video generation example
npm run video:example

# Start all AI services
npm run services:start
```

## 🎬 Video Generation Service

```bash
# Navigate to video generation service
cd services/video-generation

# Install Python dependencies
python install.py
pip install -r requirements.txt

# Start video generation API
python api.py
npm run video:start

# Run example generation
python example.py
npm run video:example

# Test video generation
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset over mountains", "duration": 5}'
```

## 🧠 AI Model Management

```bash
# Download AI models
cd services/video-generation
python -c "from diffusion import download_models; download_models()"

# Update models
python -c "from diffusion import update_models; update_models()"

# List available models
python -c "from diffusion import list_models; list_models()"

# Model health check
python -c "from diffusion import health_check; health_check()"
```

## 🎨 AI Code Editor (Cursor-Style)

```bash
# Start AI-enhanced code editor
cd apps/frontend/html-pages
open code-editor.html

# AI modes available:
# - Chat Mode (Ctrl+K): Conversational assistance
# - Write Mode (Ctrl+L): Full code generation
# - Refactor Mode: Intelligent transformations
# - Modernize Mode: Legacy to TypeScript conversion
```

## 🤖 Multi-Agent Orchestration

```bash
# Start multi-agent orchestrator
node lib/multi-agent-orchestrator.js

# Test agent coordination
curl -X POST http://localhost:3020/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"task": "analyze_and_optimize", "target": "frontend"}'

# Monitor agent activities
node lib/multi-agent-orchestrator.js --monitor

# Agent health check
curl http://localhost:3020/health
```

## 🎯 AI Content Moderation

```bash
# Start content moderation service
node services/content-moderation-service.js

# Test content moderation
curl -X POST http://localhost:3005/moderate \
  -H "Content-Type: application/json" \
  -d '{"content": "Test content to moderate", "type": "text"}'

# Moderate image content
curl -X POST http://localhost:3005/moderate/image \
  -F "image=@test-image.jpg"

# Moderate video content
curl -X POST http://localhost:3005/moderate/video \
  -F "video=@test-video.mp4"
```

## 🔍 AI Search Service

```bash
# Start AI-powered search service
node services/search-service.js

# Semantic search
curl -X POST http://localhost:3009/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "funny cat videos", "limit": 10}'

# AI-enhanced search
curl -X POST http://localhost:3009/search/ai \
  -H "Content-Type: application/json" \
  -d '{"query": "videos similar to dancing", "context": "entertainment"}'

# Search analytics
curl http://localhost:3009/analytics/search-trends
```

## 🤖 AI Police Bot Service

```bash
# Start AI police bot
node services/police-bot-service.js

# Monitor for violations
curl http://localhost:3016/monitor/status

# Report violation
curl -X POST http://localhost:3016/report \
  -H "Content-Type: application/json" \
  -d '{"type": "spam", "content": "suspicious content", "user_id": "123"}'

# Get violation statistics
curl http://localhost:3016/stats/violations
```

## 🧠 AI Analytics Service

```bash
# Start AI analytics
node services/analytics-service.js

# Generate AI insights
curl -X POST http://localhost:3003/ai/insights \
  -H "Content-Type: application/json" \
  -d '{"metric": "user_engagement", "timeframe": "7d"}'

# Predictive analytics
curl -X POST http://localhost:3003/ai/predict \
  -H "Content-Type: application/json" \
  -d '{"model": "user_churn", "data": {...}}'

# AI-powered recommendations
curl http://localhost:3003/ai/recommendations/user/123
```

## 🎨 Visual AI Designer

```bash
# Start visual designer
node lib/visual-designer.js

# Access visual designer
open http://localhost:3000/visual-designer.html

# AI-powered UI generation
curl -X POST http://localhost:3021/generate/ui \
  -H "Content-Type: application/json" \
  -d '{"description": "modern dashboard with charts", "style": "minimalist"}'

# Component suggestions
curl -X POST http://localhost:3021/suggest/components \
  -H "Content-Type: application/json" \
  -d '{"context": "user profile page", "framework": "react"}'
```

## 🔄 Real-time AI Collaboration

```bash
# Start AI collaboration server
node lib/realtime-collab.js

# Join AI-assisted session
curl -X POST http://localhost:3022/session/join \
  -H "Content-Type: application/json" \
  -d '{"session_id": "abc123", "user_id": "user456"}'

# AI conflict resolution
curl -X POST http://localhost:3022/resolve/conflict \
  -H "Content-Type: application/json" \
  -d '{"conflict_id": "conflict789", "strategy": "ai_merge"}'
```

## 🌱 AI Sustainability Monitor

```bash
# Start sustainability monitoring
node lib/sustainability-monitor.js

# Check AI energy usage
curl http://localhost:3023/energy/ai-services

# Carbon footprint analysis
curl http://localhost:3023/carbon/analysis

# Optimization suggestions
curl http://localhost:3023/optimize/suggestions
```

## 🔒 AI Ethics & Compliance

```bash
# Start compliance dashboard
node lib/compliance-dashboard.js

# AI ethics audit
curl http://localhost:3024/audit/ethics

# Bias detection
curl -X POST http://localhost:3024/detect/bias \
  -H "Content-Type: application/json" \
  -d '{"model": "content_moderation", "dataset": "test_data"}'

# Generate compliance report
curl http://localhost:3024/report/compliance
```

## 🧪 AI Testing & Validation

```bash
# Test AI video generation
cd services/video-generation
python -m pytest tests/

# Test AI models
python tests/test_diffusion.py
python tests/test_text_encoder.py
python tests/test_unet.py

# AI service integration tests
npm run test:ai-services
node tests/ai/video-generation-test.js
node tests/ai/content-moderation-test.js
```

## 📊 AI Performance Monitoring

```bash
# Monitor AI service performance
curl http://localhost:8000/metrics  # Video generation
curl http://localhost:3005/metrics  # Content moderation
curl http://localhost:3009/metrics  # Search service

# AI model performance
curl http://localhost:8000/model/performance
curl http://localhost:3005/model/accuracy

# Resource usage
curl http://localhost:8000/resources/gpu
curl http://localhost:8000/resources/memory
```

## 🔧 AI Configuration

```bash
# Configure video generation models
export MODEL_PATH="/path/to/models"
export GPU_MEMORY_LIMIT="8GB"
export BATCH_SIZE="4"

# Configure AI services
export AI_API_KEY="your-api-key"
export AI_MODEL_VERSION="v2.1"
export AI_TIMEOUT="30s"

# Update AI configurations
node scripts/update-ai-config.js
```

## 🚀 AI Deployment

```bash
# Deploy AI services to Docker
docker-compose -f docker-compose.ai.yml up -d

# Deploy to Kubernetes
kubectl apply -f k8s/ai-services/

# Scale AI services
kubectl scale deployment video-generation --replicas=3
docker-compose up -d --scale ai-worker=5
```

## 🔍 AI Debugging

```bash
# Debug video generation
cd services/video-generation
python api.py --debug

# Debug AI models
python -c "from diffusion import debug_model; debug_model()"

# AI service logs
docker-compose logs -f video-generation
kubectl logs -f deployment/ai-content-moderation
```

## 📋 AI Service Status

```bash
# Check all AI services
curl http://localhost:8000/health    # Video generation
curl http://localhost:3005/health    # Content moderation
curl http://localhost:3009/health    # Search service
curl http://localhost:3016/health    # Police bot
curl http://localhost:3020/health    # Multi-agent orchestrator

# AI service dashboard
open http://localhost:3000/ai-dashboard.html
```

## 🤖 AI Development Workflow

```bash
# 1. Setup AI environment
npm run ai:setup

# 2. Start AI services
npm run services:start

# 3. Test AI functionality
npm run test:ai-services

# 4. Monitor AI performance
curl http://localhost:3000/ai-metrics

# 5. Deploy AI updates
npm run deploy:ai-services
```