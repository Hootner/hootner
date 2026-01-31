"""
Flask REST API for Video Generation Service
Production-ready API with authentication, rate limiting, and monitoring

Author: HOOTNER Code Guardian
Date: January 10, 2026
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import time
from datetime import datetime
import torch
import json

from generator import VideoGenerator

# Initialize Flask app
app = Flask(__name__)
CORS(
    app,
    origins=["http://localhost:5173", "http://localhost:3000", "https://hootner.com"],
)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
ANALYTICS_DIR = os.path.join(os.path.dirname(__file__), "analytics")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ANALYTICS_DIR, exist_ok=True)

MAX_PROMPT_LENGTH = 500
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW = 60  # seconds

# Initialize generator
print("🚀 Initializing Video Generator...")
generator = VideoGenerator(model_size="base", timesteps=1000, guidance_scale=7.5)
print("✅ Generator ready!")

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


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "video-generation",
            "version": "1.0.0",
            "device": str(generator.device),
            "timestamp": datetime.utcnow().isoformat(),
        }
    )


@app.route("/generate", methods=["POST"])
def generate_video():
    """
    Generate video from text prompt

    Request JSON:
    {
        "prompt": "A robot dancing",
        "num_frames": 16,
        "height": 64,
        "width": 64,
        "fps": 8,
        "num_inference_steps": 50,
        "guidance_scale": 7.5,
        "seed": 42
    }

    Response:
    {
        "job_id": "uuid",
        "status": "completed",
        "download_url": "/download/uuid.gif",
        "generation_time": 30.5,
        "metadata": {...}
    }
    """
    # Rate limiting
    client_ip = request.remote_addr
    if not check_rate_limit(client_ip):
        return (
            jsonify(
                {
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds",
                }
            ),
            429,
        )

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
        return (
            jsonify({"error": f"Prompt too long (max {MAX_PROMPT_LENGTH} characters)"}),
            400,
        )

    # Parse parameters with defaults
    try:
        num_frames = int(data.get("num_frames", 16))
        height = int(data.get("height", 64))
        width = int(data.get("width", 64))
        fps = int(data.get("fps", 8))
        num_inference_steps = int(data.get("num_inference_steps", 50))
        guidance_scale = float(data.get("guidance_scale", 7.5))
        seed = data.get("seed", None)
        output_format = data.get("format", "gif")  # 'gif' or 'mp4'
    except (ValueError, TypeError) as e:
        return jsonify({"error": "Invalid parameter type", "message": str(e)}), 400

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

    # Generate unique job ID
    job_id = str(uuid.uuid4())
    output_filename = f"{job_id}.{output_format}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        # Start generation
        start_time = time.time()

        print(f"\n{'='*60}")
        print(f"🎬 New generation request")
        print(f"   Job ID: {job_id}")
        print(f"   Prompt: {prompt}")
        print(f"   Resolution: {num_frames}x{height}x{width}")
        print(f"{'='*60}")

        # Generate video
        video = generator.generate(
            prompt=prompt,
            num_frames=num_frames,
            height=height,
            width=width,
            fps=fps,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed,
            output_path=output_path,
        )

        generation_time = time.time() - start_time

        print(f"✅ Generation complete in {generation_time:.2f}s")

        # Return response
        return (
            jsonify(
                {
                    "job_id": job_id,
                    "status": "completed",
                    "download_url": f"/download/{output_filename}",
                    "generation_time": round(generation_time, 2),
                    "metadata": {
                        "prompt": prompt,
                        "num_frames": num_frames,
                        "height": height,
                        "width": width,
                        "fps": fps,
                        "format": output_format,
                        "inference_steps": num_inference_steps,
                        "guidance_scale": guidance_scale,
                        "seed": seed,
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                }
            ),
            200,
        )

    except Exception as e:
        print(f"❌ Generation failed: {str(e)}")

        # Clean up failed output
        if os.path.exists(output_path):
            os.remove(output_path)

        return (
            jsonify(
                {"error": "Generation failed", "message": str(e), "job_id": job_id}
            ),
            500,
        )


@app.route("/download/<filename>", methods=["GET"])
def download_video(filename):
    """Download generated video"""
    try:
        # Secure filename
        filename = secure_filename(filename)
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400
        
        file_path = os.path.join(OUTPUT_DIR, filename)
        # Prevent path traversal
        if not os.path.abspath(file_path).startswith(os.path.abspath(OUTPUT_DIR)):
            return jsonify({"error": "Access denied"}), 403

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": "Invalid filename", "message": str(e)}), 400

    # Determine mimetype
    if filename.endswith(".gif"):
        mimetype = "image/gif"
    elif filename.endswith(".mp4"):
        mimetype = "video/mp4"
    else:
        mimetype = "application/octet-stream"

    return send_file(
        file_path, mimetype=mimetype, as_attachment=True, download_name=filename
    )


@app.route("/batch", methods=["POST"])
def generate_batch():
    """
    Generate multiple videos from multiple prompts

    Request JSON:
    {
        "prompts": ["prompt1", "prompt2", ...],
        "num_frames": 16,
        ...
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()

    if "prompts" not in data or not isinstance(data["prompts"], list):
        return (
            jsonify({"error": "Missing or invalid field: prompts (must be array)"}),
            400,
        )

    prompts = [p.strip() for p in data["prompts"] if p.strip()]

    if not prompts:
        return jsonify({"error": "No valid prompts provided"}), 400

    if len(prompts) > 10:
        return jsonify({"error": "Maximum 10 prompts per batch request"}), 400

    # Validate each prompt
    for prompt in prompts:
        if len(prompt) > MAX_PROMPT_LENGTH:
            return (
                jsonify(
                    {
                        "error": f'Prompt too long: "{prompt[:50]}..." (max {MAX_PROMPT_LENGTH} chars)'
                    }
                ),
                400,
            )

    try:
        # Generate all videos
        results = []

        for i, prompt in enumerate(prompts):
            job_id = str(uuid.uuid4())
            output_filename = f"{job_id}.gif"
            output_path = os.path.join(OUTPUT_DIR, output_filename)

            print(f"\n🎬 Batch {i+1}/{len(prompts)}: {prompt}")

            start_time = time.time()

            try:
                generator.generate(
                    prompt=prompt,
                    num_frames=data.get("num_frames", 16),
                    height=data.get("height", 64),
                    width=data.get("width", 64),
                    fps=data.get("fps", 8),
                    num_inference_steps=data.get("num_inference_steps", 50),
                    guidance_scale=data.get("guidance_scale", 7.5),
                    output_path=output_path,
                )
            except Exception as gen_error:
                print(f"❌ Generation failed for prompt '{prompt}': {str(gen_error)}")
                continue

            generation_time = time.time() - start_time

            results.append(
                {
                    "job_id": job_id,
                    "prompt": prompt,
                    "download_url": f"/download/{output_filename}",
                    "generation_time": round(generation_time, 2),
                }
            )

        return (
            jsonify({"status": "completed", "count": len(results), "results": results}),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Batch generation failed", "message": str(e)}), 500


@app.route("/models", methods=["GET"])
def list_models():
    """List available models"""
    return jsonify(
        {
            "models": [
                {
                    "name": "base",
                    "description": "Balanced model for production",
                    "parameters": "~50M",
                    "recommended": True,
                },
                {
                    "name": "small",
                    "description": "Fast model for testing",
                    "parameters": "~15M",
                    "recommended": False,
                },
                {
                    "name": "large",
                    "description": "High quality model (slower)",
                    "parameters": "~200M",
                    "recommended": False,
                },
            ]
        }
    )


@app.route("/stats", methods=["GET"])
def get_stats():
    """Get generation statistics"""
    try:
        output_files = os.listdir(OUTPUT_DIR)

        total_size = sum(
            os.path.getsize(os.path.join(OUTPUT_DIR, f))
            for f in output_files
            if os.path.isfile(os.path.join(OUTPUT_DIR, f))
        )
    except OSError as e:
        return jsonify({"error": "Failed to read statistics", "message": str(e)}), 500

    return jsonify(
        {
            "total_generations": len(output_files),
            "storage_used_mb": round(total_size / (1024 * 1024), 2),
            "device": str(generator.device),
            "model_size": "base",
        }
    )


# ============================================================================
# NEW: Video Player Integration Endpoints
# ============================================================================


@app.route("/api/video/<video_id>", methods=["GET"])
def get_video_info(video_id):
    """
    Get video metadata by ID

    Response:
    {
        "id": "video-123",
        "title": "AI Generated Video",
        "url": "/api/video/stream/video-123.mp4",
        "duration": 30.0,
        "scenes": [...],
        "thumbnails": [...]
    }
    """
    # Sanitize video_id to prevent path traversal
    video_id = secure_filename(video_id)
    if not video_id or '/' in video_id or '\\' in video_id:
        return jsonify({"error": "Invalid video ID"}), 400
    
    # Check if video exists
    video_path = os.path.join(OUTPUT_DIR, f"{video_id}.mp4")
    gif_path = os.path.join(OUTPUT_DIR, f"{video_id}.gif")

    if os.path.exists(video_path):
        file_path = video_path
        file_type = "video/mp4"
    elif os.path.exists(gif_path):
        file_path = gif_path
        file_type = "image/gif"
    else:
        return jsonify({"error": "Video not found"}), 404

    # Get file info
    try:
        file_size = os.path.getsize(file_path)
        created_at = datetime.fromtimestamp(os.path.getctime(file_path))
    except OSError as e:
        return jsonify({"error": "Failed to read file info", "message": str(e)}), 500

    # Load metadata if exists
    metadata_path = os.path.join(OUTPUT_DIR, f"{video_id}.json")
    # Prevent path traversal
    if not os.path.abspath(metadata_path).startswith(os.path.abspath(OUTPUT_DIR)):
        return jsonify({"error": "Access denied"}), 403
    
    metadata = {}
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                metadata = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(f"Warning: Failed to load metadata: {e}")

    return jsonify(
        {
            "id": video_id,
            "title": metadata.get("prompt", f"Video {video_id}"),
            "url": f"/api/video/stream/{os.path.basename(file_path)}",
            "video_url": f"/api/video/stream/{os.path.basename(file_path)}",
            "type": file_type,
            "size_mb": round(file_size / (1024 * 1024), 2),
            "duration": metadata.get("duration", 30.0),
            "created_at": created_at.isoformat(),
            "metadata": metadata,
        }
    )


@app.route("/api/video/stream/<filename>", methods=["GET"])
def stream_video(filename):
    """Stream video file"""
    try:
        filename = secure_filename(filename)
        if not filename:
            return jsonify({"error": "Invalid filename"}), 400
        
        file_path = os.path.join(OUTPUT_DIR, filename)
        # Prevent path traversal
        if not os.path.abspath(file_path).startswith(os.path.abspath(OUTPUT_DIR)):
            return jsonify({"error": "Access denied"}), 403

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": "Invalid request", "message": str(e)}), 400

    # Determine MIME type
    if filename.endswith(".mp4"):
        mime_type = "video/mp4"
    elif filename.endswith(".gif"):
        mime_type = "image/gif"
    else:
        mime_type = "application/octet-stream"

    return send_file(file_path, mimetype=mime_type)


@app.route("/api/video/sample", methods=["GET"])
def get_sample_video():
    """Get a sample video for testing"""
    try:
        # Return first available video or error
        files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith((".mp4", ".gif"))]

        if files:
            return send_file(os.path.join(OUTPUT_DIR, files[0]))
        else:
            return jsonify({"error": "No videos available"}), 404
    except OSError as e:
        return jsonify({"error": "Failed to access videos", "message": str(e)}), 500


@app.route("/api/analytics/track", methods=["POST"])
def track_analytics():
    """
    Track video analytics event

    Request:
    {
        "session_id": "uuid",
        "video_id": "video-123",
        "event_type": "play|pause|seek|complete",
        "timestamp": 45.2,
        "data": {...}
    }
    """
    data = request.get_json()

    session_id = data.get("session_id")
    video_id = data.get("video_id")

    if not session_id or not video_id:
        return jsonify({"error": "Missing required fields"}), 400

    # Sanitize session_id to prevent path traversal
    session_id = secure_filename(session_id)
    if not session_id:
        return jsonify({"error": "Invalid session ID"}), 400
    
    # Save analytics event
    analytics_file = os.path.join(ANALYTICS_DIR, f"{session_id}.jsonl")
    # Prevent path traversal
    if not os.path.abspath(analytics_file).startswith(os.path.abspath(ANALYTICS_DIR)):
        return jsonify({"error": "Access denied"}), 403

    event = {**data, "recorded_at": datetime.utcnow().isoformat()}

    try:
        with open(analytics_file, "a") as f:
            f.write(json.dumps(event) + "\n")
    except OSError as e:
        return jsonify({"error": "Failed to save analytics", "message": str(e)}), 500

    return jsonify({"success": True})


@app.route("/api/analytics/playback", methods=["POST"])
def track_playback():
    """
    Track playback position

    Request:
    {
        "session_id": "uuid",
        "video_id": "video-123",
        "current_time": 45.2,
        "playback_rate": 1.0
    }
    """
    data = request.get_json()

    session_id = data.get("session_id")
    video_id = data.get("video_id")

    if not session_id or not video_id:
        return jsonify({"error": "Missing required fields"}), 400

    # Sanitize session_id to prevent path traversal
    session_id = secure_filename(session_id)
    if not session_id:
        return jsonify({"error": "Invalid session ID"}), 400
    
    # Save playback event
    analytics_file = os.path.join(ANALYTICS_DIR, f"{session_id}.jsonl")
    # Prevent path traversal
    if not os.path.abspath(analytics_file).startswith(os.path.abspath(ANALYTICS_DIR)):
        return jsonify({"error": "Access denied"}), 403

    event = {
        "event_type": "playback_position",
        **data,
        "recorded_at": datetime.utcnow().isoformat(),
    }

    try:
        with open(analytics_file, "a") as f:
            f.write(json.dumps(event) + "\n")
    except OSError as e:
        return jsonify({"error": "Failed to save playback data", "message": str(e)}), 500

    return jsonify({"success": True})


@app.route("/api/analytics/<video_id>", methods=["GET"])
def get_video_analytics(video_id):
    """Get analytics for a specific video"""
    # Sanitize video_id
    video_id = secure_filename(video_id)
    if not video_id:
        return jsonify({"error": "Invalid video ID"}), 400
    
    try:
        # Aggregate all sessions for this video
        analytics_files = os.listdir(ANALYTICS_DIR)

        total_views = 0
        events = []

        for filename in analytics_files:
            # Sanitize filename
            filename = secure_filename(filename)
            if not filename:
                continue
            
            file_path = os.path.join(ANALYTICS_DIR, filename)
            # Prevent path traversal
            if not os.path.abspath(file_path).startswith(os.path.abspath(ANALYTICS_DIR)):
                continue
            
            try:
                with open(file_path, "r") as f:
                    for line in f:
                        try:
                            event = json.loads(line)
                            if event.get("video_id") == video_id:
                                events.append(event)
                                if event.get("event_type") == "session_start":
                                    total_views += 1
                        except json.JSONDecodeError:
                            continue
            except OSError:
                continue
    except OSError as e:
        return jsonify({"error": "Failed to read analytics", "message": str(e)}), 500

    return jsonify(
        {
            "video_id": video_id,
            "total_views": total_views,
            "total_events": len(events),
            "events": events[-100:],  # Last 100 events
        }
    )


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🦉 HOOTNER Video Generation API")
    print("=" * 60)
    print("\n📡 Server starting on http://localhost:5003")
    print("\n📚 Endpoints:")
    print("   GET  /health                  - Health check")
    print("   POST /generate                - Generate single video")
    print("   POST /batch                   - Generate multiple videos")
    print("   GET  /download/<file>         - Download generated video")
    print("   GET  /models                  - List available models")
    print("   GET  /stats                   - Generation statistics")
    print("\n🎬 Video Player Integration:")
    print("   GET  /api/video/<id>          - Get video metadata")
    print("   GET  /api/video/stream/<file> - Stream video file")
    print("   GET  /api/video/sample         - Get sample video")
    print("\n📊 Analytics:")
    print("   POST /api/analytics/track     - Track events")
    print("   POST /api/analytics/playback  - Track playback")
    print("   GET  /api/analytics/<id>      - Get video analytics")
    print("\n" + "=" * 60 + "\n")

    app.run(host="0.0.0.0", port=5003, debug=False)
