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

from generator import VideoGenerator

# Initialize Flask app
app = Flask(__name__)
CORS(
    app,
    origins=["http://localhost:5173", "http://localhost:3000", "https://hootner.com"],
)

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

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
    num_frames = int(data.get("num_frames", 16))
    height = int(data.get("height", 64))
    width = int(data.get("width", 64))
    fps = int(data.get("fps", 8))
    num_inference_steps = int(data.get("num_inference_steps", 50))
    guidance_scale = float(data.get("guidance_scale", 7.5))
    seed = data.get("seed", None)
    output_format = data.get("format", "gif")  # 'gif' or 'mp4'

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
    # Secure filename
    filename = secure_filename(filename)
    file_path = os.path.join(OUTPUT_DIR, filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

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
    output_files = os.listdir(OUTPUT_DIR)

    total_size = sum(
        os.path.getsize(os.path.join(OUTPUT_DIR, f))
        for f in output_files
        if os.path.isfile(os.path.join(OUTPUT_DIR, f))
    )

    return jsonify(
        {
            "total_generations": len(output_files),
            "storage_used_mb": round(total_size / (1024 * 1024), 2),
            "device": str(generator.device),
            "model_size": "base",
        }
    )


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🦉 HOOTNER Video Generation API")
    print("=" * 60)
    print("\n📡 Server starting on http://localhost:5003")
    print("\n📚 Endpoints:")
    print("   GET  /health          - Health check")
    print("   POST /generate        - Generate single video")
    print("   POST /batch           - Generate multiple videos")
    print("   GET  /download/<file> - Download generated video")
    print("   GET  /models          - List available models")
    print("   GET  /stats           - Generation statistics")
    print("\n" + "=" * 60 + "\n")

    app.run(host="0.0.0.0", port=5003, debug=False)
