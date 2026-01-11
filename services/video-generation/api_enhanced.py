"""
Enhanced Flask REST API for Video Generation Service
Production-ready API with WebSocket, async jobs, caching, and monitoring

Features:
- WebSocket for real-time progress updates
- Async job queue with Redis
- Response caching
- Prometheus metrics
- Batch generation
- Model warm-up
- Health checks with detailed diagnostics

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
import os
import uuid
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import torch
from threading import Thread
from queue import Queue
import hashlib

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("⚠️  Redis not available - using in-memory queue")

from generator import VideoGenerator

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(
    app,
    origins=["http://localhost:5173", "http://localhost:3000", "https://hootner.com"],
    supports_credentials=True
)

# Initialize SocketIO for real-time updates
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

MAX_PROMPT_LENGTH = 500
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60  # seconds
CACHE_TTL = 3600  # 1 hour
MAX_QUEUE_SIZE = 100

# Initialize generator
print("🚀 Initializing Enhanced Video Generator...")
generator = VideoGenerator(model_size="base", timesteps=1000, guidance_scale=7.5)
print("✅ Generator ready!")

# Job tracking
class JobManager:
    """Manage generation jobs with queue and caching"""
    
    def __init__(self):
        self.jobs: Dict[str, dict] = {}
        self.queue = Queue(maxsize=MAX_QUEUE_SIZE)
        self.cache: Dict[str, dict] = {}
        self.worker_thread = None
        self.running = False
        
        # Redis connection
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.Redis(
                    host=os.environ.get('REDIS_HOST', 'localhost'),
                    port=int(os.environ.get('REDIS_PORT', 6379)),
                    db=0,
                    decode_responses=True
                )
                self.redis_client.ping()
                print("✅ Connected to Redis")
            except:
                self.redis_client = None
                print("⚠️  Redis connection failed - using in-memory cache")
        else:
            self.redis_client = None
    
    def start_worker(self):
        """Start background worker thread"""
        if not self.running:
            self.running = True
            self.worker_thread = Thread(target=self._process_queue, daemon=True)
            self.worker_thread.start()
            print("✅ Job worker started")
    
    def stop_worker(self):
        """Stop background worker"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=5)
    
    def _process_queue(self):
        """Process jobs from queue"""
        while self.running:
            try:
                if not self.queue.empty():
                    job_data = self.queue.get(timeout=1)
                    self._execute_job(job_data)
                else:
                    time.sleep(0.1)
            except Exception as e:
                print(f"❌ Worker error: {e}")
    
    def _execute_job(self, job_data: dict):
        """Execute a single generation job"""
        job_id = job_data['job_id']
        
        try:
            self.update_job(job_id, status='processing', progress=0)
            
            # Generate video with progress callback
            def progress_callback(step, total):
                progress = int((step / total) * 100)
                self.update_job(job_id, progress=progress)
                socketio.emit('progress', {
                    'job_id': job_id,
                    'progress': progress,
                    'step': step,
                    'total': total
                }, namespace='/generation')
            
            start_time = time.time()
            
            video = generator.generate(
                prompt=job_data['prompt'],
                num_frames=job_data['num_frames'],
                height=job_data['height'],
                width=job_data['width'],
                fps=job_data['fps'],
                num_inference_steps=job_data['num_inference_steps'],
                guidance_scale=job_data['guidance_scale'],
                seed=job_data.get('seed'),
                output_path=job_data['output_path'],
                progress_callback=progress_callback
            )
            
            generation_time = time.time() - start_time
            
            self.update_job(
                job_id,
                status='completed',
                progress=100,
                generation_time=generation_time,
                output_file=job_data['output_filename']
            )
            
            # Emit completion event
            socketio.emit('completed', {
                'job_id': job_id,
                'download_url': f"/download/{job_data['output_filename']}",
                'generation_time': generation_time
            }, namespace='/generation')
            
            print(f"✅ Job {job_id} completed in {generation_time:.2f}s")
            
        except Exception as e:
            self.update_job(job_id, status='failed', error=str(e))
            socketio.emit('error', {
                'job_id': job_id,
                'error': str(e)
            }, namespace='/generation')
            print(f"❌ Job {job_id} failed: {e}")
    
    def create_job(self, job_data: dict) -> str:
        """Create new job and add to queue"""
        job_id = str(uuid.uuid4())
        job_data['job_id'] = job_id
        
        self.jobs[job_id] = {
            'job_id': job_id,
            'status': 'queued',
            'progress': 0,
            'created_at': datetime.utcnow().isoformat(),
            'params': {
                'prompt': job_data['prompt'],
                'num_frames': job_data['num_frames'],
                'height': job_data['height'],
                'width': job_data['width']
            }
        }
        
        self.queue.put(job_data)
        return job_id
    
    def update_job(self, job_id: str, **kwargs):
        """Update job status"""
        if job_id in self.jobs:
            self.jobs[job_id].update(kwargs)
            self.jobs[job_id]['updated_at'] = datetime.utcnow().isoformat()
    
    def get_job(self, job_id: str) -> Optional[dict]:
        """Get job status"""
        return self.jobs.get(job_id)
    
    def get_cache_key(self, params: dict) -> str:
        """Generate cache key from parameters"""
        cache_str = json.dumps(params, sort_keys=True)
        return hashlib.sha256(cache_str.encode()).hexdigest()
    
    def check_cache(self, cache_key: str) -> Optional[dict]:
        """Check if result is cached"""
        if self.redis_client:
            try:
                cached = self.redis_client.get(f"video:{cache_key}")
                if cached:
                    return json.loads(cached)
            except:
                pass
        
        return self.cache.get(cache_key)
    
    def set_cache(self, cache_key: str, data: dict):
        """Cache generation result"""
        if self.redis_client:
            try:
                self.redis_client.setex(
                    f"video:{cache_key}",
                    CACHE_TTL,
                    json.dumps(data)
                )
                return
            except:
                pass
        
        self.cache[cache_key] = data

