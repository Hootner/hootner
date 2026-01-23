# 🎬 30-Minute AI Video Generation API

Generate high-quality, cinematic AI videos up to 30 minutes long with optimized chunked processing, HDR support, and real-time progress tracking.

## ✨ Features

- **Long-Form Generation**: Create videos from 1 to 30 minutes
- **Multiple Resolutions**: HD (1920x1080), 2K (2560x1440), 4K (3840x2160), 8K (7680x4320)
- **Quality Presets**: Draft, Medium, High, Cinema
- **HDR10 Support**: 10-bit color with Rec.2020 wide color gamut
- **Chunked Processing**: Optimized 50-second chunks with seamless transitions
- **Real-time Progress**: Track generation progress in real-time
- **Checkpoint Recovery**: Resume failed generations
- **Email Notifications**: Get notified when your video is ready

## 🚀 Quick Start

### Start the API Server

```powershell
# Windows PowerShell
.\start_30min_api.ps1
```

```bash
# Linux/Mac
python long_video_api.py
```

The API will start on **http://localhost:5004**

## 📡 API Endpoints

### 1. Generate 30-Minute Video

**POST** `/api/v1/long-form/generate`

Generate a new 30-minute AI video.

**Request Body:**

```json
{
  "prompt": "A cinematic journey through space with nebulas, stars, and galaxies",
  "duration_minutes": 30,
  "resolution": "4k",
  "fps": 24,
  "quality": "high",
  "hdr_enabled": true,
  "guidance_scale": 7.5,
  "seed": 42,
  "enable_checkpoints": true,
  "email_notification": "user@example.com"
}
```

**Parameters:**

| Parameter            | Type   | Default      | Description                                    |
| -------------------- | ------ | ------------ | ---------------------------------------------- |
| `prompt`             | string | **required** | Text description of the video (max 2000 chars) |
| `duration_minutes`   | float  | 30           | Video duration (1-30 minutes)                  |
| `resolution`         | string | "4k"         | Resolution: hd, 2k, 4k, 8k                     |
| `fps`                | int    | 24           | Frames per second (8-60)                       |
| `quality`            | string | "high"       | Quality: draft, medium, high, cinema           |
| `hdr_enabled`        | bool   | true         | Enable HDR10 output                            |
| `guidance_scale`     | float  | 7.5          | Guidance scale (1.0-15.0)                      |
| `seed`               | int    | null         | Random seed for reproducibility                |
| `enable_checkpoints` | bool   | true         | Enable checkpoint recovery                     |
| `email_notification` | string | null         | Email for completion notification              |

**Response (202 Accepted):**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "estimated_time_minutes": 60,
  "estimated_completion_at": "2026-01-23T14:30:00Z",
  "total_chunks": 36,
  "total_frames": 43200,
  "resolution": "3840x2160",
  "fps": 24,
  "quality": "high",
  "hdr_enabled": true,
  "file_size_estimate_gb": 8.5,
  "progress_url": "/api/v1/long-form/progress/550e8400-e29b-41d4-a716-446655440000",
  "download_url": "/api/v1/long-form/download/550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Check Progress

**GET** `/api/v1/long-form/progress/<job_id>`

Get real-time progress of video generation.

**Response:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress_percent": 45.5,
  "chunks_completed": 16,
  "total_chunks": 36,
  "current_chunk": 17,
  "elapsed_time_minutes": 25.3,
  "estimated_time_remaining_minutes": 30.2,
  "estimated_completion_at": "2026-01-23T14:30:00Z",
  "created_at": "2026-01-23T13:00:00Z",
  "started_at": "2026-01-23T13:05:00Z",
  "completed_at": null,
  "error": null
}
```

**Status Values:**

- `queued`: Waiting to start
- `processing`: Currently generating
- `completed`: Ready for download
- `failed`: Generation failed
- `cancelled`: Cancelled by user

### 3. Download Video

**GET** `/api/v1/long-form/download/<job_id>`

Download the completed video file.

**Response:** MP4 video file

### 4. Cancel Job

**POST** `/api/v1/long-form/cancel/<job_id>`

Cancel an active video generation job.

**Response:**

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "cancelled",
  "message": "Job cancellation requested"
}
```

