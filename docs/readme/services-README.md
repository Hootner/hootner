# 🎬 HOOTNER Video Generation Service

AI-powered text-to-video generation using 3D U-Net diffusion models.

## 🚀 Quick Start

```bash
# Auto-install dependencies
python install.py

# Start API service
python api.py

# Run examples
python example.py
```

## 📦 Dependencies

Core ML packages auto-installed by `install.py`:

- PyTorch 2.0+
- einops, rotary-embedding-torch
- transformers (BERT)
- PIL, numpy, opencv-python

## 🎯 Usage

### Direct Usage

```python
from generator import VideoGenerator

generator = VideoGenerator()
generator.generate_video("A robot dancing", "output.gif")
```

### API Usage

```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cat playing piano"}'
```

### HOOTNER Integration

```javascript
// In your React component
const generateVideo = async prompt => {
  const response = await fetch('/api/video-generation/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
};
```

## 🏗️ Architecture

```
video-generation/
├── unet.py          # 3D U-Net model
├── diffusion.py     # Gaussian diffusion process
├── text_encoder.py  # BERT text conditioning
├── generator.py     # Main orchestrator
├── api.py          # Flask REST API
├── install.py      # Auto-installer
└── example.py      # Usage examples
```

## 🔧 Configuration

Default settings (modify in generator.py):

- **Frames**: 16 (1-2 seconds at 8fps)
- **Resolution**: 64x64 (fast generation)
- **Model**: 3D U-Net with temporal attention
- **Timesteps**: 1000 (diffusion steps)

## 🎨 Features

- **Text-to-Video**: Natural language prompts
- **Fast Generation**: Optimized 3D U-Net
- **REST API**: Easy integration
- **GIF Export**: Ready for web use
- **Auto-Install**: Zero-config setup

## 🔗 Integration Points

### Video Player

```javascript
// Add to video-player.html
const aiGenerate = async prompt => {
  const video = await generateVideo(prompt);
  addToCarousel(video.download_url);
};
```

### Marketplace

```javascript
// Premium AI video generation feature
const premiumGenerate = async (prompt, userId) => {
  if (!hasPremium(userId)) throw new Error('Premium required');
  return generateVideo(prompt);
};
```

### Social Feed

```javascript
// Generate videos for posts
const createAIPost = async (prompt, userId) => {
  const video = await generateVideo(prompt);
  return createPost({ userId, videoUrl: video.download_url });
};
```

## 🚀 Production Deployment

### Docker

```dockerfile
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5003
CMD ["python", "api.py"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-generation
spec:
  replicas: 2
  selector:
    matchLabels:
      app: video-generation
  template:
    spec:
      containers:
        - name: video-generation
          image: hootner/video-generation:latest
          ports:
            - containerPort: 5003
```

## 🎯 Performance

- **Generation Time**: ~30 seconds (64x64, 16 frames)
- **Memory Usage**: ~4GB GPU / 8GB RAM
- **Throughput**: ~2 videos/minute (single GPU)
- **Quality**: Research-grade diffusion model

## 🔮 Future Enhancements

- **Higher Resolution**: 256x256, 512x512
- **Longer Videos**: 30+ seconds
- **Style Transfer**: Apply artistic styles
- **Motion Control**: Precise movement direction
- **Face Animation**: Character-driven videos

## 🦉 HOOTNER Integration

This service integrates seamlessly with:

- **Video Player**: AI-generated content in carousel
- **Marketplace**: Premium AI video features
- **Social Feed**: User-generated AI content
- **Analytics**: Track generation metrics
- **Moderation**: AI content filtering

Perfect for the "Owl Never Sleeps" platform! 🌙
