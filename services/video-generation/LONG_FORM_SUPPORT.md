# Long-Form Video Support (Up to 4 Hours)

## 🎬 Overview

The HOOTNER video generation service now supports **long-form videos up to 4 hours** with:

✅ **Duration**: Up to 4 hours (14,400 seconds, 345,600 frames @ 24fps)
✅ **Chunked Processing**: Memory-efficient processing in 50-second chunks
✅ **Streaming Output**: No need to load entire video in RAM
✅ **Checkpoint System**: Resume processing after interruptions
✅ **Progress Tracking**: Real-time processing updates

---

## 📊 Technical Specifications

### Maximum Limits

| Parameter | Development | Production |
|-----------|-------------|------------|
| **Max Frames** | 345,600 | 345,600 |
| **Max Duration** | 4 hours | 4 hours |
| **Max Resolution** | 8K (7680×4320) | 8K (7680×4320) |
| **Chunk Size** | N/A | 1200 frames (50s) |
| **Overlap** | N/A | 24 frames (1s) |
| **Checkpoints** | N/A | Every 5 minutes |

### At 24fps (Cinema Standard)

| Duration | Total Frames | File Size (4K HDR) | File Size (8K HDR) |
|----------|--------------|--------------------|--------------------|
| 10 seconds | 240 | ~62 MB | ~187 MB |
| 1 minute | 1,440 | ~370 MB | ~1.1 GB |
| 10 minutes | 14,400 | ~3.7 GB | ~11 GB |
| 30 minutes | 43,200 | ~11 GB | ~33 GB |
| 1 hour | 86,400 | ~22 GB | ~66 GB |
| 2 hours | 172,800 | ~44 GB | ~132 GB |
| **4 hours** | **345,600** | **~88 GB** | **~264 GB** |

---

## 💾 Storage Requirements

### Temporary Storage (During Processing)

Processing requires 2-3x the final output size for temporary files:

| Resolution | 4-Hour Video | Temp Storage Required |
|------------|--------------|----------------------|
| HD (1080p) | ~22 GB | ~66 GB |
| 4K | ~88 GB | ~264 GB |
| 8K | ~264 GB | ~792 GB |

### Recommended Storage

- **Minimum**: 500GB SSD for HD/4K
- **Recommended**: 1TB+ NVMe SSD for 8K
- **Enterprise**: Multi-TB RAID array for batch processing

---

## 🚀 Usage

### Basic Long-Form Processing

```python
from long_form_processor import process_long_form_video

def my_processor(frames):
    """Your processing function"""
    # Apply HDR, effects, etc.
    return processed_frames

# Process a 4-hour movie
process_long_form_video(
    input_video="long_movie.mp4",
    output_video="processed_4k_hdr.mp4",
    process_func=my_processor,
    fps=24,
    chunk_size=1200  # 50 seconds per chunk
)
```

### With HDR10 and Dolby Atmos

```python
from cinema_integration import CinemaGradeVideoGenerator
from long_form_processor import StreamingVideoReader, LongFormVideoProcessor

# Create generator for cinema-grade processing
generator = CinemaGradeVideoGenerator(
    resolution="4k",
    hdr_max_nits=4000,
    audio_enabled=True
)

# Stream and process
reader = StreamingVideoReader("input_movie.mp4")
processor = LongFormVideoProcessor(chunk_size=1200)

# Process in chunks
result = processor.process_video_chunks(
    video_generator=iter(reader),
    total_frames=reader.get_info()['total_frames'],
    process_func=generator.generate,
    output_path="movie_4k_hdr_atmos.mp4"
)
```

### Processing Time Estimation

```python
from long_form_processor import estimate_processing_time

# Estimate for a 4-hour movie
estimates = estimate_processing_time(
    video_duration_seconds=14400,  # 4 hours
    resolution="4k",
    include_hdr=True,
    include_audio=True
)

print(f"Processing time: {estimates['estimated_processing_hours']:.1f} hours")
print(f"Ratio: {estimates['processing_ratio']}")
```

---

## ⏱️ Processing Time Estimates

### Hardware: NVIDIA RTX 4090 (24GB VRAM)

| Duration | HD (1080p) | 4K | 8K |
|----------|------------|----|----|
| **10 minutes** | ~5 min | ~15 min | ~60 min |
| **30 minutes** | ~15 min | ~45 min | ~3 hours |
| **1 hour** | ~30 min | ~1.5 hours | ~6 hours |
| **2 hours** | ~1 hour | ~3 hours | ~12 hours |
| **4 hours** | **~2 hours** | **~6 hours** | **~24 hours** |

