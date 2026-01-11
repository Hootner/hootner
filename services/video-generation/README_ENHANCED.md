# AI Video Generation Service - Enhanced

## 🎬 Overview

Production-ready Python-based AI video generation service with advanced features:

- **Text-to-Video Generation** using 3D U-Net diffusion models
- **WebSocket Support** for real-time progress updates
- **Async Job Queue** with Redis backend
- **Advanced Samplers** (DPM-Solver++, Euler, PLMS, Adaptive)
- **Video Effects** (filters, transitions, color grading)
- **Model Optimization** (mixed precision, checkpointing, quantization)
- **Comprehensive Monitoring** (Prometheus metrics, structured logging)
- **Configuration Management** (YAML-based, environment-specific)

---

## 📁 Service Architecture

```
services/video-generation/
├── api.py                      # Original Flask API
├── api_enhanced.py            # Enhanced API with WebSocket + async jobs
├── generator.py               # Video generation orchestrator
├── unet.py                    # 3D U-Net diffusion model
├── diffusion.py              # DDPM/DDIM diffusion process
├── text_encoder.py           # BERT-based text encoding
├── advanced_samplers.py      # DPM-Solver++, Euler, PLMS, Adaptive
├── video_effects.py          # Post-processing and effects
├── model_optimization.py     # Checkpointing, mixed precision, quantization
├── monitoring.py             # Logging, metrics, profiling
├── config_manager.py         # Configuration management
├── requirements.txt          # Base dependencies
├── requirements_enhanced.txt # Enhanced dependencies
├── install.py                # Auto-installer script
├── config/
│   ├── development.yaml      # Development configuration
│   └── production.yaml       # Production configuration
├── outputs/                  # Generated videos
├── cache/                    # Response cache
├── logs/                     # Application logs
└── checkpoints/              # Model checkpoints
```

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to service directory
cd services/video-generation

# Option 1: Auto-install (recommended)
python install.py

# Option 2: Manual install
pip install -r requirements_enhanced.txt

# Option 3: Development install
pip install -r requirements_enhanced.txt
pip install -e .
```

### Running the Service

```bash
# Development mode (basic API)
python api.py

# Enhanced mode (WebSocket + async jobs)
python api_enhanced.py

# With custom port
PORT=5003 python api_enhanced.py

# Production mode
ENVIRONMENT=production python api_enhanced.py

# With Redis (for job queue)
docker run -d -p 6379:6379 redis:alpine
python api_enhanced.py
```

**Default URLs:**
- API: http://localhost:5003
- Health check: http://localhost:5003/health
- Metrics: http://localhost:5003/metrics
- WebSocket: ws://localhost:5003/generation

---

## 📖 API Documentation

### Synchronous Generation

**POST** `/generate`

Generate video from text prompt (synchronous).

```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A robot dancing in the rain",
    "num_frames": 16,
    "height": 64,
    "width": 64,
    "fps": 8,
    "num_inference_steps": 50,
    "guidance_scale": 7.5,
    "seed": 42,
    "format": "gif"
  }'
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "download_url": "/download/uuid.gif",
  "generation_time": 30.5,
  "metadata": {
    "prompt": "A robot dancing in the rain",
    "num_frames": 16,
    "resolution": "64x64",
    "fps": 8,
    "device": "cuda"
  }
}
```

### Asynchronous Generation

**POST** `/generate` (with `"async": true`)

```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat playing piano",
    "async": true,
    "use_cache": true
  }'
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "queued",
  "message": "Job queued for processing",
  "websocket_url": "/generation",
  "status_url": "/status/uuid"
}
```

### Batch Generation

**POST** `/batch`

Generate multiple videos from a list of prompts.

```bash
curl -X POST http://localhost:5003/batch \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": [
      "A sunset over mountains",
      "Ocean waves at night",
      "City lights timelapse"
    ],
    "params": {
      "num_frames": 16,
      "height": 64,
      "width": 64
    }
  }'
```

### Job Status

**GET** `/status/<job_id>`

Get the status of an async job.

```bash
curl http://localhost:5003/status/uuid
```

### Download Video

**GET** `/download/<filename>`

Download generated video.

```bash
curl http://localhost:5003/download/uuid.gif -O
```

### Health Check

**GET** `/health`

```bash
curl http://localhost:5003/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "video-generation-enhanced",
  "version": "2.0.0",
  "device": "cuda",
  "cuda_available": true,
  "gpu_name": "NVIDIA RTX 3090",
  "queue_size": 0,
  "active_jobs": 0,
  "redis_connected": true
}
```

### Metrics

**GET** `/metrics`

Prometheus-compatible metrics endpoint.

```bash
curl http://localhost:5003/metrics
```

---

## 🔌 WebSocket API

Connect to `ws://localhost:5003/generation` for real-time updates.

### Client Example

```javascript
const socket = io('http://localhost:5003/generation');

// Subscribe to job updates
socket.emit('subscribe', { job_id: 'uuid' });

// Listen for progress
socket.on('progress', (data) => {
  console.log(`Progress: ${data.progress}% (${data.step}/${data.total})`);
});

// Listen for completion
socket.on('completed', (data) => {
  console.log('Job completed!', data);
  console.log('Download URL:', data.download_url);
});

// Listen for errors
socket.on('error', (data) => {
  console.error('Error:', data.error);
});
```