### 5. List Jobs

**GET** `/api/v1/long-form/list?status=processing&limit=50`

List all video generation jobs.

**Query Parameters:**

- `status` (optional): Filter by status
- `limit` (optional): Max results (default: 50)

**Response:**

```json
{
  "total": 3,
  "jobs": [
    {
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "processing",
      "prompt": "A cinematic journey through space...",
      "duration_minutes": 30,
      "resolution": "4k",
      "progress_percent": 45.5,
      "created_at": "2026-01-23T13:00:00Z"
    }
  ]
}
```

## 🎨 Resolution Presets

| Preset | Resolution | Aspect Ratio | Use Case                       |
| ------ | ---------- | ------------ | ------------------------------ |
| HD     | 1920x1080  | 16:9         | Fast preview, web streaming    |
| 2K     | 2560x1440  | 16:9         | High-quality web, social media |
| 4K     | 3840x2160  | 16:9         | Professional production        |
| 8K     | 7680x4320  | 16:9         | Cinema, large displays         |

## 🎭 Quality Presets

| Quality | Inference Steps | Processing Time     | Use Case         |
| ------- | --------------- | ------------------- | ---------------- |
| Draft   | 20              | Fast (3x speed)     | Quick previews   |
| Medium  | 30              | Moderate (2x speed) | Standard quality |
| High    | 50              | Normal              | Production ready |
| Cinema  | 100             | Slow (0.5x speed)   | Maximum quality  |

## 📊 Technical Specifications

### 30-Minute Video at 4K High Quality

- **Total Frames**: 43,200 (30 min × 60 sec × 24 fps)
- **Total Chunks**: 36 (50-second chunks)
- **Processing Time**: ~60 minutes
- **File Size**: ~8-10 GB (with HDR)
- **Chunk Size**: 1,200 frames (50 seconds)
- **Overlap**: 24 frames (1 second seamless transitions)
- **Checkpoint Interval**: 7,200 frames (5 minutes)

### HDR10 Specifications

- **Bit Depth**: 10-bit color
- **Color Space**: Rec.2020 wide gamut
- **Transfer Function**: PQ (Perceptual Quantizer)
- **Peak Brightness**: 1000-4000 nits
- **Black Level**: 0.005 nits

## 💡 Usage Examples

### Example 1: High-Quality 30-Minute Video

```bash
curl -X POST http://localhost:5004/api/v1/long-form/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cinematic journey through ancient civilizations, showcasing architecture, landscapes, and culture",
    "duration_minutes": 30,
    "resolution": "4k",
    "quality": "high",
    "fps": 24,
    "hdr_enabled": true,
    "seed": 12345,
    "enable_checkpoints": true
  }'
```

### Example 2: Fast Preview (5 Minutes)

```bash
curl -X POST http://localhost:5004/api/v1/long-form/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Abstract colorful patterns morphing and flowing",
    "duration_minutes": 5,
    "resolution": "hd",
    "quality": "draft",
    "fps": 24,
    "hdr_enabled": false
  }'
```

### Example 3: Cinema Quality 8K

```bash
curl -X POST http://localhost:5004/api/v1/long-form/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Epic fantasy landscape with mountains, waterfalls, and magical creatures",
    "duration_minutes": 15,
    "resolution": "8k",
    "quality": "cinema",
    "fps": 24,
    "hdr_enabled": true,
    "guidance_scale": 9.0
  }'
```

### Example 4: Check Progress

```bash
curl http://localhost:5004/api/v1/long-form/progress/550e8400-e29b-41d4-a716-446655440000
```

### Example 5: Download Completed Video