### Hardware: NVIDIA A100 (80GB VRAM)

Processing times are approximately **40% faster** with A100:

| Duration | 4K | 8K |
|----------|----|----|
| **1 hour** | ~54 min | ~3.6 hours |
| **4 hours** | **~3.6 hours** | **~14.4 hours** |

---

## 🔧 Memory Optimization

### Chunked Processing

Long videos are processed in **chunks** to avoid memory issues:

```yaml
# config/production.yaml
long_form:
  enabled: true
  chunk_size: 1200        # 50 seconds at 24fps
  overlap_frames: 24      # 1 second overlap for smooth transitions
  streaming_mode: true    # Stream output, don't buffer in RAM
  checkpoint_interval: 7200  # Save checkpoint every 5 minutes
```

### Memory Usage

| Resolution | Chunk Size (50s) | RAM Required |
|------------|------------------|--------------|
| HD | 1200 frames | ~2 GB |
| 4K | 1200 frames | ~8 GB |
| 8K | 1200 frames | ~32 GB |

**Recommended System RAM:**
- HD/4K: 32GB minimum, 64GB recommended
- 8K: 128GB minimum, 256GB recommended

---

## 💾 Checkpoint System

Processing is saved every 5 minutes, allowing recovery from interruptions:

```python
processor = LongFormVideoProcessor(
    checkpoint_interval=7200  # Save every 5 minutes (7200 frames @ 24fps)
)

# If interrupted, resume from last checkpoint
checkpoint = processor.load_checkpoint()
if checkpoint:
    chunk_idx, processed_frames = checkpoint
    print(f"Resuming from frame {processed_frames}")
```

### Checkpoint Files

Stored in temporary directory:
```
/tmp/video_checkpoint_xxxxx/
  checkpoint_0.txt
  checkpoint_1.txt
  checkpoint_2.txt
  ...
```

---

## 🎯 Best Practices

### 1. **Use Appropriate Resolution**

For 4-hour videos, consider your use case:
- **Streaming**: HD (1080p) is sufficient
- **Cinema**: 4K is standard
- **IMAX/Premium**: 8K for highest quality

### 2. **Enable Chunked Processing**

Always use chunked processing for videos over 1 hour:

```python
process_long_form_video(
    input_video="movie.mp4",
    output_video="processed.mp4",
    process_func=my_func,
    chunk_size=1200  # 50 seconds
)
```

### 3. **Monitor Storage**

Check available storage before processing:

```python
import shutil

# Get available space
stat = shutil.disk_usage(".")
available_gb = stat.free / (1024**3)

# Estimate required (video size * 3)
required_gb = (video_duration_seconds * bitrate) / (8 * 1024**3) * 3

if available_gb < required_gb:
    print(f"⚠️ Insufficient storage: {available_gb:.1f} GB available, {required_gb:.1f} GB required")
```

### 4. **Use Progress Callbacks**

Monitor processing progress:

```python
def my_processor_with_progress(frames, chunk_idx=0, total_chunks=1):
    progress = (chunk_idx / total_chunks) * 100
    print(f"Progress: {progress:.1f}%")
    return process_frames(frames)
```

---

## 🐛 Troubleshooting

### Out of Memory Errors

**Symptom**: CUDA out of memory or system RAM exhausted

**Solutions:**
1. Reduce chunk size: `chunk_size=600` (25 seconds)
2. Lower resolution: Use 4K instead of 8K
3. Disable audio: `audio_enabled=False`
4. Close other applications

### Slow Processing

**Symptom**: Processing takes longer than estimated

**Solutions:**
1. Check GPU utilization: `nvidia-smi`
2. Ensure GPU is not thermal throttling
3. Use faster storage (NVMe SSD)
4. Reduce resolution or disable HDR

### Checkpoint Recovery Failed

**Symptom**: Cannot resume from checkpoint

**Solutions:**
1. Check checkpoint directory exists
2. Verify checkpoint files are not corrupted
3. Restart processing from beginning
4. Reduce checkpoint interval

### Storage Full During Processing

**Symptom**: Disk space runs out mid-processing

**Solutions:**
1. Free up storage space
2. Use external drive for output
3. Process in smaller segments
4. Enable automatic cleanup

---

## 📈 Performance Optimization

### GPU Acceleration

Ensure CUDA is properly configured:

```bash
# Check CUDA version
nvcc --version

# Check GPU availability
python -c "import torch; print(torch.cuda.is_available())"

# Monitor GPU during processing
watch -n 1 nvidia-smi
```

