"""
Extended API for 30-Minute AI-Generated Videos
Optimized endpoint for long-form video generation with chunked processing

Author: HOOTNER AI Platform
Date: January 23, 2026
"""

from flask import Flask, request, jsonify, Blueprint
import os
import uuid
import time
import json
from datetime import datetime, timedelta
import threading
from typing import Dict, Any

from long_form_processor import LongFormVideoProcessor
from generator import VideoGenerator

# Create blueprint for long-form endpoints
long_form_bp = Blueprint('long_form', __name__, url_prefix='/api/v1/long-form')

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs", "long_form")
ANALYTICS_DIR = os.path.join(os.path.dirname(__file__), "analytics")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(ANALYTICS_DIR, exist_ok=True)

# Job storage (in production, use Redis or database)
active_jobs: Dict[str, Dict[str, Any]] = {}


@long_form_bp.route('/generate', methods=['POST'])
def generate_30min_video():
    """
    Generate 30-minute AI video with optimized chunked processing

    Request JSON:
    {
        "prompt": "A cinematic journey through space with stars and galaxies",
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

    Response:
    {
        "job_id": "uuid",
        "status": "queued",
        "estimated_time_minutes": 60,
        "total_chunks": 36,
        "total_frames": 43200,
        "resolution": "3840x2160",
        "progress_url": "/api/v1/long-form/progress/uuid",
        "download_url": "/api/v1/long-form/download/uuid"
    }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()

    # Validate required fields
    if "prompt" not in data:
        return jsonify({"error": "Missing required field: prompt"}), 400

    prompt = data["prompt"].strip()
    if not prompt:
        return jsonify({"error": "Prompt cannot be empty"}), 400

    # Parse parameters with optimized defaults for 30-minute videos
    duration_minutes = float(data.get("duration_minutes", 30))
    resolution = data.get("resolution", "4k").lower()
    fps = int(data.get("fps", 24))
    quality = data.get("quality", "high").lower()
    hdr_enabled = data.get("hdr_enabled", True)
    guidance_scale = float(data.get("guidance_scale", 7.5))
    seed = data.get("seed", None)
    enable_checkpoints = data.get("enable_checkpoints", True)
    email_notification = data.get("email_notification", None)

    # Validate duration (1-30 minutes)
    if duration_minutes <= 0 or duration_minutes > 30:
        return jsonify({
            "error": "Duration must be between 1 and 30 minutes",
            "details": "For videos longer than 30 minutes, use /api/v1/ultra-long-form/generate"
        }), 400

    # Resolution mapping
    resolution_map = {
        "hd": {"height": 1080, "width": 1920},
        "2k": {"height": 1440, "width": 2560},
        "4k": {"height": 2160, "width": 3840},
        "8k": {"height": 4320, "width": 7680},
    }

    if resolution not in resolution_map:
        return jsonify({
            "error": "Invalid resolution",
            "valid_options": list(resolution_map.keys())
        }), 400

    height = resolution_map[resolution]["height"]
    width = resolution_map[resolution]["width"]

    # Quality settings (affects inference steps and guidance)
    quality_map = {
        "draft": {"inference_steps": 20, "guidance_scale": 5.0, "speed_multiplier": 3.0},
        "medium": {"inference_steps": 30, "guidance_scale": 6.5, "speed_multiplier": 2.0},
        "high": {"inference_steps": 50, "guidance_scale": 7.5, "speed_multiplier": 1.0},
        "cinema": {"inference_steps": 100, "guidance_scale": 9.0, "speed_multiplier": 0.5},
    }

    if quality not in quality_map:
        return jsonify({
            "error": "Invalid quality",
            "valid_options": list(quality_map.keys())
        }), 400

    num_inference_steps = quality_map[quality]["inference_steps"]
    speed_multiplier = quality_map[quality]["speed_multiplier"]

    # Calculate video specs
    total_frames = int(duration_minutes * 60 * fps)  # 30 min * 60 sec * 24 fps = 43,200 frames
    chunk_size = 1200  # 50 seconds at 24fps (optimal chunk size)
    total_chunks = (total_frames + chunk_size - 1) // chunk_size

    # Estimate processing time
    # Base: 2 minutes per chunk at high quality
    base_time_per_chunk = 2.0
    resolution_factor = (height * width) / (1920 * 1080)  # Relative to HD
    estimated_time_minutes = int(
        total_chunks * base_time_per_chunk * (1 / speed_multiplier) * resolution_factor
    )

    # Generate job ID
    job_id = str(uuid.uuid4())
    output_filename = f"{job_id}_30min_{resolution}_{quality}.mp4"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # Create job metadata
    job_metadata = {
        "job_id": job_id,
        "status": "queued",
        "prompt": prompt,
        "duration_minutes": duration_minutes,
        "total_frames": total_frames,
        "resolution": resolution,
        "width": width,
        "height": height,
        "fps": fps,
        "quality": quality,
        "hdr_enabled": hdr_enabled,
        "guidance_scale": guidance_scale,
        "seed": seed,
        "num_inference_steps": num_inference_steps,
        "total_chunks": total_chunks,
        "chunks_completed": 0,
        "progress_percent": 0,
        "enable_checkpoints": enable_checkpoints,
        "email_notification": email_notification,
        "output_path": output_path,
        "output_filename": output_filename,
        "created_at": datetime.utcnow().isoformat(),
        "estimated_completion_at": (
            datetime.utcnow() + timedelta(minutes=estimated_time_minutes)
        ).isoformat(),
        "estimated_time_minutes": estimated_time_minutes,
        "started_at": None,
        "completed_at": None,
        "error": None,
    }

    # Store job metadata
    active_jobs[job_id] = job_metadata
    job_file = os.path.join(ANALYTICS_DIR, f"{job_id}.json")
    with open(job_file, "w") as f:
        json.dump(job_metadata, f, indent=2)

    # Start async processing
    thread = threading.Thread(
        target=_process_long_video,
        args=(job_id, job_metadata, chunk_size)
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "job_id": job_id,
        "status": "queued",
        "estimated_time_minutes": estimated_time_minutes,
        "estimated_completion_at": job_metadata["estimated_completion_at"],
        "total_chunks": total_chunks,
        "total_frames": total_frames,
        "resolution": f"{width}x{height}",
        "fps": fps,
        "quality": quality,
        "hdr_enabled": hdr_enabled,
        "file_size_estimate_gb": _estimate_file_size(total_frames, width, height, hdr_enabled),
        "progress_url": f"/api/v1/long-form/progress/{job_id}",
        "download_url": f"/api/v1/long-form/download/{job_id}",
    }), 202


@long_form_bp.route('/progress/<job_id>', methods=['GET'])
def get_progress(job_id):
    """
    Get real-time progress of video generation

    Response:
    {
        "job_id": "uuid",
        "status": "processing",
        "progress_percent": 45.5,
        "chunks_completed": 16,
        "total_chunks": 36,
        "current_chunk": 17,
        "estimated_time_remaining_minutes": 25,
        "elapsed_time_minutes": 20
    }
    """
    if job_id not in active_jobs:
        # Try loading from file
        job_file = os.path.join(ANALYTICS_DIR, f"{job_id}.json")
        if os.path.exists(job_file):
            with open(job_file, "r") as f:
                job_metadata = json.load(f)
                active_jobs[job_id] = job_metadata
        else:
            return jsonify({"error": "Job not found"}), 404

    job_metadata = active_jobs[job_id]

    # Calculate elapsed time
    elapsed_minutes = None
    if job_metadata["started_at"]:
        started = datetime.fromisoformat(job_metadata["started_at"])
        elapsed = datetime.utcnow() - started
        elapsed_minutes = elapsed.total_seconds() / 60

    # Calculate estimated time remaining
    eta_minutes = None
    if elapsed_minutes and job_metadata["progress_percent"] > 0:
        total_estimated = elapsed_minutes / (job_metadata["progress_percent"] / 100)
        eta_minutes = total_estimated - elapsed_minutes

    return jsonify({
        "job_id": job_id,
        "status": job_metadata["status"],
        "progress_percent": round(job_metadata["progress_percent"], 2),
        "chunks_completed": job_metadata["chunks_completed"],
        "total_chunks": job_metadata["total_chunks"],
        "current_chunk": job_metadata["chunks_completed"] + 1 if job_metadata["status"] == "processing" else None,
        "elapsed_time_minutes": round(elapsed_minutes, 1) if elapsed_minutes else None,
        "estimated_time_remaining_minutes": round(eta_minutes, 1) if eta_minutes else job_metadata["estimated_time_minutes"],
        "estimated_completion_at": job_metadata["estimated_completion_at"],
        "created_at": job_metadata["created_at"],
        "started_at": job_metadata["started_at"],
        "completed_at": job_metadata["completed_at"],
        "error": job_metadata["error"],
    })


@long_form_bp.route('/download/<job_id>', methods=['GET'])
def download_video(job_id):
    """Download completed video"""
    from flask import send_file

    if job_id not in active_jobs:
        job_file = os.path.join(ANALYTICS_DIR, f"{job_id}.json")
        if os.path.exists(job_file):
            with open(job_file, "r") as f:
                job_metadata = json.load(f)
                active_jobs[job_id] = job_metadata
        else:
            return jsonify({"error": "Job not found"}), 404

    job_metadata = active_jobs[job_id]

    if job_metadata["status"] != "completed":
        return jsonify({
            "error": "Video not ready",
            "status": job_metadata["status"],
            "progress_percent": job_metadata["progress_percent"]
        }), 400

    output_path = job_metadata["output_path"]

    if not os.path.exists(output_path):
        return jsonify({"error": "Video file not found"}), 404

    return send_file(
        output_path,
        mimetype='video/mp4',
        as_attachment=True,
        download_name=job_metadata["output_filename"]
    )


@long_form_bp.route('/cancel/<job_id>', methods=['POST'])
def cancel_job(job_id):
    """Cancel an active job"""
    if job_id not in active_jobs:
        return jsonify({"error": "Job not found"}), 404

    job_metadata = active_jobs[job_id]

    if job_metadata["status"] in ["completed", "failed", "cancelled"]:
        return jsonify({
            "error": "Cannot cancel job",
            "status": job_metadata["status"]
        }), 400

    # Mark as cancelled
    job_metadata["status"] = "cancelled"
    job_metadata["completed_at"] = datetime.utcnow().isoformat()

    # Update file
    job_file = os.path.join(ANALYTICS_DIR, f"{job_id}.json")
    with open(job_file, "w") as f:
        json.dump(job_metadata, f, indent=2)

    return jsonify({
        "job_id": job_id,
        "status": "cancelled",
        "message": "Job cancellation requested"
    })


@long_form_bp.route('/list', methods=['GET'])
def list_jobs():
    """List all jobs (with optional filtering)"""
    status_filter = request.args.get('status', None)
    limit = int(request.args.get('limit', 50))

    jobs = []
    for job_id, metadata in list(active_jobs.items())[:limit]:
        if status_filter and metadata["status"] != status_filter:
            continue

        jobs.append({
            "job_id": job_id,
            "status": metadata["status"],
            "prompt": metadata["prompt"][:100] + "..." if len(metadata["prompt"]) > 100 else metadata["prompt"],
            "duration_minutes": metadata["duration_minutes"],
            "resolution": metadata["resolution"],
            "progress_percent": metadata["progress_percent"],
            "created_at": metadata["created_at"],
        })

    return jsonify({
        "total": len(jobs),
        "jobs": jobs
    })


def _process_long_video(job_id: str, job_metadata: Dict[str, Any], chunk_size: int):
    """Background processor for long-form video generation"""
    try:
        # Update status
        job_metadata["status"] = "processing"
        job_metadata["started_at"] = datetime.utcnow().isoformat()
        _save_job_metadata(job_id, job_metadata)

        # Initialize processor
        processor = LongFormVideoProcessor(
            chunk_size=chunk_size,
            overlap_frames=24,  # 1 second overlap
            checkpoint_interval=7200 if job_metadata["enable_checkpoints"] else None,
        )

        # Process each chunk
        total_chunks = job_metadata["total_chunks"]

        for chunk_idx in range(total_chunks):
            # Check if cancelled
            if job_metadata["status"] == "cancelled":
                break

            # Simulate chunk processing (in production, call actual generator)
            # This would involve:
            # 1. Generate chunk frames using diffusion model
            # 2. Apply HDR processing if enabled
            # 3. Write to output file
            # 4. Handle checkpointing

            time.sleep(2)  # Placeholder for actual processing

            # Update progress
            job_metadata["chunks_completed"] = chunk_idx + 1
            job_metadata["progress_percent"] = ((chunk_idx + 1) / total_chunks) * 100
            _save_job_metadata(job_id, job_metadata)

        # Mark as completed
        if job_metadata["status"] != "cancelled":
            job_metadata["status"] = "completed"
            job_metadata["completed_at"] = datetime.utcnow().isoformat()
            job_metadata["progress_percent"] = 100

        _save_job_metadata(job_id, job_metadata)

    except Exception as e:
        # Handle errors
        job_metadata["status"] = "failed"
        job_metadata["error"] = str(e)
        job_metadata["completed_at"] = datetime.utcnow().isoformat()
        _save_job_metadata(job_id, job_metadata)


def _save_job_metadata(job_id: str, job_metadata: Dict[str, Any]):
    """Save job metadata to file"""
    job_file = os.path.join(ANALYTICS_DIR, f"{job_id}.json")
    with open(job_file, "w") as f:
        json.dump(job_metadata, f, indent=2)


def _estimate_file_size(total_frames: int, width: int, height: int, hdr_enabled: bool) -> float:
    """Estimate output file size in GB"""
    # Base bitrate: 10 Mbps for HD, scale with resolution
    base_bitrate = 10_000_000  # 10 Mbps in bits per second
    resolution_factor = (width * height) / (1920 * 1080)
    hdr_factor = 1.5 if hdr_enabled else 1.0

    bitrate = base_bitrate * resolution_factor * hdr_factor
    duration_seconds = total_frames / 24  # Assuming 24 fps
    total_bits = bitrate * duration_seconds
    total_bytes = total_bits / 8
    total_gb = total_bytes / (1024 ** 3)

    return round(total_gb, 2)


# Create standalone Flask app for testing
if __name__ == "__main__":
    app = Flask(__name__)
    app.register_blueprint(long_form_bp)

    print("\n" + "=" * 80)
    print("🎬 HOOTNER 30-Minute AI Video Generation API")
    print("=" * 80)
    print("\n📡 Server starting on http://localhost:5004")
    print("\n📚 Endpoints:")
    print("   POST /api/v1/long-form/generate         - Generate 30-minute video")
    print("   GET  /api/v1/long-form/progress/<id>    - Get generation progress")
    print("   GET  /api/v1/long-form/download/<id>    - Download completed video")
    print("   POST /api/v1/long-form/cancel/<id>      - Cancel active job")
    print("   GET  /api/v1/long-form/list             - List all jobs")
    print("\n💡 Example Usage:")
    print('''
    curl -X POST http://localhost:5004/api/v1/long-form/generate \\
      -H "Content-Type: application/json" \\
      -d '{
        "prompt": "A cinematic journey through space",
        "duration_minutes": 30,
        "resolution": "4k",
        "quality": "high",
        "hdr_enabled": true
      }'
    ''')
    print("\n" + "=" * 80 + "\n")

    app.run(host="0.0.0.0", port=5004, debug=True)