```bash
curl -O http://localhost:5004/api/v1/long-form/download/550e8400-e29b-41d4-a716-446655440000
```

## 🔧 Configuration

### Environment Variables

```bash
ENVIRONMENT=production          # development, staging, production
FLASK_APP=long_video_api.py
FLASK_ENV=production
```

### Configuration Files

- `config/development.yaml` - Development settings
- `config/production.yaml` - Production settings

### Key Settings

```yaml
generation:
  max_num_frames: 43200 # 30 minutes at 24fps
  max_duration_seconds: 1800 # 30 minutes

  long_form:
    enabled: true
    chunk_size: 1200 # 50 seconds
    overlap_frames: 24 # 1 second
    checkpoint_interval: 7200 # 5 minutes
```

## 🐛 Troubleshooting

### Out of Memory Error

**Problem**: GPU runs out of memory during generation

**Solutions**:

1. Reduce resolution (use HD instead of 4K)
2. Reduce quality (use medium instead of high)
3. Reduce chunk size in config
4. Enable gradient checkpointing

### Slow Generation

**Problem**: Video generation takes too long

**Solutions**:

1. Use draft quality for previews
2. Reduce resolution
3. Reduce inference steps
4. Enable model compilation (`compile_model: true`)
5. Use mixed precision (`mixed_precision: true`)

### Chunk Seams Visible

**Problem**: Visible transitions between chunks

**Solutions**:

1. Increase overlap frames (default: 24)
2. Enable temporal smoothing
3. Use higher quality settings

## 📈 Performance Optimization

### Hardware Requirements

**Minimum (HD, Medium Quality)**:

- GPU: 8GB VRAM
- RAM: 16GB
- Storage: 50GB free space

**Recommended (4K, High Quality)**:

- GPU: 24GB VRAM (RTX 3090, A6000)
- RAM: 64GB
- Storage: 500GB NVMe SSD

**Optimal (8K, Cinema Quality)**:

- GPU: 40GB+ VRAM (A100, H100)
- RAM: 128GB
- Storage: 2TB NVMe SSD

### Optimization Tips

1. **Use Mixed Precision**: 2x faster, 50% memory savings
2. **Enable Model Compilation**: 20-30% speedup (PyTorch 2.0+)
3. **Batch Processing**: Generate multiple videos overnight
4. **SSD Storage**: Use NVMe SSD for checkpoints
5. **GPU Utilization**: Monitor with `nvidia-smi`

## 🔐 Security

- Rate limiting: 10 requests per minute per IP
- Input validation: Prompt length, duration, resolution
- File cleanup: Automatic cleanup after 7 days
- Authentication: API key support (production)

## 📊 Monitoring

### Metrics Tracked

- Total generations
- Success rate
- Average processing time
- Storage usage
- GPU utilization
- Error rates

### Log Files

- `analytics/<job_id>.json` - Job metadata
- `outputs/long_form/` - Generated videos
- `checkpoints/` - Recovery checkpoints

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
FROM pytorch/pytorch:2.0.0-cuda11.8-cudnn8-runtime

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt

EXPOSE 5004

CMD ["python", "long_video_api.py"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: long-video-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: long-video-api
  template:
    metadata:
      labels:
        app: long-video-api
    spec:
      containers:
        - name: api
          image: hootner/long-video-api:latest
          ports:
            - containerPort: 5004
          resources:
            limits:
              nvidia.com/gpu: 1
```

## 🎯 Roadmap

- [ ] Multi-GPU support
- [ ] Distributed processing
- [ ] Real-time streaming output
- [ ] Video editing capabilities
- [ ] Custom style transfer
- [ ] Audio generation integration
- [ ] WebSocket progress updates
- [ ] S3/Cloud storage integration

## 📝 License

MIT License - HOOTNER AI Platform

## 🤝 Support

- Email: support@hootner.com
- Discord: https://discord.gg/hootner
- Documentation: https://docs.hootner.com

---

**Made with 🦉 by HOOTNER AI Platform**
