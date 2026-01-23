# 🎬 AI Video Generation - Complete Setup Guide

## ✅ REAL AI VIDEO GENERATION IS READY!

Your platform now uses **actual diffusion models** (DDPM/DDIM) with PyTorch for video generation!

---

## 🚀 Quick Start

### **Option 1: Start Python API (Recommended)**

```bash
# Navigate to video generation service
cd services/video-generation

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the API server
python api.py
```

**API will run on:** http://localhost:5003

### **Option 2: Use Canvas Fallback**

If Python API isn't available, the system automatically falls back to canvas-based generation.

---

## 🎨 How It Works

### **With Python API (REAL AI):**
1. Frontend sends prompt to `http://localhost:5003/generate`
2. Python diffusion model generates video frames
3. Saves as MP4/GIF with real AI effects
4. Returns download URL
5. Video appears in "My Videos"

### **With Canvas Fallback:**
1. Creates animated canvas frames
2. Theme-based colors (ocean, sunset, neon, etc.)
3. Particle effects & waves
4. Saves locally to localStorage
5. Still downloadable!

---

## 📡 API Endpoints

### `POST /generate`
Generate video from text prompt

**Request:**
```json
{
  "prompt": "A robot dancing",
  "num_frames": 120,
  "height": 720,
  "width": 1280,
  "fps": 24,
  "num_inference_steps": 50,
  "guidance_scale": 7.5,
  "seed": 42,
  "format": "mp4"
}
```

**Response:**
```json
{
  "job_id": "abc-123",
  "status": "processing",
  "download_url": "/download/abc-123.mp4",
  "generation_time": 45.2,
  "metadata": {
    "prompt": "A robot dancing",
    "frames": 120,
    "resolution": "1280x720"
  }
}
```

### `GET /status/{job_id}`
Check generation progress

**Response:**
```json
{
  "status": "processing",
  "progress": 65,
  "step": 32,
  "total_steps": 50
}
```

### `GET /download/{filename}`
Download generated video

### `GET /health`
API health check

---

## 🔧 Configuration

### **Environment Variables:**
```bash
# Optional: Override API URL
export AI_VIDEO_API_BASE=http://localhost:5003

# Optional: Set CUDA device
export CUDA_VISIBLE_DEVICES=0
```

### **In Browser:**
```javascript
// Set custom API endpoint
localStorage.setItem('hootner_video_api_base', 'http://your-server:5003');
```

---

## 📊 Features

### **Diffusion Model Features:**
- ✅ DDPM (Denoising Diffusion Probabilistic Models)
- ✅ DDIM fast sampling
- ✅ Cosine noise schedule
- ✅ Classifier-free guidance
- ✅ Progressive generation
- ✅ 3D U-Net architecture
- ✅ Temporal attention layers

### **Video Features:**
- ✅ Up to 4K resolution (3840x2160)
- ✅ 24/30/60 FPS support
- ✅ 3-30 second duration
- ✅ MP4 or GIF output
- ✅ Real-time progress tracking
- ✅ Batch generation
- ✅ Custom seeds for reproducibility

---

## 🎯 Usage Examples

### **1. Generate a Video:**
```bash
curl -X POST http://localhost:5003/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Sunset over ocean waves",
    "num_frames": 120,
    "height": 720,
    "width": 1280,
    "fps": 24
  }'
```

### **2. Check Status:**
```bash
curl http://localhost:5003/status/abc-123
```

### **3. Download Video:**
```bash
curl http://localhost:5003/download/abc-123.mp4 -o video.mp4
```

---

## 🔍 Troubleshooting

### **Python API not starting:**
```bash
# Check Python version (requires 3.8+)
python --version

# Install PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# Install other dependencies
pip install flask flask-cors pillow numpy tqdm
```

### **CUDA out of memory:**
- Reduce `num_frames` (try 60 instead of 120)
- Reduce `height` and `width` (try 512 instead of 720)
- Reduce `num_inference_steps` (try 25 instead of 50)

### **Generation too slow:**
- Use DDIM sampler (faster than DDPM)
- Reduce inference steps to 25-30
- Enable mixed precision (FP16)

---

## 📱 Frontend Integration

The frontend automatically:
1. **Tries Python API first** at `localhost:5003`
2. **Falls back to canvas** if API unavailable
3. **Shows warning** when using fallback
4. **Polls for progress** during generation
5. **Auto-saves** to "My Videos" page

---

## 🎉 Live URLs

- **AI Video Generator:** https://daxqx65ar35pp.cloudfront.net/ai-video.html
- **My Videos Gallery:** https://daxqx65ar35pp.cloudfront.net/my-videos.html
- **Upload Videos:** https://daxqx65ar35pp.cloudfront.net/upload-video.html

---

## 💡 Pro Tips

1. **Better Prompts:** Be specific! "A red robot dancing in a neon cityscape" > "robot"
2. **Quality vs Speed:** Higher resolution = longer generation time
3. **Seed Control:** Use same seed for consistent results
4. **Guidance Scale:** 7.5 is balanced; higher = more prompt-following
5. **Steps:** 50 steps for quality, 25 for speed

---

## 🚀 Next Steps

1. **Start the Python API**: `cd services/video-generation && python api.py`
2. **Open the generator**: https://daxqx65ar35pp.cloudfront.net/ai-video.html
3. **Generate a video** with your prompt
4. **Check My Videos** to see all generated videos
5. **Download & share** your creations!

---

**Made with 🦉 by HOOTNER** • The Owl Never Sleeps