### Python Client Example

```python
from socketio import Client

sio = Client()

@sio.on('progress', namespace='/generation')
def on_progress(data):
    print(f"Progress: {data['progress']}%")

@sio.on('completed', namespace='/generation')
def on_completed(data):
    print(f"Completed! Download: {data['download_url']}")

sio.connect('http://localhost:5003')
sio.emit('subscribe', {'job_id': 'uuid'}, namespace='/generation')
sio.wait()
```

---

## 🎨 Video Effects

Apply post-processing effects to generated videos.

### Available Effects

```python
from video_effects import VideoEffects, apply_effects_pipeline

effects = VideoEffects()

# Color grading
video = effects.adjust_brightness(video, factor=1.2)
video = effects.adjust_contrast(video, factor=1.1)
video = effects.adjust_saturation(video, factor=1.3)
video = effects.color_temperature(video, temperature=20)

# Artistic filters
video = effects.blur(video, kernel_size=5)
video = effects.sharpen(video, strength=1.0)
video = effects.vignette(video, strength=0.5)
video = effects.posterize(video, levels=4)

# LUT presets
video = effects.apply_lut(video, lut_name="cinematic")
# Options: cinematic, vintage, vivid, noir

# Transitions
video = effects.fade_in(video, duration=8)
video = effects.fade_out(video, duration=8)
video = effects.crossfade(video1, video2, duration=8)

# Motion effects
video = effects.zoom(video, start_scale=1.0, end_scale=1.5)
video = effects.pan(video, direction="right", distance=0.2)
video = effects.rotate(video, start_angle=0, end_angle=45)

# Temporal effects
video = effects.temporal_smooth(video, window=3)
video = effects.slow_motion(video, factor=2.0)
video = effects.reverse(video)

# Composite presets
video = effects.apply_preset(video, preset="cinematic")
# Options: cinematic, vintage, dramatic, dreamy, vivid
```

---

## 🔧 Configuration

### Environment-Specific Configs

Configurations are stored in YAML files:
- `config/development.yaml` - Development settings
- `config/production.yaml` - Production settings

### Loading Configuration

```python
from config_manager import load_config

# Load config for current environment (from ENVIRONMENT env var)
config = load_config()

# Load specific environment
config = load_config(environment="production")

# Access configuration values
port = config.get('server.port')
model_size = config.get('model.size')
debug = config.get('server.debug')

# Set configuration values
config.set('server.port', 8080)

# Save configuration
config.save()
```

### Environment Variables

Set these in your environment or `.env` file:

```bash
# Environment
ENVIRONMENT=production

# Server
PORT=5003

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Security
VIDEO_GEN_API_KEY=your_api_key

# Model
MODEL_SIZE=base
DEVICE=cuda
```

---

## 📊 Monitoring

### Structured Logging

```python
from monitoring import logger

# Log with context
logger.info("Video generation started", 
            job_id="uuid",
            prompt="A robot dancing",
            num_frames=16)

# Log errors
try:
    generate_video()
except Exception as e:
    logger.error("Generation failed", error=e, job_id="uuid")

# Log metrics
logger.metric("generation_time", 30.5, job_id="uuid")
```

### Prometheus Metrics

```python
from monitoring import metrics

# Increment counter
metrics.inc_counter("video_generations_total", labels={"status": "success"})

# Set gauge
metrics.set_gauge("queue_size", 10)

# Observe histogram
metrics.observe_histogram("generation_time_seconds", 30.5)

# Export metrics
prometheus_format = metrics.export_prometheus()
```

### Performance Profiling

```python
from monitoring import profiler

# Profile function
@profiler.timer()
def generate_video():
    ...

# Profile code block
with profiler.time_block("text_encoding"):
    embeddings = encoder.encode(prompt)

# Print statistics
profiler.print_stats()
```

---

## 🚀 Advanced Features

### Model Checkpointing

```python
from model_optimization import ModelCheckpointer

checkpointer = ModelCheckpointer(checkpoint_dir="./checkpoints")

# Save checkpoint
checkpointer.save_checkpoint(
    model=unet,
    version="v1.0.0",
    optimizer=optimizer,
    epoch=100,
    loss=0.05
)

# Load checkpoint
checkpoint = checkpointer.load_checkpoint(
    version="v1.0.0",
    model=unet,
    optimizer=optimizer
)

# List checkpoints
versions = checkpointer.list_checkpoints()

# Cleanup old checkpoints
checkpointer.cleanup_old_checkpoints(keep_latest=5)
```

### Mixed Precision Training

```python
from model_optimization import MixedPrecisionTrainer

trainer = MixedPrecisionTrainer(enabled=True, dtype="float16")

# Training loop
for batch in dataloader:
    optimizer.zero_grad()
    
    with trainer.autocast():
        output = model(batch)
        loss = criterion(output, target)
    
    loss_scaled = trainer.scale_loss(loss)
    loss_scaled.backward()
    
    trainer.step(optimizer)
```

