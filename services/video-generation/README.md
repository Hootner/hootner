# 🎬 Video Generation Service

Production-ready AI text-to-video generation using optimized 3D U-Net with memory-efficient attention.

## 🚀 Quick Start

```bash
# 1. Install dependencies (auto-detects CUDA)
python install.py

# 2. Test generation
python generator.py

# 3. Start REST API
python api.py
```

**API Ready** → [http://localhost:5003](http://localhost:5003/health)

---

## 📦 Architecture

### Core Components

1. **unet.py** (754 lines) - 3D U-Net with Memory-Efficient Attention
   - MemoryEfficientAttention: O(N) chunked computation vs O(N²)
   - FlashAttention3D: Temporal windowing for video
   - Separable 3D convolutions (spatial + temporal)
   - Gradient checkpointing for memory optimization
   - 3 model sizes: small (15M), base (50M), large (200M)

2. **diffusion.py** (461 lines) - DDPM/DDIM Diffusion Process
   - Gaussian diffusion with cosine/linear/quadratic schedules
   - DDIM sampling: 50 steps vs 1000 (20x faster)
   - Classifier-free guidance for quality control
   - Progressive sampling (coarse-to-fine)
   - Batch processing support

3. **text_encoder.py** (257 lines) - BERT Text Conditioning
   - BERT-based embeddings (768-dim)
   - 6-layer transformer encoder (8 attention heads)
   - Cross-attention blocks for U-Net conditioning
   - Max sequence length: 77 tokens
   - Mean pooling for text embeddings

4. **generator.py** (394 lines) - Video Generation Orchestrator
   - Main API: `generate(prompt, num_frames, ...)`
   - Classifier-free guidance (scale 7.5)
   - Seed control for reproducibility
   - GIF/MP4 export with post-processing
   - Batch generation support

5. **api.py** (334 lines) - Flask REST API
   - `/generate` - Single video generation
   - `/batch` - Multiple videos
   - `/download/<file>` - Download results
   - Rate limiting (10 req/min)
   - CORS support for frontend

---

## 🎯 Features

### Memory Optimizations

✅ **Chunked Attention** - O(N) memory instead of O(N²)
✅ **Flash Attention** - Temporal windowing for videos
✅ **Gradient Checkpointing** - Trade compute for memory
✅ **Separable Convolutions** - 3D → 2D spatial + 1D temporal

### Quality Features

✅ **Classifier-Free Guidance** - Balance quality vs diversity
✅ **DDIM Sampling** - 50 steps vs 1000 (20x faster)
✅ **Text Conditioning** - BERT embeddings with cross-attention
✅ **Progressive Sampling** - Coarse-to-fine generation

### Production Features

✅ **REST API** - Flask with CORS, rate limiting
✅ **Batch Processing** - Multiple prompts in one request
✅ **Format Support** - GIF and MP4 export
✅ **Health Checks** - `/health` endpoint
✅ **Error Handling** - Comprehensive try/catch

---

## 📖 API Reference

### POST /generate

Generate single video from text prompt.

**Request:**

```json
{
  "prompt": "A robot dancing in space",
  "num_frames": 16,
  "height": 64,
  "width": 64,
  "fps": 8,
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "seed": 42,
  "format": "gif"
}
```

**Response:**

```json
{
  "job_id": "uuid-here",
  "status": "completed",
  "download_url": "/download/uuid.gif",
  "generation_time": 30.5,
  "metadata": {
    "prompt": "A robot dancing in space",
    "num_frames": 16,
    "height": 64,
    "width": 64
  }
}
```

**Parameters:**

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `prompt` | string | required | 1-500 chars | Text description |
| `num_frames` | int | 16 | 4-64 | Video length |
| `height` | int | 64 | 32-512 | Frame height |
| `width` | int | 64 | 32-512 | Frame width |
| `fps` | int | 8 | 1-60 | Frames per second |
| `num_inference_steps` | int | 50 | 1-1000 | Sampling steps |
| `guidance_scale` | float | 7.5 | 1.0-20.0 | Quality control |
| `seed` | int | null | any | Reproducibility |
| `format` | string | "gif" | gif/mp4 | Output format |

---

### POST /batch

Generate multiple videos from multiple prompts.

**Request:**

```json
{
  "prompts": [
    "A robot dancing",
    "A cat sleeping",
    "Mountains at sunset"
  ],
  "num_frames": 16,
  "height": 64,
  "width": 64
}
```

**Response:**

```json
{
  "status": "completed",
  "count": 3,
  "results": [
    {
      "job_id": "uuid-1",
      "prompt": "A robot dancing",
      "download_url": "/download/uuid-1.gif",
      "generation_time": 28.3
    },
    ...
  ]
}
```

**Limits:**

- Max 10 prompts per batch
- Max 500 characters per prompt
- Rate limit: 10 requests per minute

---

### GET /download/{filename}

Download generated video file.

**Response:** Binary file (GIF or MP4)

---

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "service": "video-generation",
  "version": "1.0.0",
  "device": "cuda:0",
  "timestamp": "2026-01-10T12:00:00Z"
}
```

---

### GET /models

List available model sizes.

**Response:**

```json
{
  "models": [
    {
      "name": "base",
      "description": "Balanced model for production",
      "parameters": "~50M",
      "recommended": true
    },
    ...
  ]
}
```

---

### GET /stats

Get generation statistics.

**Response:**

```json
{
  "total_generations": 42,
  "storage_used_mb": 156.7,
  "device": "cuda:0",
  "model_size": "base"
}
```

---

## 💻 Python API

### Basic Usage

```python
from generator import VideoGenerator

# Initialize generator
generator = VideoGenerator(
    model_size="base",      # small/base/large
    timesteps=1000,
    guidance_scale=7.5
)

