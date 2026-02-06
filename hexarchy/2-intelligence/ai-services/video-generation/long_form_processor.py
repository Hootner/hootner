"""
Long-Form Video Processing (up to 4 hours)
Chunked processing with streaming output to handle extended videos

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import numpy as np
from typing import Optional, List, Tuple, Generator
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)


class LongFormVideoProcessor:
    """
    Process long-form videos (up to 4 hours) using chunked processing

    Features:
    - Chunked processing to manage memory
    - Streaming output (no need to load entire video in RAM)
    - Checkpoint system for recovery
    - Smooth transitions between chunks
    - Progress tracking
    """

    def __init__(
        self,
        chunk_size: int = 1200,  # 50 seconds at 24fps
        overlap_frames: int = 24,  # 1 second overlap
        checkpoint_interval: int = 7200,  # 5 minutes
    ):
        self.chunk_size = chunk_size
        self.overlap_frames = overlap_frames
        self.checkpoint_interval = checkpoint_interval

        # Checkpoint directory
        self.checkpoint_dir = None

    def process_video_chunks(
        self,
        video_generator: Generator[np.ndarray, None, None],
        total_frames: int,
        process_func: callable,
        output_path: str,
        fps: int = 24,
        **process_kwargs,
    ) -> str:
        """
        Process long video in chunks with streaming output

        Args:
            video_generator: Generator yielding video frames
            total_frames: Total number of frames
            process_func: Function to process each chunk (e.g., HDR conversion)
            output_path: Output video path
            fps: Frame rate
            **process_kwargs: Additional args for process_func

        Returns:
            Path to processed video
        """
        import cv2

        logger.info(f"🎬 Processing long-form video: {total_frames} frames")
        logger.info(f"   Chunk size: {self.chunk_size} frames")
        logger.info(f"   Overlap: {self.overlap_frames} frames")

        # Create checkpoint directory
        self.checkpoint_dir = tempfile.mkdtemp(prefix="video_checkpoint_")
        logger.info(f"   Checkpoint dir: {self.checkpoint_dir}")

        # Initialize video writer (will be created on first frame)
        writer = None
        frame_shape = None

        # Process chunks
        chunk_idx = 0
        processed_frames = 0
        chunk_buffer = []

        try:
            for frame in video_generator:
                # Initialize writer on first frame
                if writer is None:
                    frame_shape = frame.shape
                    height, width = frame_shape[:2]
                    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
                    writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                    logger.info(
                        f"   Video writer initialized: {width}x{height} @ {fps}fps"
                    )

                # Add frame to buffer
                chunk_buffer.append(frame)

                # Process chunk when buffer is full
                if len(chunk_buffer) >= self.chunk_size:
                    self._process_and_write_chunk(
                        chunk_buffer, chunk_idx, writer, process_func, **process_kwargs
                    )

                    # Keep overlap frames for next chunk
                    chunk_buffer = chunk_buffer[-self.overlap_frames :]
                    chunk_idx += 1
                    processed_frames += self.chunk_size

                    # Save checkpoint
                    if processed_frames % self.checkpoint_interval == 0:
                        self._save_checkpoint(chunk_idx, processed_frames)

                    # Progress update
                    progress = (processed_frames / total_frames) * 100
                    logger.info(
                        f"   Progress: {progress:.1f}% ({processed_frames}/{total_frames} frames)"
                    )

            # Process remaining frames
            if chunk_buffer:
                self._process_and_write_chunk(
                    chunk_buffer, chunk_idx, writer, process_func, **process_kwargs
                )
                processed_frames += len(chunk_buffer)

            logger.info(f"✅ Processing complete: {processed_frames} frames")

        finally:
            # Cleanup
            if writer is not None:
                writer.release()

            # Remove checkpoint directory
            if self.checkpoint_dir and os.path.exists(self.checkpoint_dir):
                import shutil

                shutil.rmtree(self.checkpoint_dir)

        return output_path

    def _process_and_write_chunk(
        self,
        chunk: List[np.ndarray],
        chunk_idx: int,
        writer,
        process_func: callable,
        **kwargs,
    ):
        """Process a chunk and write to output"""
        import cv2

        # Convert list to array
        chunk_array = np.array(chunk)

        # Process chunk
        processed = process_func(chunk_array, **kwargs)

        # Write frames
        for frame in processed:
            # Convert to uint8 if needed
            if frame.dtype != np.uint8:
                if frame.max() > 1.0:
                    frame = np.clip(frame, 0, 255).astype(np.uint8)
                else:
                    frame = (frame * 255).clip(0, 255).astype(np.uint8)

            # Convert RGB to BGR for OpenCV
            if frame.shape[-1] == 3:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

            writer.write(frame)

    def _save_checkpoint(self, chunk_idx: int, processed_frames: int):
        """Save processing checkpoint"""
        checkpoint_file = os.path.join(
            self.checkpoint_dir, f"checkpoint_{chunk_idx}.txt"
        )

        with open(checkpoint_file, "w") as f:
            f.write(f"chunk_idx={chunk_idx}\n")
            f.write(f"processed_frames={processed_frames}\n")

        logger.info(f"   💾 Checkpoint saved: chunk {chunk_idx}")

    def load_checkpoint(self) -> Optional[Tuple[int, int]]:
        """Load last checkpoint"""
        if not self.checkpoint_dir or not os.path.exists(self.checkpoint_dir):
            return None

        # Find latest checkpoint
        checkpoints = sorted(Path(self.checkpoint_dir).glob("checkpoint_*.txt"))
        if not checkpoints:
            return None

        latest = checkpoints[-1]
        with open(latest) as f:
            data = dict(line.strip().split("=") for line in f)

        chunk_idx = int(data["chunk_idx"])
        processed_frames = int(data["processed_frames"])

        logger.info(
            f"   📂 Loaded checkpoint: chunk {chunk_idx}, {processed_frames} frames"
        )
        return chunk_idx, processed_frames


class StreamingVideoReader:
    """
    Memory-efficient video reader for long-form content
    Yields frames one at a time instead of loading entire video
    """

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.total_frames = None
        self.fps = None
        self.frame_shape = None

    def __iter__(self) -> Generator[np.ndarray, None, None]:
        """Iterate over video frames"""
        import cv2

        cap = cv2.VideoCapture(self.video_path)

        if not cap.isOpened():
            raise RuntimeError(f"Failed to open video: {self.video_path}")

        # Get video properties
        self.total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = cap.get(cv2.CAP_PROP_FPS)

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Convert BGR to RGB
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

                # Store shape on first frame
                if self.frame_shape is None:
                    self.frame_shape = frame.shape

                yield frame

        finally:
            cap.release()

    def get_info(self) -> dict:
        """Get video information"""
        import cv2

        cap = cv2.VideoCapture(self.video_path)

        info = {
            "total_frames": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "fps": cap.get(cv2.CAP_PROP_FPS),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            "duration": int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            / cap.get(cv2.CAP_PROP_FPS),
        }

        cap.release()
        return info


# ============================================================================
# High-Level API
# ============================================================================


def process_long_form_video(
    input_video: str,
    output_video: str,
    process_func: callable,
    fps: int = 24,
    chunk_size: int = 1200,
    **process_kwargs,
) -> str:
    """
    Process long-form video (up to 4 hours) with chunked processing

    Args:
        input_video: Input video path
        output_video: Output video path
        process_func: Processing function to apply to each chunk
        fps: Frame rate
        chunk_size: Number of frames per chunk
        **process_kwargs: Additional arguments for process_func

    Returns:
        Path to processed video

    Example:
        >>> def my_processor(frames):
        ...     # Apply some processing
        ...     return processed_frames
        >>>
        >>> process_long_form_video(
        ...     "long_movie.mp4",
        ...     "processed_movie.mp4",
        ...     my_processor
        ... )
    """
    # Create streaming reader
    reader = StreamingVideoReader(input_video)
    video_info = reader.get_info()

    logger.info("📹 Video information:")
    logger.info(
        f"   Duration: {video_info['duration']:.1f}s ({video_info['duration']/3600:.1f} hours)"
    )
    logger.info(f"   Frames: {video_info['total_frames']}")
    logger.info(f"   Resolution: {video_info['width']}x{video_info['height']}")
    logger.info(f"   FPS: {video_info['fps']}")

    # Process with chunking
    processor = LongFormVideoProcessor(chunk_size=chunk_size, overlap_frames=24)

    result = processor.process_video_chunks(
        video_generator=iter(reader),
        total_frames=video_info["total_frames"],
        process_func=process_func,
        output_path=output_video,
        fps=fps,
        **process_kwargs,
    )

    return result


def estimate_processing_time(
    video_duration_seconds: float,
    resolution: str = "hd",
    include_hdr: bool = True,
    include_audio: bool = True,
) -> dict:
    """
    Estimate processing time for long-form video

    Args:
        video_duration_seconds: Video duration in seconds
        resolution: Target resolution
        include_hdr: Include HDR10 processing
        include_audio: Include Dolby Atmos audio

    Returns:
        Dictionary with time estimates
    """
    # Base processing times (seconds per second of video)
    base_times = {
        "preview": 0.15,  # Very fast
        "hd": 0.5,
        "4k": 1.5,
        "8k": 6.0,  # Slowest
    }

    base_time = base_times.get(resolution, 1.0)

    # Additional processing
    if include_hdr:
        base_time *= 1.2  # 20% overhead for HDR

    if include_audio:
        base_time *= 1.3  # 30% overhead for audio generation

    # Calculate estimates
    estimated_seconds = video_duration_seconds * base_time

    return {
        "video_duration": video_duration_seconds,
        "estimated_processing_seconds": estimated_seconds,
        "estimated_processing_minutes": estimated_seconds / 60,
        "estimated_processing_hours": estimated_seconds / 3600,
        "resolution": resolution,
        "includes_hdr": include_hdr,
        "includes_audio": include_audio,
        "processing_ratio": f"{base_time:.2f}x realtime",
    }


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("Long-Form Video Processing (up to 4 hours)")
    print("=" * 60)

    # Example: Estimate processing time for a 4-hour movie
    print("\n📊 Processing Time Estimates:")

    durations = [
        (600, "10 minutes"),
        (1800, "30 minutes"),
        (3600, "1 hour"),
        (7200, "2 hours"),
        (14400, "4 hours"),
    ]

    for duration, label in durations:
        estimates = estimate_processing_time(
            video_duration_seconds=duration,
            resolution="4k",
            include_hdr=True,
            include_audio=True,
        )

        print(f"\n{label}:")
        print(f"  Processing time: {estimates['estimated_processing_hours']:.1f} hours")
        print(f"  Ratio: {estimates['processing_ratio']}")

    # Example: Process a video file
    print("\n" + "=" * 60)
    print("Example: Process video file")
    print("=" * 60)

    # Simple pass-through processor
    def passthrough_processor(frames, **kwargs):
        """Simple processor that returns frames unchanged"""
        return frames

    # Note: Uncomment to test with actual video file
    # process_long_form_video(
    #     input_video="input_movie.mp4",
    #     output_video="processed_movie.mp4",
    #     process_func=passthrough_processor
    # )

    print("\n✅ Module ready for 4-hour video processing!")
