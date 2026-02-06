"""Advanced Video Effects and Post-Processing

Filters, transitions, color correction, and motion effects for video processing.

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import os
from typing import List, Tuple
import logging

import cv2  # type: ignore
import imageio  # type: ignore
import numpy as np


class VideoEffects:
    """Comprehensive video effects and post-processing toolkit"""

    def __init__(self, device: str = "cpu"):
        self.device = device

    # ========================================================================
    # Color Grading & Correction
    # ========================================================================

    def adjust_brightness(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """Adjust video brightness (1.0 = no change)"""
        return np.clip(video * factor, 0, 255).astype(np.uint8)

    def adjust_contrast(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """Adjust video contrast"""
        mean = video.mean(axis=(1, 2), keepdims=True)  # cSpell:ignore keepdims
        return np.clip((video - mean) * factor + mean, 0, 255).astype(np.uint8)

    def adjust_saturation(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """Adjust color saturation"""
        video_hsv = np.array([cv2.cvtColor(frame, cv2.COLOR_RGB2HSV) for frame in video])
        video_hsv[:, :, :, 1] = np.clip(video_hsv[:, :, :, 1] * factor, 0, 255)
        return np.array([cv2.cvtColor(frame, cv2.COLOR_HSV2RGB) for frame in video_hsv])

    def color_temperature(self, video: np.ndarray, temperature: int = 0) -> np.ndarray:
        """Adjust color temperature: -100 (cooler/blue) to +100 (warmer/orange)"""
        result = video.astype(np.float32)

        red_factor = 0.5 if temperature > 0 else 0.3
        blue_factor = -0.3 if temperature > 0 else -0.5

        result[:, :, :, 0] += temperature * red_factor
        result[:, :, :, 2] += temperature * blue_factor

        return np.clip(result, 0, 255).astype(np.uint8)

    def apply_lut(self, video: np.ndarray, lut_name: str = "cinematic") -> np.ndarray:
        """Apply color lookup table (LUT): cinematic, vintage, vivid, noir"""
        luts = {  # cSpell:ignore luts
            "cinematic": lambda v: self.adjust_contrast(
                self.color_temperature(self.adjust_saturation(v, 0.85), 20), 1.1
            ),
            "vintage": lambda v: self.vignette(
                self.adjust_contrast(self.color_temperature(self.adjust_saturation(v, 0.7), 40), 0.9), 0.3
            ),
            "vivid": lambda v: self.adjust_contrast(self.adjust_saturation(v, 1.3), 1.2),
            "noir": lambda v: self.adjust_contrast(
                np.stack([np.array([cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in v])] * 3, axis=-1), 1.4
            )
        }

        if lut_name not in luts:
            raise ValueError(f"Unknown LUT '{lut_name}'. Available: {list(luts.keys())}")

        return luts[lut_name](video)

    # ========================================================================
    # Artistic Filters
    # ========================================================================

    def blur(self, video: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """Apply Gaussian blur"""
        kernel_size = kernel_size if kernel_size % 2 == 1 else kernel_size + 1
        return np.array([cv2.GaussianBlur(frame, (kernel_size, kernel_size), 0) for frame in video])

    def sharpen(self, video: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """Sharpen video frames"""
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]) * strength
        return np.array([cv2.filter2D(frame, -1, kernel) for frame in video])

    def edge_enhance(self, video: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """Enhance edges in video"""
        def enhance_frame(frame):
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
            edges = cv2.cvtColor(cv2.Canny(gray, 50, 150), cv2.COLOR_GRAY2RGB)
            return cv2.addWeighted(frame, 1.0, edges, strength, 0)

        return np.array([enhance_frame(frame) for frame in video])

    def vignette(self, video: np.ndarray, strength: float = 0.5) -> np.ndarray:
        """Add vignette effect"""
        H, W = video.shape[1:3]
        Y, X = np.ogrid[:H, :W]  # cSpell:ignore ogrid
        center_y, center_x = H // 2, W // 2

        dist = np.sqrt((X - center_x) ** 2 + (Y - center_y) ** 2)
        mask = np.clip(1 - (dist / np.sqrt(center_x**2 + center_y**2)) * strength, 0, 1)

        return (video * mask[:, :, np.newaxis]).astype(np.uint8)  # cSpell:ignore newaxis

    def posterize(self, video: np.ndarray, levels: int = 4) -> np.ndarray:  # cSpell:ignore posterize
        """Reduce color levels (posterization effect)"""  # cSpell:ignore posterization
        if video.size == 0:
            raise ValueError("Input video is empty")
        if levels <= 0:
            raise ValueError("levels must be greater than 0")
        if levels > 256:
            raise ValueError("levels must be less than or equal to 256")

        factor = 256 // levels
        return (video // factor * factor).astype(np.uint8)

    # ========================================================================
    # Transitions
    # ========================================================================

    def fade_in(self, video: np.ndarray, duration: int = 8) -> np.ndarray:
        """Fade in from black"""
        fade_frames = min(duration, len(video))
        result = video.copy().astype(np.float32)

        alphas = np.linspace(0, 1, fade_frames).reshape(-1, 1, 1, 1)
        result[:fade_frames] *= alphas

        return result.astype(np.uint8)

    def fade_out(self, video: np.ndarray, duration: int = 8) -> np.ndarray:
        """Fade out to black"""
        fade_frames = min(duration, len(video))
        result = video.copy().astype(np.float32)
        start_frame = len(video) - fade_frames

        alphas = np.linspace(1, 0, fade_frames).reshape(-1, 1, 1, 1)
        result[start_frame:] *= alphas

        return result.astype(np.uint8)

    def crossfade(  # cSpell:ignore Crossfade
        self, video1: np.ndarray, video2: np.ndarray, duration: int = 8
    ) -> np.ndarray:
        """Crossfade between two videos"""
        min_len = min(len(video1), len(video2))

        if video1.shape[1:] != video2.shape[1:]:
            raise ValueError("Videos must have same dimensions")

        fade_frames = min(duration, min_len)
        alphas = np.linspace(0, 1, fade_frames).reshape(-1, 1, 1, 1)

        result = np.empty((min_len,) + video1.shape[1:], dtype=video1.dtype)
        result[:fade_frames] = ((1 - alphas) * video1[:fade_frames] + alphas * video2[:fade_frames]).astype(np.uint8)
        result[fade_frames:] = video2[fade_frames:]

        return result

    # ========================================================================
    # Motion Effects
    # ========================================================================

    def zoom(
        self, video: np.ndarray, start_scale: float = 1.0, end_scale: float = 1.5
    ) -> np.ndarray:
        """Apply zoom effect"""
        if len(video) == 0:
            return video

        T, H, W = video.shape[:3]

        def apply_zoom(i, frame):
            progress = i / (T - 1) if T > 1 else 0
            scale = np.clip(start_scale + (end_scale - start_scale) * progress, 0.1, 10.0)

            crop_h, crop_w = max(1, int(H / scale)), max(1, int(W / scale))
            start_y, start_x = (H - crop_h) // 2, (W - crop_w) // 2

            return cv2.resize(frame[start_y:start_y + crop_h, start_x:start_x + crop_w], (W, H))

        return np.array([apply_zoom(i, frame) for i, frame in enumerate(video)])

    def pan(self, video: np.ndarray, start_x: int = 0, end_x: int = 50) -> np.ndarray:
        """Apply pan effect"""
        if len(video) == 0:
            return video

        T, H, W, C = video.shape

        def apply_pan(i, frame):
            progress = i / (T - 1) if T > 1 else 0
            offset_x = int(start_x + (end_x - start_x) * progress)
            M = np.float32([[1, 0, offset_x], [0, 1, 0]])
            return cv2.warpAffine(frame, M, (W, H))

        return np.array([apply_pan(i, frame) for i, frame in enumerate(video)])

    def rotate(self, video: np.ndarray, start_angle: float = 0, end_angle: float = 10) -> np.ndarray:
        """Apply rotation effect"""
        if len(video) == 0:
            return video

        T, H, W, C = video.shape
        center = (W // 2, H // 2)

        def apply_rotation(i, frame):
            progress = i / (T - 1) if T > 1 else 0
            angle = start_angle + (end_angle - start_angle) * progress
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            return cv2.warpAffine(frame, M, (W, H))

        return np.array([apply_rotation(i, frame) for i, frame in enumerate(video)])

    def stabilize(self, video: np.ndarray) -> np.ndarray:
        """Basic video stabilization"""
        if len(video) < 2:
            return video

        def stabilize_frame(frame, prev_gray):
            curr_gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
            corners = cv2.goodFeaturesToTrack(prev_gray, maxCorners=200, qualityLevel=0.01, minDistance=30)

            if corners is None or len(corners) <= 10:
                return frame, curr_gray

            next_corners, status, _ = cv2.calcOpticalFlowPyrLK(prev_gray, curr_gray, corners, None)
            good_old, good_new = corners[status == 1], next_corners[status == 1]

            if len(good_old) <= 10:
                return frame, curr_gray

            transform_result = cv2.estimateAffinePartial2D(good_old, good_new)
            if transform_result is None or transform_result[0] is None:
                return frame, curr_gray

            return cv2.warpAffine(frame, transform_result[0], (frame.shape[1], frame.shape[0])), curr_gray

        result = np.empty((len(video),) + video.shape[1:], dtype=video.dtype)
        result[0] = video[0]
        prev_gray = cv2.cvtColor(video[0], cv2.COLOR_RGB2GRAY)

        for i, frame in enumerate(video[1:], 1):
            stabilized, prev_gray = stabilize_frame(frame, prev_gray)
            result[i] = stabilized

        return result

    # ========================================================================
    # Temporal Effects
    # ========================================================================

    def temporal_smooth(self, video: np.ndarray, window: int = 3) -> np.ndarray:
        """Smooth video temporally (reduce flicker)"""
        T = len(video)
        half_window = window // 2

        result = np.array([
            video[max(0, i - half_window):min(T, i + half_window + 1)].mean(axis=0)
            for i in range(T)
        ], dtype=np.uint8)

        return result

    def slow_motion(self, video: np.ndarray, factor: float = 2.0) -> np.ndarray:
        """Create slow motion effect by interpolating frames"""
        T = len(video)
        new_length = int(T * factor)

        def interpolate_frame(i):
            src_pos = i / factor
            frame_idx = int(src_pos)

            if frame_idx >= T - 1:
                return video[-1]

            alpha = src_pos - frame_idx
            return ((1 - alpha) * video[frame_idx] + alpha * video[frame_idx + 1]).astype(np.uint8)

        return np.array([interpolate_frame(i) for i in range(new_length)])

    def reverse(self, video: np.ndarray) -> np.ndarray:
        """Reverse video playback"""
        return video[::-1]

    # ========================================================================
    # Advanced Stabilization
    # ========================================================================

    def advanced_stabilize(self, video: np.ndarray) -> np.ndarray:
        """
        Advanced video stabilization using motion estimation
        Note: This is a basic implementation. For production use, consider
        more sophisticated methods or libraries like vid.stab
        """
        T, H, W, C = video.shape
        gray_frames = [cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) for frame in video]
        identity = np.eye(2, 3, dtype=np.float32)

        def estimate_transform(prev, curr):
            """Estimate affine transform between frames or return identity"""
            prev_pts = cv2.goodFeaturesToTrack(prev, maxCorners=200, qualityLevel=0.01, minDistance=30)

            if prev_pts is None or len(prev_pts) < 4:
                return identity

            curr_pts, status, _ = cv2.calcOpticalFlowPyrLK(prev, curr, prev_pts, None)
            good_prev = prev_pts[status == 1]
            good_curr = curr_pts[status == 1]

            if len(good_prev) < 4:
                return identity

            result = cv2.estimateAffinePartial2D(good_prev, good_curr)
            return result[0] if result is not None and result[0] is not None else np.eye(2, 3, dtype=np.float32)

        transforms = [estimate_transform(gray_frames[i], gray_frames[i + 1])
                      for i in range(len(gray_frames) - 1)]

        stabilized = [video[0]]
        for i in range(len(transforms)):
            stabilized.append(cv2.warpAffine(video[i + 1], transforms[i], (W, H), borderMode=cv2.BORDER_REPLICATE))

        return np.array(stabilized)

    # ========================================================================
    # Composite Effects
    # ========================================================================

    def apply_preset(self, video: np.ndarray, preset: str = "cinematic") -> np.ndarray:
        """
        Apply preset effect combination

        Presets:
        - cinematic: Film-like with subtle effects
        - vintage: Retro look with vignette
        - dramatic: High contrast with enhanced edges
        - dreamy: Soft and ethereal
        - vivid: Bright and saturated
        """
        presets = {
            "cinematic": [
                (self.apply_lut, ("cinematic",)),
                (self.sharpen, (0.3,)),
                (self.temporal_smooth, (), {"window": 3})
            ],
            "vintage": [
                (self.apply_lut, ("vintage",)),
                (self.vignette, (0.4,)),
                (self.adjust_contrast, (0.9,))
            ],
            "dramatic": [
                (self.adjust_contrast, (1.3,)),
                (self.adjust_saturation, (0.9,)),
                (self.edge_enhance, (0.5,)),
                (self.vignette, (0.3,))
            ],
            "dreamy": [
                (self.blur, (), {"kernel_size": 3}),
                (self.adjust_brightness, (1.1,)),
                (self.adjust_saturation, (0.8,))
            ],
            "vivid": [
                (self.apply_lut, ("vivid",)),
                (self.sharpen, (0.5,))
            ]
        }

        if preset not in presets:
            raise ValueError(f"Unknown preset '{preset}'. Available: {list(presets.keys())}")

        for effect in presets[preset]:
            func, args = effect[0], effect[1] if len(effect) > 1 else ()
            kwargs = effect[2] if len(effect) > 2 else {}
            video = func(video, *args, **kwargs)

        return video


# ============================================================================
# Utility Functions
# ============================================================================


def load_video_from_file(path: str) -> np.ndarray:
    """Load video from file as numpy array"""
    if not path:
        raise ValueError("Path cannot be empty")

    if not os.path.exists(path):
        raise FileNotFoundError(f"Video file not found: {path}")

    if not os.path.isfile(path):
        raise ValueError(f"Path is not a file: {path}")

    try:
        with imageio.get_reader(path) as reader:
            frames = np.array([frame for frame in reader])

        if frames.size == 0:
            raise ValueError(f"No frames loaded from {path}")

        return frames
    except (IOError, OSError, ValueError) as e:
        raise IOError(f"Failed to load video from {path}: {e}") from e
    except Exception as e:
        raise IOError(f"Unexpected error loading video from {path}: {e}") from e


def save_video_to_file(video: np.ndarray, path: str, fps: int = 8):
    """Save video numpy array to file"""
    if video.ndim != 4 or video.shape[0] == 0:
        raise ValueError(f"Invalid video shape: {video.shape}. Expected (T, H, W, C)")

    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)

    try:
        imageio.mimsave(path, video, fps=fps)  # cSpell:ignore mimsave
    except Exception as e:
        raise IOError(f"Failed to save video to {path}: {e}")


def apply_effects_pipeline(
    video: np.ndarray, effects: List[Tuple[str, dict]], device: str = "cpu"
) -> np.ndarray:
    """
    Apply a pipeline of effects to video

    Args:
        video: Input video array
        effects: List of (effect_name, kwargs) tuples
        device: Device to use

    Example::

        effects = [
            ("adjust_brightness", {"factor": 1.2}),
            ("adjust_contrast", {"factor": 1.1}),
            ("apply_lut", {"lut_name": "cinematic"}),
            ("sharpen", {"strength": 0.5})
        ]
    """
    processor = VideoEffects(device=device)
    result = video

    for effect_name, kwargs in effects:
        method = getattr(processor, effect_name, None)
        if method:
            result = method(result, **kwargs)
        else:
            logging.warning(f"Unknown effect '{effect_name}'")

    return result