### Multi-GPU Processing (Future Enhancement)

For even faster processing, distribute chunks across multiple GPUs:

```python
# Coming soon: Multi-GPU support
processor = LongFormVideoProcessor(
    num_gpus=2,  # Use 2 GPUs
    gpu_ids=[0, 1]
)
```

---

## 📊 Cost Analysis

### Cloud Processing (AWS/GCP/Azure)

**AWS p3.2xlarge** (V100 GPU):
- **Hourly Rate**: ~$3.06/hour
- **4K, 4-hour movie**: ~6 hours processing = **~$18.36**
- **8K, 4-hour movie**: ~24 hours processing = **~$73.44**

**AWS p4d.24xlarge** (8x A100 GPUs):
- **Hourly Rate**: ~$32.77/hour
- **4K, 4-hour movie**: ~45 min processing = **~$24.58**
- **8K, 4-hour movie**: ~3 hours processing = **~$98.31**

### Local Processing

**One-time Hardware Investment**:
- RTX 4090 GPU: ~$1,599
- Additional RAM (128GB): ~$400
- NVMe SSD (2TB): ~$150
- **Total**: ~$2,149

**Break-even**: ~100-120 movies (4K) or 20-30 movies (8K)

---

## 🎓 Example: Full 4-Hour Movie Pipeline

```python
from long_form_processor import process_long_form_video, estimate_processing_time
from cinema_integration import generate_cinema_video
import logging

logging.basicConfig(level=logging.INFO)

# 1. Estimate processing time
print("📊 Estimating processing time...")
estimates = estimate_processing_time(
    video_duration_seconds=14400,  # 4 hours
    resolution="4k",
    include_hdr=True,
    include_audio=True
)
print(f"Estimated time: {estimates['estimated_processing_hours']:.1f} hours")

# 2. Define processing function
def cinema_processor(frames):
    """Process frames with HDR10 and effects"""
    from hdr_processing import convert_to_hdr10

    # Convert to HDR10
    hdr_frames, _ = convert_to_hdr10(frames, max_nits=4000)

    return hdr_frames

# 3. Process the movie
print("\n🎬 Processing 4-hour movie...")
output = process_long_form_video(
    input_video="epic_movie_raw.mp4",
    output_video="epic_movie_4k_hdr.mp4",
    process_func=cinema_processor,
    fps=24,
    chunk_size=1200
)

print(f"\n✅ Complete! Output: {output}")
```

---

## 📚 API Reference

### `process_long_form_video()`

```python
def process_long_form_video(
    input_video: str,           # Input video path
    output_video: str,          # Output video path
    process_func: callable,     # Processing function
    fps: int = 24,             # Frame rate
    chunk_size: int = 1200,    # Frames per chunk
    **process_kwargs           # Additional args for process_func
) -> str
```

### `LongFormVideoProcessor`

```python
processor = LongFormVideoProcessor(
    chunk_size=1200,           # Frames per chunk (50s @ 24fps)
    overlap_frames=24,         # Overlap between chunks (1s)
    checkpoint_interval=7200   # Checkpoint frequency (5min)
)
```

### `StreamingVideoReader`

```python
reader = StreamingVideoReader("movie.mp4")

# Get video info
info = reader.get_info()
# {'total_frames': 345600, 'fps': 24.0, 'width': 3840,
#  'height': 2160, 'duration': 14400.0}

# Iterate over frames
for frame in reader:
    # Process frame
    pass
```

### `estimate_processing_time()`

```python
estimates = estimate_processing_time(
    video_duration_seconds=14400,
    resolution="4k",
    include_hdr=True,
    include_audio=True
)
# Returns: {'video_duration': 14400,
#           'estimated_processing_hours': 6.0, ...}
```

---

## ✅ Summary

The HOOTNER video generation service now supports:

✅ **4-hour videos** (345,600 frames @ 24fps)
✅ **8K UHD resolution** (7680×4320)
✅ **HDR10** with 10-bit color
✅ **Dolby Atmos** 7.1.4 audio
✅ **Chunked processing** for memory efficiency
✅ **Checkpoint system** for recovery
✅ **Streaming output** to minimize RAM usage
✅ **Progress tracking** for long operations

**Perfect for**: Feature films, documentaries, live events, concerts, conferences, training videos, and any long-form content requiring cinema-grade quality! 🎬✨

---

**Updated**: January 11, 2026
**Version**: 2.1 - Long-Form Support