### Advanced Samplers

```python
from advanced_samplers import create_sampler

# Create DPM-Solver++ sampler
sampler = create_sampler(
    sampler_type="dpm",
    num_timesteps=1000,
    solver_order=2
)

# Generate with sampler
video = sampler.sample(
    model=unet,
    shape=(1, 3, 16, 64, 64),
    num_steps=20,
    conditioning=text_embeddings
)

# Other samplers: euler, adaptive, plms
```

---

## 🐳 Docker Deployment

### Build Image

```bash
# Build production image
docker build -t hootner/video-generation:latest .

# Build with specific Python version
docker build --build-arg PYTHON_VERSION=3.10 -t hootner/video-generation:latest .
```

### Run Container

```bash
# Run with GPU support
docker run -d \
  --name video-generation \
  --gpus all \
  -p 5003:5003 \
  -e ENVIRONMENT=production \
  -e REDIS_HOST=redis \
  -v /path/to/checkpoints:/app/checkpoints \
  -v /path/to/outputs:/app/outputs \
  hootner/video-generation:latest

# Run with CPU only
docker run -d \
  --name video-generation \
  -p 5003:5003 \
  -e DEVICE=cpu \
  hootner/video-generation:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  video-generation:
    image: hootner/video-generation:latest
    ports:
      - "5003:5003"
    environment:
      - ENVIRONMENT=production
      - REDIS_HOST=redis
      - DEVICE=cuda
    volumes:
      - ./checkpoints:/app/checkpoints
      - ./outputs:/app/outputs
      - ./logs:/app/logs
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

---

## 📈 Performance Optimization

### Recommended Settings

**Development:**
- Model size: `small` or `base`
- Steps: 20-50
- Mixed precision: Enabled
- Compile model: Disabled

**Production:**
- Model size: `base` or `large`
- Steps: 50
- Mixed precision: Enabled
- Compile model: Enabled
- Gradient checkpointing: Enabled

### Benchmarks

| Configuration | GPU | Resolution | Frames | Steps | Time |
|--------------|-----|-----------|--------|-------|------|
| Small + DPM | RTX 3090 | 64x64 | 16 | 20 | ~15s |
| Base + DPM | RTX 3090 | 64x64 | 16 | 50 | ~30s |
| Base + Euler | RTX 3090 | 128x128 | 16 | 50 | ~45s |
| Large + DPM | A100 | 256x256 | 32 | 50 | ~120s |

---

## 🔒 Security

### API Key Authentication

Enable API key authentication in production:

```yaml
# config/production.yaml
security:
  api_key:
    enabled: true
    header_name: "X-API-Key"
    key: "${VIDEO_GEN_API_KEY}"
```

Set the API key:
```bash
export VIDEO_GEN_API_KEY="your-secret-key"
```

Use in requests:
```bash
curl -X POST http://localhost:5003/generate \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A robot dancing"}'
```

### Rate Limiting

Configured per environment:
- Development: 20 requests / 60 seconds
- Production: 100 requests / 60 seconds

### CORS

Configure allowed origins in config file:
```yaml
security:
  cors:
    enabled: true
    origins:
      - "https://hootner.com"
      - "https://app.hootner.com"
```

---

## 🧪 Testing

### Unit Tests

```bash
pytest tests/ -v
```

### Integration Tests

```bash
pytest tests/integration/ -v
```

### Load Testing

```bash
# Install k6
# https://k6.io/docs/getting-started/installation/

# Run load test
k6 run load_test.js
```

---

## 🐛 Troubleshooting

### Common Issues

**"CUDA out of memory"**
- Reduce batch size
- Enable gradient checkpointing
- Use smaller model
- Reduce resolution/frames

**"Redis connection failed"**
- Check Redis is running: `redis-cli ping`
- Verify Redis host/port in config
- Service will fall back to in-memory queue

**"Model loading failed"**
- Check checkpoint path exists
- Verify model weights compatibility
- Ensure sufficient disk space

**"Slow generation"**
- Enable mixed precision training
- Use DPM-Solver++ with fewer steps
- Enable model compilation (PyTorch 2.0+)
- Check GPU is being used: verify `device: cuda` in health check

### Debug Mode

Enable debug logging:
```bash
# In config
monitoring:
  logging:
    level: "DEBUG"

# Or via environment
export LOG_LEVEL=DEBUG
python api_enhanced.py
```

---

## 📚 Additional Resources

- [Original README](../README.md) - Main HOOTNER documentation
- [Service Architecture](../../docs/services/video-generation.md) - Detailed architecture
- [AI Agent Orchestration](../../docs/AI_AGENT_ORCHESTRATION.md) - Agent integration
- [Deployment Guide](../../docs/deployment/) - Production deployment

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 📄 License

MIT License - See [LICENSE](../../LICENSE)

---

## 🦉 HOOTNER Platform

Part of the HOOTNER AI video streaming platform.

**Made with 🦉 by the HOOTNER Team**
