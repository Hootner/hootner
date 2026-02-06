"""
Adaptive Streaming Support (HLS & DASH)
Multi-bitrate streaming for optimal playback quality

Author: HOOTNER AI Platform
Date: January 11, 2026
"""
# cSpell:ignore maxrate bufsize nokey noprint ffprobe xywh millis WEBVTT libx mbps EXTM

import subprocess
import os
import json
from typing import List, Dict, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class AdaptiveStreamGenerator:
    """
    Generate adaptive streaming manifests (HLS and DASH)

    Features:
    - Multi-bitrate ladder
    - HLS (HTTP Live Streaming)
    - DASH (Dynamic Adaptive Streaming over HTTP)
    - Thumbnail preview tracks
    - Subtitle support
    """

    def __init__(self, ffmpeg_path: str = "ffmpeg"):
        self.ffmpeg_path = ffmpeg_path

        # Quality ladder for adaptive streaming
        self.quality_ladder = [
            {
                "name": "8k",
                "resolution": "7680x4320",
                "bitrate": "150M",
                "maxrate": "180M",
                "bufsize": "300M",
                "audio_bitrate": "1536k",
            },
            {
                "name": "4k",
                "resolution": "3840x2160",
                "bitrate": "50M",
                "maxrate": "60M",
                "bufsize": "100M",
                "audio_bitrate": "768k",
            },
            {
                "name": "1080p",
                "resolution": "1920x1080",
                "bitrate": "8M",
                "maxrate": "10M",
                "bufsize": "16M",
                "audio_bitrate": "384k",
            },
            {
                "name": "720p",
                "resolution": "1280x720",
                "bitrate": "4M",
                "maxrate": "5M",
                "bufsize": "8M",
                "audio_bitrate": "256k",
            },
            {
                "name": "480p",
                "resolution": "854x480",
                "bitrate": "2M",
                "maxrate": "2.5M",
                "bufsize": "4M",
                "audio_bitrate": "192k",
            },
            {
                "name": "360p",
                "resolution": "640x360",
                "bitrate": "1M",
                "maxrate": "1.2M",
                "bufsize": "2M",
                "audio_bitrate": "128k",
            },
        ]

    def generate_hls(
        self, input_video: str, output_dir: str, qualities: Optional[List[str]] = None
    ) -> str:
        """
        Generate HLS adaptive streaming files

        Args:
            input_video: Input video path
            output_dir: Output directory
            qualities: List of quality names to include (default: all)

        Returns:
            Path to master playlist (.m3u8)
        """
        os.makedirs(output_dir, exist_ok=True)

        if qualities is None:
            qualities = [q["name"] for q in self.quality_ladder]

        logger.info(f"🎬 Generating HLS streams for qualities: {', '.join(qualities)}")

        # Generate streams for each quality
        variant_playlists = []

        for quality_config in self.quality_ladder:
            if quality_config["name"] not in qualities:
                continue

            logger.info(f"   Encoding {quality_config['name']}...")

            output_path = os.path.join(output_dir, quality_config["name"])
            os.makedirs(output_path, exist_ok=True)

            playlist_path = self._generate_hls_variant(
                input_video, output_path, quality_config
            )

            variant_playlists.append(
                {
                    "path": playlist_path,
                    "name": quality_config["name"],
                    "resolution": quality_config["resolution"],
                    "bitrate": quality_config["bitrate"],
                }
            )

        # Generate master playlist
        master_playlist_path = self._generate_hls_master_playlist(
            output_dir, variant_playlists
        )

        logger.info(f"✅ HLS generation complete: {master_playlist_path}")
        return master_playlist_path

    def _generate_hls_variant(
        self, input_video: str, output_dir: str, quality_config: Dict
    ) -> str:
        """Generate single HLS variant stream"""
        playlist_file = os.path.join(output_dir, "playlist.m3u8")
        segment_pattern = os.path.join(output_dir, "segment_%05d.ts")

        cmd = [
            self.ffmpeg_path,
            "-i",
            input_video,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-b:v",
            quality_config["bitrate"],
            "-maxrate",
            quality_config["maxrate"],
            "-bufsize",
            quality_config["bufsize"],
            "-vf",
            f"scale={quality_config['resolution']}",
            "-c:a",
            "aac",
            "-b:a",
            quality_config["audio_bitrate"],
            "-ar",
            "48000",
            "-f",
            "hls",
            "-hls_time",
            "6",
            "-hls_playlist_type",
            "vod",
            "-hls_segment_filename",
            segment_pattern,
            playlist_file,
        ]

        subprocess.run(cmd, check=True, capture_output=True)
        return playlist_file

    def _generate_hls_master_playlist(
        self, output_dir: str, variants: List[Dict]
    ) -> str:
        """Generate HLS master playlist"""
        master_path = os.path.join(output_dir, "master.m3u8")

        with open(master_path, "w") as f:
            f.write("#EXTM3U\n")
            f.write("#EXT-X-VERSION:3\n\n")

            for variant in variants:
                # Parse resolution
                width, height = variant["resolution"].split("x")
                # Parse bitrate (remove 'M' and convert to bps)
                bitrate_mbps = variant["bitrate"].replace("M", "")
                bitrate_bps = int(float(bitrate_mbps) * 1_000_000)

                # Write stream info
                f.write(f"#EXT-X-STREAM-INF:")
                f.write(f"BANDWIDTH={bitrate_bps},")
                f.write(f"RESOLUTION={width}x{height},")
                f.write(f"NAME=\"{variant['name']}\"\n")

                # Relative path to variant playlist (sanitized)
                variant_path = Path(variant["path"]).resolve()
                output_path = Path(output_dir).resolve()
                if not str(variant_path).startswith(str(output_path)):
                    raise ValueError("Path traversal detected")
                rel_path = os.path.relpath(variant["path"], output_dir)
                f.write(f"{rel_path}\n\n")

        return master_path

    def generate_dash(
        self, input_video: str, output_dir: str, qualities: Optional[List[str]] = None
    ) -> str:
        """
        Generate DASH adaptive streaming files

        Args:
            input_video: Input video path
            output_dir: Output directory
            qualities: List of quality names to include

        Returns:
            Path to MPD manifest
        """
        os.makedirs(output_dir, exist_ok=True)

        if qualities is None:
            qualities = [q["name"] for q in self.quality_ladder]

        logger.info(f"🎬 Generating DASH streams for qualities: {', '.join(qualities)}")

        # Build FFmpeg command for multi-bitrate DASH
        mpd_path = os.path.join(output_dir, "manifest.mpd")

        cmd = [self.ffmpeg_path, "-i", input_video]

        # Add streams for each quality
        for i, quality_config in enumerate(self.quality_ladder):
            if quality_config["name"] not in qualities:
                continue

            # Video stream
            cmd.extend(
                [
                    "-map",
                    "0:v",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "medium",
                    "-b:v",
                    quality_config["bitrate"],
                    "-maxrate",
                    quality_config["maxrate"],
                    "-bufsize",
                    quality_config["bufsize"],
                    "-vf",
                    f"scale={quality_config['resolution']}",
                    "-profile:v",
                    "high",
                    "-level",
                    "4.2",
                ]
            )

            # Audio stream
            cmd.extend(
                [
                    "-map",
                    "0:a",
                    "-c:a",
                    "aac",
                    "-b:a",
                    quality_config["audio_bitrate"],
                    "-ar",
                    "48000",
                ]
            )

        # DASH output options
        cmd.extend(
            [
                "-f",
                "dash",
                "-seg_duration",
                "6",
                "-use_template",
                "1",
                "-use_timeline",
                "1",
                "-adaptation_sets",
                "id=0,streams=v id=1,streams=a",
                mpd_path,
            ]
        )

        subprocess.run(cmd, check=True, capture_output=True)

        logger.info(f"✅ DASH generation complete: {mpd_path}")
        return mpd_path

    def generate_preview_thumbnails(
        self, input_video: str, output_dir: str, interval_seconds: int = 10
    ) -> Dict:
        """
        Generate thumbnail sprite sheet for preview scrubbing

        Args:
            input_video: Input video path
            output_dir: Output directory
            interval_seconds: Thumbnail interval in seconds

        Returns:
            Dictionary with sprite info
        """
        os.makedirs(output_dir, exist_ok=True)

        logger.info(f"📸 Generating preview thumbnails (every {interval_seconds}s)...")

        # Get video duration
        probe_cmd = [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            input_video,
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip())

        # Generate thumbnails
        num_thumbnails = int(duration / interval_seconds)
        thumbnail_pattern = os.path.join(output_dir, "thumb_%04d.jpg")

        cmd = [
            self.ffmpeg_path,
            "-i",
            input_video,
            "-vf",
            f"fps=1/{interval_seconds},scale=160:90",
            "-q:v",
            "5",
            thumbnail_pattern,
        ]

        subprocess.run(cmd, check=True, capture_output=True)

        # Create sprite sheet (combine thumbnails)
        sprite_path = os.path.join(output_dir, "sprite.jpg")
        cols = 10
        rows = (num_thumbnails + cols - 1) // cols

        sprite_cmd = [
            self.ffmpeg_path,
            "-i",
            thumbnail_pattern,
            "-filter_complex",
            f"tile={cols}x{rows}",
            sprite_path,
        ]

        subprocess.run(sprite_cmd, check=True, capture_output=True)

        # Generate VTT file for thumbnails
        vtt_path = self._generate_thumbnail_vtt(
            output_dir, num_thumbnails, interval_seconds, cols, rows
        )

        logger.info(f"✅ Generated {num_thumbnails} thumbnails")

        return {
            "sprite_sheet": sprite_path,
            "vtt_file": vtt_path,
            "num_thumbnails": num_thumbnails,
            "thumbnail_width": 160,
            "thumbnail_height": 90,
            "columns": cols,
            "rows": rows,
        }

    def _generate_thumbnail_vtt(
        self, output_dir: str, num_thumbnails: int, interval: int, cols: int, rows: int
    ) -> str:
        """Generate WebVTT file for thumbnail preview track"""
        vtt_path = os.path.join(output_dir, "thumbnails.vtt")

        with open(vtt_path, "w") as f:
            f.write("WEBVTT\n\n")

            for i in range(num_thumbnails):
                start_time = i * interval
                end_time = (i + 1) * interval

                # Calculate sprite position
                col = i % cols
                row = i // cols
                x = col * 160
                y = row * 90

                # Format time (HH:MM:SS.mmm)
                start_str = self._format_vtt_time(start_time)
                end_str = self._format_vtt_time(end_time)

                f.write(f"{start_str} --> {end_str}\n")
                f.write(f"sprite.jpg#xywh={x},{y},160,90\n\n")

        return vtt_path

    def _format_vtt_time(self, seconds: float) -> str:
        """Format time for WebVTT"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


# ============================================================================
# High-Level API
# ============================================================================


def create_adaptive_streaming_package(
    input_video: str,
    output_dir: str,
    formats: List[str] = ["hls", "dash"],
    qualities: Optional[List[str]] = None,
    generate_thumbnails: bool = True,
) -> Dict:
    """
    Create complete adaptive streaming package

    Args:
        input_video: Input video path
        output_dir: Output directory
        formats: List of formats ('hls', 'dash')
        qualities: Quality levels to include
        generate_thumbnails: Generate preview thumbnails

    Returns:
        Dictionary with paths to all generated files
    """
    logger.info("📦 Creating adaptive streaming package...")

    generator = AdaptiveStreamGenerator()
    result = {}

    # Generate HLS
    if "hls" in formats:
        hls_dir = os.path.join(output_dir, "hls")
        result["hls_master"] = generator.generate_hls(input_video, hls_dir, qualities)

    # Generate DASH
    if "dash" in formats:
        dash_dir = os.path.join(output_dir, "dash")
        result["dash_manifest"] = generator.generate_dash(
            input_video, dash_dir, qualities
        )

    # Generate thumbnails
    if generate_thumbnails:
        thumb_dir = os.path.join(output_dir, "thumbnails")
        result["thumbnails"] = generator.generate_preview_thumbnails(
            input_video, thumb_dir
        )

    logger.info("✅ Adaptive streaming package complete!")
    return result


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("Adaptive Streaming Generator")
    print("=" * 60)

    # Example usage
    # result = create_adaptive_streaming_package(
    #     input_video="movie_4k_hdr.mp4",
    #     output_dir="./streaming",
    #     formats=['hls', 'dash'],
    #     qualities=['8k', '4k', '1080p', '720p', '480p'],
    #     generate_thumbnails=True
    # )
    #
    # print(f"\n📊 Generated:")
    # print(f"   HLS: {result.get('hls_master')}")
    # print(f"   DASH: {result.get('dash_manifest')}")
    # print(f"   Thumbnails: {result['thumbnails']['num_thumbnails']}")

    print("\n✅ Adaptive streaming module ready!")