# Generate video
video = generator.generate(
    prompt="A robot dancing in space",
    num_frames=16,
    height=64,
    width=64,
    fps=8,
    num_inference_steps=50,  # DDIM: 50 steps
    guidance_scale=7.5,      # Higher = more faithful to prompt
    seed=42,                 # For reproducibility
    output_path="output.gif"
)

print(f"Generated video shape: {video.shape}")  # (16, 3, 64, 64)
```

### Advanced Features

```python
# Batch generation
videos = generator.generate_batch(
    prompts=["prompt1", "prompt2", "prompt3"],
    num_frames=16,
    height=64,
    width=64
)

# Video interpolation
long_video = generator.interpolate(
    video,
    target_frames=32  # Double the length
)

# Training (if you have dataset)
generator.train_step(
    videos,  # (B, C, F, H, W)
    texts    # List of text prompts
)
```

---

## ⚙️ Configuration

### Model Sizes

| Size | Parameters | Memory | Speed | Quality |
|------|-----------|--------|-------|---------|
| **small** | ~15M | 2GB | Fast | Good |
| **base** | ~50M | 4GB | Medium | Better |
| **large** | ~200M | 8GB | Slow | Best |

### Performance Tuning

**For Low Memory (4GB GPU):**

```python
generator = VideoGenerator(
    model_size="small",
    timesteps=1000,
    guidance_scale=5.0  # Lower guidance
)

video = generator.generate(
    prompt="...",
    num_frames=8,      # Fewer frames
    height=64,         # Lower resolution
    width=64,
    num_inference_steps=25  # Fewer steps
)
```

**For High Quality (16GB+ GPU):**

```python
generator = VideoGenerator(
    model_size="large",
    timesteps=1000,
    guidance_scale=10.0  # Higher guidance
)

video = generator.generate(
    prompt="...",
    num_frames=32,     # More frames
    height=256,        # Higher resolution
    width=256,
    num_inference_steps=100  # More steps
)
```

---

## 🧪 Testing

### Run Test Suite

```bash
python generator.py
```

**Test Scenarios:**

1. Basic generation (16 frames, 64x64)
2. High resolution (128x128)
3. Batch generation (3 prompts)

### Load Testing API

```bash
# Install k6
# https://k6.io/docs/getting-started/installation/

# Run load test
k6 run - <<EOF
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const payload = JSON.stringify({
    prompt: 'A robot dancing',
    num_frames: 8,
    height: 64,
    width: 64
  });

  const res = http.post('http://localhost:5003/generate', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
EOF
```

---

## 📊 Performance Benchmarks

### Generation Times (Base Model)

| Resolution | Frames | Steps | GPU (RTX 3090) | CPU (32 cores) |
|-----------|--------|-------|----------------|----------------|
| 64x64 | 16 | 50 | ~8s | ~120s |
| 128x128 | 16 | 50 | ~30s | ~450s |
| 256x256 | 16 | 50 | ~120s | ~1800s |

### Memory Usage

| Model Size | Training | Inference | Min GPU |
|-----------|----------|-----------|---------|
| Small | 4GB | 2GB | GTX 1060 (6GB) |
| Base | 8GB | 4GB | RTX 2060 (8GB) |
| Large | 16GB | 8GB | RTX 3090 (24GB) |

---

## 🔧 Troubleshooting

### CUDA Out of Memory

```python
# Solution 1: Use smaller model
generator = VideoGenerator(model_size="small")

# Solution 2: Reduce batch size
video = generator.generate(..., num_frames=8)  # Instead of 16

# Solution 3: Lower resolution
video = generator.generate(..., height=32, width=32)
```

### Slow Generation (CPU)

```bash
# Install PyTorch with CUDA
pip uninstall torch torchvision torchaudio
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### API Rate Limiting

Increase rate limit in `api.py`:

```python
RATE_LIMIT_REQUESTS = 20  # Instead of 10
```

---

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service files
COPY . /app
WORKDIR /app

EXPOSE 5003

CMD ["python", "api.py"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-generation
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: hootner/video-generation:latest
        ports:
        - containerPort: 5003
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4"
            nvidia.com/gpu: 1
```

---

## 🤝 Integration with Frontend

### React Example

```typescript
// src/services/videoGeneration.ts
export async function generateVideo(prompt: string) {
  const response = await fetch('http://localhost:5003/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      num_frames: 16,
      height: 64,
      width: 64,
      format: 'gif',
    }),
  });

  const data = await response.json();
  return data;
}

// Usage in component
import { generateVideo } from './services/videoGeneration';

function VideoPlayer() {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateVideo('A robot dancing');
    setVideoUrl(`http://localhost:5003${result.download_url}`);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate Video</button>
      {loading && <p>Generating...</p>}
      {videoUrl && <img src={videoUrl} alt="Generated video" />}
    </div>
  );
}
```

---

## 📚 References

### Research Papers

- **Denoising Diffusion Probabilistic Models (DDPM)** - Ho et al., 2020
- **Denoising Diffusion Implicit Models (DDIM)** - Song et al., 2020
- **Classifier-Free Guidance** - Ho & Salimans, 2021
- **Flash Attention** - Dao et al., 2022

### Implementation Details

- 3D U-Net architecture based on Stable Diffusion
- Memory-efficient attention: O(N) vs O(N²)
- Gradient checkpointing for large batches
- BERT text conditioning with cross-attention

---

## 📝 License

MIT License - See [LICENSE](../../LICENSE)

---

## 🦉 Support

**HOOTNER Code Guardian**
📧 <support@hootner.com>
💬 [Discord Community](https://discord.gg/hootner)
🐛 [GitHub Issues](https://github.com/hootner/issues)

---

<div align="center">

**Made with 🦉 by the HOOTNER AI Team**

</div>