# Initialize job manager
job_manager = JobManager()
job_manager.start_worker()

# Simple rate limiting (in-memory)
request_counts = {}

def check_rate_limit(ip: str) -> bool:
    """Check if request is within rate limit"""
    now = time.time()
    
    if ip not in request_counts:
        request_counts[ip] = []
    
    # Remove old requests
    request_counts[ip] = [t for t in request_counts[ip] if now - t < RATE_LIMIT_WINDOW]
    
    # Check limit
    if len(request_counts[ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    request_counts[ip].append(now)
    return True

# Metrics collection
class Metrics:
    """Simple metrics collector"""
    
    def __init__(self):
        self.requests_total = 0
        self.requests_success = 0
        self.requests_failed = 0
        self.generation_times = []
        self.start_time = time.time()
    
    def record_request(self, success: bool, generation_time: Optional[float] = None):
        self.requests_total += 1
        if success:
            self.requests_success += 1
            if generation_time:
                self.generation_times.append(generation_time)
        else:
            self.requests_failed += 1
    
    def get_stats(self) -> dict:
        uptime = time.time() - self.start_time
        avg_time = sum(self.generation_times) / len(self.generation_times) if self.generation_times else 0
        
        return {
            'uptime_seconds': uptime,
            'requests_total': self.requests_total,
            'requests_success': self.requests_success,
            'requests_failed': self.requests_failed,
            'success_rate': self.requests_success / self.requests_total if self.requests_total > 0 else 0,
            'avg_generation_time': avg_time,
            'total_generations': len(self.generation_times)
        }

metrics = Metrics()

# ============================================================================
# API Endpoints
# ============================================================================

@app.route("/health", methods=["GET"])
def health_check():
    """Detailed health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "video-generation-enhanced",
        "version": "2.0.0",
        "device": str(generator.device),
        "cuda_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "queue_size": job_manager.queue.qsize(),
        "active_jobs": len([j for j in job_manager.jobs.values() if j['status'] == 'processing']),
        "redis_connected": job_manager.redis_client is not None,
        "timestamp": datetime.utcnow().isoformat(),
    })

@app.route("/metrics", methods=["GET"])
def get_metrics():
    """Prometheus-compatible metrics endpoint"""
    stats = metrics.get_stats()
    
    # Prometheus format
    output = []
    output.append(f"# HELP video_gen_requests_total Total number of generation requests")
    output.append(f"# TYPE video_gen_requests_total counter")
    output.append(f"video_gen_requests_total {stats['requests_total']}")
    output.append(f"")
    output.append(f"# HELP video_gen_requests_success Successful generation requests")
    output.append(f"# TYPE video_gen_requests_success counter")
    output.append(f"video_gen_requests_success {stats['requests_success']}")
    output.append(f"")
    output.append(f"# HELP video_gen_requests_failed Failed generation requests")
    output.append(f"# TYPE video_gen_requests_failed counter")
    output.append(f"video_gen_requests_failed {stats['requests_failed']}")
    output.append(f"")
    output.append(f"# HELP video_gen_avg_time Average generation time in seconds")
    output.append(f"# TYPE video_gen_avg_time gauge")
    output.append(f"video_gen_avg_time {stats['avg_generation_time']}")
    output.append(f"")
    output.append(f"# HELP video_gen_uptime Service uptime in seconds")
    output.append(f"# TYPE video_gen_uptime counter")
    output.append(f"video_gen_uptime {stats['uptime_seconds']}")
    
    return "\n".join(output), 200, {'Content-Type': 'text/plain; charset=utf-8'}

@app.route("/generate", methods=["POST"])
def generate_video():
    """
    Generate video from text prompt (sync or async)
    
    Request JSON:
    {
        "prompt": "A robot dancing",
        "num_frames": 16,
        "height": 64,
        "width": 64,
        "fps": 8,
        "num_inference_steps": 50,
        "guidance_scale": 7.5,
        "seed": 42,
        "format": "gif",
        "async": true,
        "use_cache": true
    }
    """
    # Rate limiting
    client_ip = request.remote_addr
    if not check_rate_limit(client_ip):
        return jsonify({
            "error": "Rate limit exceeded",
            "message": f"Maximum {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds"
        }), 429
    
    # Validate request
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    
    # Required fields
    if "prompt" not in data:
        return jsonify({"error": "Missing required field: prompt"}), 400
    
    prompt = data["prompt"].strip()
    
    # Validate prompt
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400
    
    if len(prompt) > MAX_PROMPT_LENGTH:
        return jsonify({"error": f"Prompt too long (max {MAX_PROMPT_LENGTH} characters)"}), 400
    
    # Parse parameters with defaults
    num_frames = int(data.get("num_frames", 16))
    height = int(data.get("height", 64))
    width = int(data.get("width", 64))
    fps = int(data.get("fps", 8))
    num_inference_steps = int(data.get("num_inference_steps", 50))
    guidance_scale = float(data.get("guidance_scale", 7.5))
    seed = data.get("seed", None)
    output_format = data.get("format", "gif")
    async_mode = data.get("async", False)
    use_cache = data.get("use_cache", True)
    
    # Validate parameters
    if not (4 <= num_frames <= 64):
        return jsonify({"error": "num_frames must be between 4 and 64"}), 400
    
    if not (32 <= height <= 512) or not (32 <= width <= 512):
        return jsonify({"error": "height and width must be between 32 and 512"}), 400
    
    if not (1 <= num_inference_steps <= 1000):
        return jsonify({"error": "num_inference_steps must be between 1 and 1000"}), 400
    
    if not (1.0 <= guidance_scale <= 20.0):
        return jsonify({"error": "guidance_scale must be between 1.0 and 20.0"}), 400
    
    if output_format not in ["gif", "mp4"]:
        return jsonify({"error": 'format must be "gif" or "mp4"'}), 400
    
    # Check cache
    if use_cache:
        cache_params = {
            'prompt': prompt,
            'num_frames': num_frames,
            'height': height,
            'width': width,
            'fps': fps,
            'num_inference_steps': num_inference_steps,
            'guidance_scale': guidance_scale,
            'seed': seed,
            'format': output_format
        }
        cache_key = job_manager.get_cache_key(cache_params)
        cached_result = job_manager.check_cache(cache_key)
        
        if cached_result:
            print(f"✅ Cache hit for {cache_key[:8]}...")
            return jsonify({
                **cached_result,
                'cached': True
            })
    
    # Generate unique job ID
    job_id = str(uuid.uuid4())
    output_filename = f"{job_id}.{output_format}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    job_data = {
        'prompt': prompt,
        'num_frames': num_frames,
        'height': height,
        'width': width,
        'fps': fps,
        'num_inference_steps': num_inference_steps,
        'guidance_scale': guidance_scale,
        'seed': seed,
        'output_path': output_path,
        'output_filename': output_filename
    }
    
    print(f"\n{'='*60}")
    print(f"🎬 New generation request ({'async' if async_mode else 'sync'})")
    print(f"   Job ID: {job_id}")
    print(f"   Prompt: {prompt}")
    print(f"   Resolution: {num_frames}x{height}x{width}")
    print(f"{'='*60}")
    
    if async_mode:
        # Queue for async processing
        job_id = job_manager.create_job(job_data)
        
        return jsonify({
            "job_id": job_id,
            "status": "queued",
            "message": "Job queued for processing",
            "websocket_url": "/generation",
            "status_url": f"/status/{job_id}"
        }), 202
    else:
        # Synchronous generation
        try:
            start_time = time.time()
            
            video = generator.generate(**job_data)
            
            generation_time = time.time() - start_time
            
            print(f"✅ Generation complete in {generation_time:.2f}s")
            
            metrics.record_request(True, generation_time)
            
            result = {
                "job_id": job_id,
                "status": "completed",
                "download_url": f"/download/{output_filename}",
                "generation_time": generation_time,
                "metadata": {
                    "prompt": prompt,
                    "num_frames": num_frames,
                    "resolution": f"{height}x{width}",
                    "fps": fps,
                    "device": str(generator.device)
                }
            }
            
            # Cache result
            if use_cache:
                job_manager.set_cache(cache_key, result)
            
            return jsonify(result)
            
        except Exception as e:
            metrics.record_request(False)
            print(f"❌ Generation failed: {e}")
            return jsonify({
                "error": "Generation failed",
                "message": str(e)
            }), 500

@app.route("/batch", methods=["POST"])
def generate_batch():
    """
    Generate multiple videos from a list of prompts
    
    Request JSON:
    {
        "prompts": ["prompt1", "prompt2", ...],
        "params": {
            "num_frames": 16,
            "height": 64,
            "width": 64,
            ...
        }
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    
    if "prompts" not in data or not isinstance(data["prompts"], list):
        return jsonify({"error": "Missing or invalid 'prompts' field"}), 400
    
    prompts = data["prompts"]
    params = data.get("params", {})
    
    if len(prompts) > 10:
        return jsonify({"error": "Maximum 10 prompts per batch"}), 400
    
    job_ids = []
    for prompt in prompts:
        job_data = {
            'prompt': prompt,
            'num_frames': params.get('num_frames', 16),
            'height': params.get('height', 64),
            'width': params.get('width', 64),
            'fps': params.get('fps', 8),
            'num_inference_steps': params.get('num_inference_steps', 50),
            'guidance_scale': params.get('guidance_scale', 7.5),
            'seed': params.get('seed'),
            'output_path': os.path.join(OUTPUT_DIR, f"{uuid.uuid4()}.gif"),
            'output_filename': f"{uuid.uuid4()}.gif"
        }
        
        job_id = job_manager.create_job(job_data)
        job_ids.append(job_id)
    
    return jsonify({
        "batch_id": str(uuid.uuid4()),
        "job_ids": job_ids,
        "total": len(job_ids),
        "status_url": "/batch-status",
        "message": f"Queued {len(job_ids)} generation jobs"
    }), 202

@app.route("/status/<job_id>", methods=["GET"])
def get_job_status(job_id):
    """Get status of a generation job"""
    job = job_manager.get_job(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    return jsonify(job)

@app.route("/download/<filename>", methods=["GET"])
def download_video(filename):
    """Download generated video"""
    filename = secure_filename(filename)
    file_path = os.path.join(OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(file_path, as_attachment=True)

@app.route("/cancel/<job_id>", methods=["POST"])
def cancel_job(job_id):
    """Cancel a queued job"""
    job = job_manager.get_job(job_id)
    
    if not job:
        return jsonify({"error": "Job not found"}), 404
    
    if job['status'] == 'queued':
        job_manager.update_job(job_id, status='cancelled')
        return jsonify({"message": "Job cancelled"})
    else:
        return jsonify({"error": f"Cannot cancel job in '{job['status']}' state"}), 400

# ============================================================================
# WebSocket Events
# ============================================================================

@socketio.on('connect', namespace='/generation')
def handle_connect():
    """Client connected to WebSocket"""
    print(f"🔌 Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to video generation service'})

@socketio.on('disconnect', namespace='/generation')
def handle_disconnect():
    """Client disconnected from WebSocket"""
    print(f"🔌 Client disconnected: {request.sid}")

@socketio.on('subscribe', namespace='/generation')
def handle_subscribe(data):
    """Subscribe to job updates"""
    job_id = data.get('job_id')
    print(f"📡 Client subscribed to job: {job_id}")
    emit('subscribed', {'job_id': job_id})

# ============================================================================
# Startup & Shutdown
# ============================================================================

@app.before_first_request
def warmup():
    """Warm up the model"""
    print("🔥 Warming up model...")
    try:
        # Generate a small test video
        generator.generate(
            prompt="test",
            num_frames=4,
            height=32,
            width=32,
            fps=8,
            num_inference_steps=10,
            output_path=os.path.join(OUTPUT_DIR, "warmup.gif")
        )
        print("✅ Model warmed up successfully")
    except Exception as e:
        print(f"⚠️  Model warmup failed: {e}")

def shutdown_handler():
    """Clean shutdown"""
    print("\n🛑 Shutting down...")
    job_manager.stop_worker()
    print("✅ Shutdown complete")

import atexit
atexit.register(shutdown_handler)

# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    
    print(f"\n{'='*60}")
    print(f"🚀 HOOTNER Video Generation Service v2.0")
    print(f"   Enhanced API with WebSocket, async jobs, and caching")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print(f"   Device: {generator.device}")
    print(f"   Redis: {'Connected' if job_manager.redis_client else 'Not available'}")
    print(f"{'='*60}\n")
    
    socketio.run(app, host="0.0.0.0", port=port, debug=debug)
