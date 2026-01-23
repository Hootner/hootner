"""
HDR10 Processing and 8K UHD Support
10-bit color, Rec.2020 color space, PQ transfer function

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Optional, Tuple
import cv2


class HDR10Processor:
    """
    HDR10 video processing

    Features:
    - 10-bit color depth (1024 levels per channel)
    - Rec.2020 wide color gamut
    - PQ (Perceptual Quantizer) transfer function
    - HDR10 metadata injection
    - Tone mapping for SDR displays
    """

    def __init__(
        self, max_nits: int = 1000, min_nits: float = 0.005, bit_depth: int = 10
    ):
        self.max_nits = max_nits
        self.min_nits = min_nits
        self.bit_depth = bit_depth
        self.max_value = (2**bit_depth) - 1

        # Rec.2020 color primaries
        self.rec2020_primaries = {
            "red": (0.708, 0.292),
            "green": (0.170, 0.797),
            "blue": (0.131, 0.046),
            "white": (0.3127, 0.3290),
        }

    def linear_to_pq(self, linear: np.ndarray) -> np.ndarray:
        """
        Convert linear light to PQ (Perceptual Quantizer) curve
        SMPTE ST 2084

        Args:
            linear: Linear light values (0.0-1.0)

        Returns:
            PQ encoded values (0.0-1.0)
        """
        # Normalize to peak luminance
        linear = linear * (self.max_nits / 10000.0)

        # PQ constants
        m1 = 2610 / 16384
        m2 = 2523 / 4096 * 128
        c1 = 3424 / 4096
        c2 = 2413 / 4096 * 32
        c3 = 2392 / 4096 * 32

        # Apply PQ curve
        linear_pow = np.power(np.clip(linear, 0, 1), m1)
        pq = np.power((c1 + c2 * linear_pow) / (1 + c3 * linear_pow), m2)

        return pq

    def pq_to_linear(self, pq: np.ndarray) -> np.ndarray:
        """
        Convert PQ curve to linear light

        Args:
            pq: PQ encoded values (0.0-1.0)

        Returns:
            Linear light values
        """
        # PQ constants
        m1 = 2610 / 16384
        m2 = 2523 / 4096 * 128
        c1 = 3424 / 4096
        c2 = 2413 / 4096 * 32
        c3 = 2392 / 4096 * 32

        # Inverse PQ
        pq_pow = np.power(np.clip(pq, 0, 1), 1 / m2)
        linear = np.power(np.maximum((pq_pow - c1) / (c2 - c3 * pq_pow), 0), 1 / m1)

        # Denormalize from peak luminance
        linear = linear * (10000.0 / self.max_nits)

        return linear

    def srgb_to_rec2020(self, video: np.ndarray) -> np.ndarray:
        """
        Convert sRGB to Rec.2020 color space

        Args:
            video: (T, H, W, 3) in sRGB

        Returns:
            Video in Rec.2020 color space
        """
        # Conversion matrix from sRGB to Rec.2020
        matrix = np.array(
            [
                [0.627404, 0.329283, 0.043313],
                [0.069097, 0.919541, 0.011362],
                [0.016392, 0.088028, 0.895580],
            ]
        )

        # Apply matrix to each frame
        T, H, W, C = video.shape
        video_flat = video.reshape(-1, 3)
        result_flat = video_flat @ matrix.T
        result = result_flat.reshape(T, H, W, C)

        return np.clip(result, 0, 1)

    def rec2020_to_srgb(self, video: np.ndarray) -> np.ndarray:
        """
        Convert Rec.2020 to sRGB color space

        Args:
            video: (T, H, W, 3) in Rec.2020

        Returns:
            Video in sRGB color space
        """
        # Inverse matrix from Rec.2020 to sRGB
        matrix = np.array(
            [
                [1.660496, -0.587656, -0.072840],
                [-0.124547, 1.132895, -0.008348],
                [-0.018154, -0.100597, 1.118751],
            ]
        )

        T, H, W, C = video.shape
        video_flat = video.reshape(-1, 3)
        result_flat = video_flat @ matrix.T
        result = result_flat.reshape(T, H, W, C)

        return np.clip(result, 0, 1)

    def encode_10bit(self, video: np.ndarray) -> np.ndarray:
        """
        Encode to 10-bit color depth

        Args:
            video: (T, H, W, 3) float32 in [0, 1]

        Returns:
            10-bit encoded video uint16
        """
        # Quantize to 10-bit
        video_10bit = (video * self.max_value).astype(np.uint16)

        return video_10bit

    def decode_10bit(self, video: np.ndarray) -> np.ndarray:
        """
        Decode from 10-bit to float

        Args:
            video: 10-bit encoded uint16

        Returns:
            Float video in [0, 1]
        """
        return video.astype(np.float32) / self.max_value

    def apply_hdr10_grading(self, video: np.ndarray) -> np.ndarray:
        """
        Apply HDR10 color grading

        Args:
            video: SDR video (0-1)

        Returns:
            HDR10 graded video
        """
        # Expand dynamic range
        video = np.power(video, 0.45)  # Gamma expansion for HDR

        # Enhance highlights
        highlights = video > 0.5
        video[highlights] = 0.5 + (video[highlights] - 0.5) * 1.5

        # Preserve shadows
        shadows = video < 0.2
        video[shadows] = video[shadows] * 0.8

        # Convert to Rec.2020
        video = self.srgb_to_rec2020(video)

        # Apply PQ curve
        video = self.linear_to_pq(video)

        return video

    def tone_map_to_sdr(
        self, hdr_video: np.ndarray, method: str = "reinhard"
    ) -> np.ndarray:
        """
        Tone map HDR video to SDR for standard displays

        Args:
            hdr_video: HDR video with PQ curve
            method: Tone mapping method ('reinhard', 'hable', 'aces')

        Returns:
            SDR video
        """
        # Convert PQ to linear
        linear = self.pq_to_linear(hdr_video)

        if method == "reinhard":
            # Reinhard tone mapping
            sdr = linear / (1 + linear)

        elif method == "hable":
            # Uncharted 2 tone mapping (Hable)
            def hable_curve(x):
                A = 0.15
                B = 0.50
                C = 0.10
                D = 0.20
                E = 0.02
                F = 0.30
                return (
                    (x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)
                ) - E / F

            exposure_bias = 2.0
            linear *= exposure_bias
            sdr = hable_curve(linear) / hable_curve(11.2)

        elif method == "aces":
            # ACES filmic tone mapping
            a = 2.51
            b = 0.03
            c = 2.43
            d = 0.59
            e = 0.14
            sdr = np.clip(
                (linear * (a * linear + b)) / (linear * (c * linear + d) + e), 0, 1
            )

        else:
            # Simple clamp
            sdr = np.clip(linear, 0, 1)

        # Convert back to sRGB
        sdr = self.rec2020_to_srgb(sdr)

        # Apply sRGB gamma
        sdr = np.power(np.clip(sdr, 0, 1), 1 / 2.2)

        return sdr

    def generate_hdr10_metadata(self) -> dict:
        """
        Generate HDR10 static metadata

        Returns:
            HDR10 metadata dictionary
        """
        # Convert CIE xy to display mastering metadata
        # Format: G(x,y)B(x,y)R(x,y)WP(x,y)L(max,min)

        def xy_to_chromaticity(x, y):
            """Convert CIE xy to chromaticity coordinates (scaled by 50000)"""
            return int(x * 50000), int(y * 50000)

        r = xy_to_chromaticity(*self.rec2020_primaries["red"])
        g = xy_to_chromaticity(*self.rec2020_primaries["green"])
        b = xy_to_chromaticity(*self.rec2020_primaries["blue"])
        wp = xy_to_chromaticity(*self.rec2020_primaries["white"])

        metadata = {
            "red_primary": r,
            "green_primary": g,
            "blue_primary": b,
            "white_point": wp,
            "max_luminance": self.max_nits * 10000,  # in units of 0.0001 cd/m²
            "min_luminance": int(self.min_nits * 10000),
            "max_cll": self.max_nits,  # MaxCLL (Maximum Content Light Level)
            "max_fall": int(
                self.max_nits * 0.75
            ),  # MaxFALL (Maximum Frame Average Light Level)
            "master_display": f"G({g[0]},{g[1]})B({b[0]},{b[1]})R({r[0]},{r[1]})WP({wp[0]},{wp[1]})L({self.max_nits*10000},{int(self.min_nits*10000)})",
        }

        return metadata


class UHD8KUpscaler:
    """
    AI-powered upscaling to 8K UHD (7680×4320)

    Methods:
    - ESRGAN (Enhanced Super-Resolution GAN)
    - Lanczos interpolation
    - Bicubic interpolation
    """

    def __init__(self, method: str = "esrgan"):
        self.method = method

    def upscale(
        self, video: np.ndarray, target_height: int = 4320, target_width: int = 7680
    ) -> np.ndarray:
        """
        Upscale video to 8K UHD

        Args:
            video: (T, H, W, C) input video
            target_height: Target height (4320 for 8K)
            target_width: Target width (7680 for 8K)

        Returns:
            Upscaled video
        """
        if self.method == "esrgan":
            return self._upscale_esrgan(video, target_height, target_width)
        elif self.method == "lanczos":
            return self._upscale_lanczos(video, target_height, target_width)
        else:
            return self._upscale_bicubic(video, target_height, target_width)

    def _upscale_esrgan(
        self, video: np.ndarray, target_height: int, target_width: int
    ) -> np.ndarray:
        """
        ESRGAN upscaling (placeholder - requires trained model)
        Falls back to Lanczos if model not available
        """
        # TODO: Implement ESRGAN model
        # For now, use high-quality Lanczos
        print("⚠️  ESRGAN model not available, using Lanczos interpolation")
        return self._upscale_lanczos(video, target_height, target_width)

    def _upscale_lanczos(
        self, video: np.ndarray, target_height: int, target_width: int
    ) -> np.ndarray:
        """Lanczos interpolation upscaling"""
        result = []

        for frame in video:
            upscaled = cv2.resize(
                frame, (target_width, target_height), interpolation=cv2.INTER_LANCZOS4
            )
            result.append(upscaled)

        return np.array(result)

    def _upscale_bicubic(
        self, video: np.ndarray, target_height: int, target_width: int
    ) -> np.ndarray:
        """Bicubic interpolation upscaling"""
        result = []

        for frame in video:
            upscaled = cv2.resize(
                frame, (target_width, target_height), interpolation=cv2.INTER_CUBIC
            )
            result.append(upscaled)

        return np.array(result)


# ============================================================================
# Utility Functions
# ============================================================================


def convert_to_hdr10(
    video: np.ndarray, max_nits: int = 1000, apply_grading: bool = True
) -> Tuple[np.ndarray, dict]:
    """
    Convert SDR video to HDR10

    Args:
        video: SDR video (8-bit RGB, 0-255)
        max_nits: Peak brightness
        apply_grading: Apply HDR color grading

    Returns:
        Tuple of (HDR10 video, metadata)
    """
    processor = HDR10Processor(max_nits=max_nits)

    # Normalize to [0, 1]
    video_normalized = video.astype(np.float32) / 255.0

    # Apply HDR10 grading if requested
    if apply_grading:
        hdr_video = processor.apply_hdr10_grading(video_normalized)
    else:
        # Simple conversion
        hdr_video = processor.srgb_to_rec2020(video_normalized)
        hdr_video = processor.linear_to_pq(hdr_video)

    # Encode to 10-bit
    hdr_video_10bit = processor.encode_10bit(hdr_video)

    # Generate metadata
    metadata = processor.generate_hdr10_metadata()

    return hdr_video_10bit, metadata


def upscale_to_8k(video: np.ndarray, method: str = "lanczos") -> np.ndarray:
    """
    Upscale video to 8K UHD (7680×4320)

    Args:
        video: Input video
        method: Upscaling method

    Returns:
        8K upscaled video
    """
    upscaler = UHD8KUpscaler(method=method)
    return upscaler.upscale(video)


def save_hdr10_video(
    video: np.ndarray, output_path: str, metadata: dict, fps: int = 24
):
    """
    Save HDR10 video with metadata

    Args:
        video: HDR10 video (10-bit)
        output_path: Output file path
        metadata: HDR10 metadata
        fps: Frame rate
    """
    import subprocess
    import tempfile
    import os

    # Save frames to temporary directory
    temp_dir = tempfile.mkdtemp()

    for i, frame in enumerate(video):
        frame_path = os.path.join(temp_dir, f"frame_{i:06d}.png")
        # Convert 10-bit to 16-bit PNG
        frame_16bit = (frame.astype(np.uint32) << 6).astype(np.uint16)
        cv2.imwrite(frame_path, frame_16bit)

    # Build FFmpeg command with HDR10 metadata
    cmd = [
        "ffmpeg",
        "-framerate",
        str(fps),
        "-i",
        os.path.join(temp_dir, "frame_%06d.png"),
        "-c:v",
        "libx265",
        "-preset",
        "slow",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p10le",  # 10-bit YUV
        "-colorspace",
        "bt2020nc",
        "-color_primaries",
        "bt2020",
        "-color_trc",
        "smpte2084",  # PQ transfer
        "-x265-params",
        f"hdr-opt=1:repeat-headers=1:colorprim=bt2020:transfer=smpte2084:colormatrix=bt2020nc:"
        f'master-display={metadata["master_display"]}:'
        f'max-cll={metadata["max_cll"]},{metadata["max_fall"]}',
        "-y",
        output_path,
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✅ HDR10 video saved: {output_path}")
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg error: {e.stderr.decode()}")
        raise
    finally:
        # Cleanup temp files
        import shutil

        shutil.rmtree(temp_dir)


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    # Example: Convert SDR video to HDR10
    print("HDR10 Processing Example")

    # Create dummy SDR video
    dummy_video = np.random.randint(0, 256, (24, 256, 256, 3), dtype=np.uint8)

    # Convert to HDR10
    hdr_video, metadata = convert_to_hdr10(dummy_video, max_nits=1000)

    print(f"HDR10 video shape: {hdr_video.shape}")
    print(f"HDR10 metadata: {metadata}")

    # Upscale to 8K
    upscaled = upscale_to_8k(hdr_video.astype(np.uint8))
    print(f"8K upscaled shape: {upscaled.shape}")
