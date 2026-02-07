#!/usr/bin/env python3
"""
Video Generation Service - Usage Examples
Demonstrates all enhanced features

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import requests
import socketio
import time
import json
from pathlib import Path


# Service URL
BASE_URL = "http://localhost:5003"


def example_1_basic_generation():
    """Example 1: Basic synchronous generation"""
    print("\n" + "=" * 60)
    print("Example 1: Basic Synchronous Generation")
    print("=" * 60)

    response = requests.post(
        f"{BASE_URL}/generate",
        json={
            "prompt": "A robot dancing in the rain",
            "num_frames": 16,
            "height": 64,
            "width": 64,
            "fps": 8,
            "format": "gif",
        },
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Generation successful!")
        print(f"   Job ID: {data['job_id']}")
        print(f"   Time: {data['generation_time']:.2f}s")
        print(f"   Download: {BASE_URL}{data['download_url']}")
    else:
        print(f"❌ Error: {response.json()}")


def example_2_async_generation():
    """Example 2: Async generation with WebSocket"""
    print("\n" + "=" * 60)
    print("Example 2: Async Generation with WebSocket")
    print("=" * 60)

    # Start async job
    response = requests.post(
        f"{BASE_URL}/generate",
        json={
            "prompt": "A cat playing piano under moonlight",
            "async": True,
            "num_frames": 16,
            "sampler": "dpm",
            "num_steps": 20,
        },
    )

    if response.status_code == 202:
        data = response.json()
        job_id = data["job_id"]
        print(f"✅ Job queued: {job_id}")

        # Connect to WebSocket
        sio = socketio.Client()

        @sio.on("progress", namespace="/generation")
        def on_progress(data):
            if data["job_id"] == job_id:
                print(
                    f"   Progress: {data['progress']}% ({data['step']}/{data['total']})"
                )

        @sio.on("completed", namespace="/generation")
        def on_completed(data):
            if data["job_id"] == job_id:
                print(f"✅ Completed in {data['generation_time']:.2f}s")
                print(f"   Download: {BASE_URL}{data['download_url']}")
                sio.disconnect()

        @sio.on("error", namespace="/generation")
        def on_error(data):
            if data["job_id"] == job_id:
                print(f"❌ Error: {data['error']}")
                sio.disconnect()

        try:
            sio.connect(BASE_URL)
            sio.emit("subscribe", {"job_id": job_id}, namespace="/generation")
            sio.wait()
        except Exception as e:
            print(f"⚠️  WebSocket error: {e}")
            print("   Falling back to polling...")

            # Poll status
            while True:
                status_response = requests.get(f"{BASE_URL}/status/{job_id}")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print(
                        f"   Status: {status_data['status']} - {status_data.get('progress', 0)}%"
                    )

                    if status_data["status"] == "completed":
                        print(f"✅ Completed!")
                        break
                    elif status_data["status"] == "failed":
                        print(f"❌ Failed: {status_data.get('error')}")
                        break

                time.sleep(2)
    else:
        print(f"❌ Error: {response.json()}")


def example_3_batch_generation():
    """Example 3: Batch generation"""
    print("\n" + "=" * 60)
    print("Example 3: Batch Generation")
    print("=" * 60)

    response = requests.post(
        f"{BASE_URL}/batch",
        json={
            "prompts": [
                "A sunset over mountains",
                "Ocean waves at night",
                "City lights timelapse",
            ],
            "params": {
                "num_frames": 16,
                "height": 64,
                "width": 64,
                "sampler": "dpm",
                "num_steps": 20,
            },
        },
    )

    if response.status_code == 202:
        data = response.json()
        print(f"✅ Batch queued: {data['total']} jobs")
        print(f"   Job IDs:")
        for job_id in data["job_ids"]:
            print(f"   - {job_id}")
    else:
        print(f"❌ Error: {response.json()}")


def example_4_with_effects():
    """Example 4: Generation with video effects"""
    print("\n" + "=" * 60)
    print("Example 4: Generation with Video Effects")
    print("=" * 60)

    # This would be done post-generation in Python
    print("Note: Effects are applied post-generation in Python:")
    print(
        """
    from video_effects import VideoEffects, load_video_from_file, save_video_to_file

    effects = VideoEffects()

    # Load generated video
    video = load_video_from_file('outputs/video.gif')

    # Apply cinematic preset
    video = effects.apply_preset(video, 'cinematic')

    # Add zoom effect
    video = effects.zoom(video, start_scale=1.0, end_scale=1.5)

    # Add fade in/out
    video = effects.fade_in(video, duration=8)
    video = effects.fade_out(video, duration=8)

    # Save result
    save_video_to_file(video, 'outputs/video_enhanced.gif', fps=8)
    """
    )


def example_5_caching():
    """Example 5: Using cache"""
    print("\n" + "=" * 60)
    print("Example 5: Response Caching")
    print("=" * 60)

    prompt = "A unique test prompt for caching"
    params = {
        "prompt": prompt,
        "num_frames": 16,
        "height": 64,
        "width": 64,
        "use_cache": True,
    }

    # First request (cache miss)
    print("First request (cache miss)...")
    start = time.time()
    response1 = requests.post(f"{BASE_URL}/generate", json=params)
    time1 = time.time() - start

    if response1.status_code == 200:
        print(f"✅ Generated in {time1:.2f}s")

    # Second request (cache hit)
    print("Second request (should hit cache)...")
    start = time.time()
    response2 = requests.post(f"{BASE_URL}/generate", json=params)
    time2 = time.time() - start

    if response2.status_code == 200:
        data = response2.json()
        if data.get("cached"):
            print(f"✅ Cache hit! Retrieved in {time2:.2f}s")
            print(f"   Speedup: {time1/time2:.1f}x faster")
        else:
            print(f"⚠️  Cache miss (may be disabled or expired)")


def example_6_health_and_metrics():
    """Example 6: Health check and metrics"""
    print("\n" + "=" * 60)
    print("Example 6: Health Check & Metrics")
    print("=" * 60)

    # Health check
    print("Health check:")
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        health = response.json()
        print(f"   Status: {health['status']}")
        print(f"   Version: {health['version']}")
        print(f"   Device: {health['device']}")
        print(f"   GPU: {health.get('gpu_name', 'N/A')}")
        print(f"   Queue size: {health['queue_size']}")
        print(
            f"   Redis: {'Connected' if health['redis_connected'] else 'Not connected'}"
        )

    # Metrics
    print("\nPrometheus metrics:")
    response = requests.get(f"{BASE_URL}/metrics")
    if response.status_code == 200:
        metrics = response.text
        # Show first few lines
        lines = metrics.split("\n")[:20]
        for line in lines:
            if line and not line.startswith("#"):
                print(f"   {line}")


def example_7_advanced_samplers():
    """Example 7: Using advanced samplers"""
    print("\n" + "=" * 60)
    print("Example 7: Advanced Samplers")
    print("=" * 60)

    samplers = ["dpm", "euler", "plms"]
    prompt = "A magical forest with glowing trees"

    for sampler in samplers:
        print(f"\nUsing {sampler.upper()} sampler...")

        response = requests.post(
            f"{BASE_URL}/generate",
            json={
                "prompt": prompt,
                "num_frames": 16,
                "sampler": sampler,
                "num_steps": 20 if sampler == "dpm" else 50,
            },
        )

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Generated in {data['generation_time']:.2f}s")
        else:
            print(f"   ❌ Error: {response.json()}")


def example_8_error_handling():
    """Example 8: Error handling"""
    print("\n" + "=" * 60)
    print("Example 8: Error Handling")
    print("=" * 60)

    # Test various error cases
    test_cases = [
        ("Missing prompt", {}),
        ("Empty prompt", {"prompt": ""}),
        ("Prompt too long", {"prompt": "x" * 1000}),
        ("Invalid num_frames", {"prompt": "test", "num_frames": 1000}),
        ("Invalid resolution", {"prompt": "test", "height": 10000}),
    ]

    for name, params in test_cases:
        print(f"\nTesting: {name}")
        response = requests.post(f"{BASE_URL}/generate", json=params)

        if response.status_code != 200:
            error = response.json()
            print(f"   ✅ Error caught: {error['error']}")
        else:
            print(f"   ⚠️  Should have failed!")


def main():
    """Run all examples"""
    print("\n" + "=" * 60)
    print("HOOTNER Video Generation Service - Usage Examples")
    print("=" * 60)

    # Check if service is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print("❌ Service is not healthy!")
            return
    except requests.exceptions.RequestException:
        print(f"❌ Cannot connect to service at {BASE_URL}")
        print("   Make sure the service is running: python api_enhanced.py")
        return

    print(f"✅ Service is running at {BASE_URL}\n")

    # Run examples
    examples = [
        ("Basic Generation", example_1_basic_generation),
        ("Async Generation", example_2_async_generation),
        ("Batch Generation", example_3_batch_generation),
        ("Video Effects", example_4_with_effects),
        ("Caching", example_5_caching),
        ("Health & Metrics", example_6_health_and_metrics),
        ("Advanced Samplers", example_7_advanced_samplers),
        ("Error Handling", example_8_error_handling),
    ]

    print("Available examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"   {i}. {name}")

    choice = input("\nEnter example number (1-8) or 'all': ").strip()

    if choice.lower() == "all":
        for name, func in examples:
            try:
                func()
            except Exception as e:
                print(f"❌ Error in {name}: {e}")
    elif choice.isdigit() and 1 <= int(choice) <= len(examples):
        idx = int(choice) - 1
        try:
            examples[idx][1]()
        except Exception as e:
            print(f"❌ Error: {e}")
    else:
        print("Invalid choice!")

    print("\n" + "=" * 60)
    print("Examples completed!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
