"""
Advanced Video Effects and Post-Processing
Filters, transitions, color correction, and motion effects

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Optional, Tuple, List
from PIL import Image, ImageEnhance, ImageFilter
import cv2


class VideoEffects:
    """
    Comprehensive video effects and post-processing
    
    Features:
    - Color grading and correction
    - Artistic filters
    - Smooth transitions
    - Motion effects (zoom, pan, rotate)
    - Temporal smoothing
    - Stabilization
    """
    
    def __init__(self, device: str = "cpu"):
        self.device = device
    
    # ========================================================================
    # Color Grading & Correction
    # ========================================================================
    
    def adjust_brightness(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """
        Adjust video brightness
        
        Args:
            video: (T, H, W, C) numpy array
            factor: Brightness factor (1.0 = no change)
        """
        return np.clip(video * factor, 0, 255).astype(np.uint8)
    
    def adjust_contrast(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """Adjust video contrast"""
        mean = video.mean(axis=(1, 2), keepdims=True)
        return np.clip((video - mean) * factor + mean, 0, 255).astype(np.uint8)
    
    def adjust_saturation(self, video: np.ndarray, factor: float = 1.2) -> np.ndarray:
        """Adjust color saturation"""
        # Convert to HSV
        video_hsv = np.array([cv2.cvtColor(frame, cv2.COLOR_RGB2HSV) for frame in video])
        video_hsv[:, :, :, 1] = np.clip(video_hsv[:, :, :, 1] * factor, 0, 255)
        
        # Convert back to RGB
        return np.array([cv2.cvtColor(frame, cv2.COLOR_HSV2RGB) for frame in video_hsv])
    
    def color_temperature(self, video: np.ndarray, temperature: int = 0) -> np.ndarray:
        """
        Adjust color temperature
        
        Args:
            temperature: -100 (cooler/blue) to +100 (warmer/orange)
        """
        result = video.copy().astype(np.float32)
        
        if temperature > 0:  # Warmer
            result[:, :, :, 0] += temperature * 0.5  # Red
            result[:, :, :, 2] -= temperature * 0.3  # Blue
        else:  # Cooler
            result[:, :, :, 0] += temperature * 0.3  # Red
            result[:, :, :, 2] -= temperature * 0.5  # Blue
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def apply_lut(self, video: np.ndarray, lut_name: str = "cinematic") -> np.ndarray:
        """
        Apply color lookup table (LUT)
        
        Preset LUTs:
        - cinematic: Film-like colors
        - vintage: Retro/faded look
        - vivid: Enhanced colors
        - noir: Black and white with contrast
        """
        if lut_name == "cinematic":
            # Reduce saturation slightly, add warm tones
            video = self.adjust_saturation(video, 0.85)
            video = self.color_temperature(video, 20)
            video = self.adjust_contrast(video, 1.1)
        
        elif lut_name == "vintage":
            # Faded colors, warm yellow tint
            video = self.adjust_saturation(video, 0.7)
            video = self.color_temperature(video, 40)
            video = self.adjust_contrast(video, 0.9)
            # Add vignette
            video = self.vignette(video, strength=0.3)
        
        elif lut_name == "vivid":
            # Enhanced saturation and contrast
            video = self.adjust_saturation(video, 1.3)
            video = self.adjust_contrast(video, 1.2)
        
        elif lut_name == "noir":
            # Convert to grayscale with high contrast
            video = np.array([cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) for frame in video])
            video = np.stack([video] * 3, axis=-1)
            video = self.adjust_contrast(video, 1.4)
        
        return video
    
    # ========================================================================
    # Artistic Filters
    # ========================================================================
    
    def blur(self, video: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """Apply Gaussian blur"""
        return np.array([
            cv2.GaussianBlur(frame, (kernel_size, kernel_size), 0)
            for frame in video
        ])
    
    def sharpen(self, video: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """Sharpen video frames"""
        kernel = np.array([
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ]) * strength
        
        result = []
        for frame in video:
            sharpened = cv2.filter2D(frame, -1, kernel)
            result.append(sharpened)
        
        return np.array(result)
    
    def edge_enhance(self, video: np.ndarray, strength: float = 1.0) -> np.ndarray:
        """Enhance edges in video"""
        result = []
        for frame in video:
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2RGB)
            
            enhanced = cv2.addWeighted(frame, 1.0, edges, strength, 0)
            result.append(enhanced)
        
        return np.array(result)
    
    def vignette(self, video: np.ndarray, strength: float = 0.5) -> np.ndarray:
        """Add vignette effect"""
        T, H, W, C = video.shape
        
        # Create radial gradient mask
        Y, X = np.ogrid[:H, :W]
        center_y, center_x = H // 2, W // 2
        dist = np.sqrt((X - center_x)**2 + (Y - center_y)**2)
        max_dist = np.sqrt(center_x**2 + center_y**2)
        
        mask = 1 - (dist / max_dist) * strength
        mask = np.clip(mask, 0, 1)
        mask = mask[:, :, np.newaxis]  # Add channel dimension
        
        return (video * mask).astype(np.uint8)
    
    def posterize(self, video: np.ndarray, levels: int = 4) -> np.ndarray:
        """Reduce color levels (posterization effect)"""
        factor = 256 // levels
        return (video // factor * factor).astype(np.uint8)
    
    # ========================================================================
    # Transitions
    # ========================================================================
    
    def fade_in(self, video: np.ndarray, duration: int = 8) -> np.ndarray:
        """Fade in from black"""
        result = video.copy().astype(np.float32)
        fade_frames = min(duration, len(video))
        
        for i in range(fade_frames):
            alpha = i / fade_frames
            result[i] = result[i] * alpha
        
        return result.astype(np.uint8)
    
    def fade_out(self, video: np.ndarray, duration: int = 8) -> np.ndarray:
        """Fade out to black"""
        result = video.copy().astype(np.float32)
        fade_frames = min(duration, len(video))
        start_frame = len(video) - fade_frames
        
        for i in range(fade_frames):
            alpha = 1 - (i / fade_frames)
            result[start_frame + i] = result[start_frame + i] * alpha
        
        return result.astype(np.uint8)
    
    def crossfade(self, video1: np.ndarray, video2: np.ndarray, duration: int = 8) -> np.ndarray:
        """Crossfade between two videos"""
        # Ensure videos have compatible dimensions
        min_len = min(len(video1), len(video2))
        video1 = video1[:min_len]
        video2 = video2[:min_len]
        
        if video1.shape[1:] != video2.shape[1:]:
            raise ValueError("Videos must have same dimensions")
        
        result = []
        fade_frames = min(duration, min_len)
        
        for i in range(min_len):
            if i < fade_frames:
                alpha = i / fade_frames
                frame = video1[i] * (1 - alpha) + video2[i] * alpha
            else:
                frame = video2[i]
            
            result.append(frame.astype(np.uint8))
        
        return np.array(result)
    
    # ========================================================================
    # Motion Effects
    # ========================================================================
    
    def zoom(self, video: np.ndarray, start_scale: float = 1.0, end_scale: float = 1.5) -> np.ndarray:
        """Apply zoom effect"""
        T, H, W, C = video.shape
        result = []
        
        for i, frame in enumerate(video):
            progress = i / (T - 1) if T > 1 else 0
            scale = start_scale + (end_scale - start_scale) * progress
            
            # Calculate crop dimensions
            crop_h = int(H / scale)
            crop_w = int(W / scale)
            start_y = (H - crop_h) // 2
            start_x = (W - crop_w) // 2
            
            # Crop and resize
            cropped = frame[start_y:start_y+crop_h, start_x:start_x+crop_w]
            zoomed = cv2.resize(cropped, (W, H), interpolation=cv2.INTER_LINEAR)
            
            result.append(zoomed)
        
        return np.array(result)
    
    def pan(self, video: np.ndarray, direction: str = "right", distance: float = 0.2) -> np.ndarray:
        """
        Apply pan effect
        
        Args:
            direction: 'left', 'right', 'up', or 'down'
            distance: Pan distance as fraction of dimension (0.0-1.0)
        """
        T, H, W, C = video.shape
        result = []
        
        for i, frame in enumerate(video):
            progress = i / (T - 1) if T > 1 else 0
            
            if direction == "right":
                shift_x = int(W * distance * progress)
                M = np.float32([[1, 0, shift_x], [0, 1, 0]])
            elif direction == "left":
                shift_x = int(W * distance * progress)
                M = np.float32([[1, 0, -shift_x], [0, 1, 0]])
            elif direction == "down":
                shift_y = int(H * distance * progress)
                M = np.float32([[1, 0, 0], [0, 1, shift_y]])
            elif direction == "up":
                shift_y = int(H * distance * progress)
                M = np.float32([[1, 0, 0], [0, 1, -shift_y]])
            else:
                raise ValueError(f"Unknown direction: {direction}")
            
            panned = cv2.warpAffine(frame, M, (W, H), borderMode=cv2.BORDER_REPLICATE)
            result.append(panned)
        
        return np.array(result)
    
    def rotate(self, video: np.ndarray, start_angle: float = 0, end_angle: float = 45) -> np.ndarray:
        """Apply rotation effect"""
        T, H, W, C = video.shape
        result = []
        center = (W // 2, H // 2)
        
        for i, frame in enumerate(video):
            progress = i / (T - 1) if T > 1 else 0
            angle = start_angle + (end_angle - start_angle) * progress
            
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(frame, M, (W, H), borderMode=cv2.BORDER_REPLICATE)
            
            result.append(rotated)
        
        return np.array(result)
    
    # ========================================================================
    # Temporal Effects
    # ========================================================================
    
    def temporal_smooth(self, video: np.ndarray, window: int = 3) -> np.ndarray:
        """Smooth video temporally (reduce flicker)"""
        T, H, W, C = video.shape
        result = video.copy().astype(np.float32)
        
        half_window = window // 2
        
        for i in range(T):
            start = max(0, i - half_window)
            end = min(T, i + half_window + 1)
            result[i] = video[start:end].mean(axis=0)
        
        return result.astype(np.uint8)
    
    def slow_motion(self, video: np.ndarray, factor: float = 2.0) -> np.ndarray:
        """Create slow motion effect by interpolating frames"""
        T, H, W, C = video.shape
        new_length = int(T * factor)
        result = []
        
        for i in range(new_length):
            # Calculate source frame position
            src_pos = i / factor
            frame_idx = int(src_pos)
            alpha = src_pos - frame_idx
            
            if frame_idx >= T - 1:
                result.append(video[-1])
            else:
                # Linear interpolation between frames
                interpolated = video[frame_idx] * (1 - alpha) + video[frame_idx + 1] * alpha
                result.append(interpolated.astype(np.uint8))
        
        return np.array(result)
    
    def reverse(self, video: np.ndarray) -> np.ndarray:
        """Reverse video playback"""
        return video[::-1]
    
    # ========================================================================
    # Stabilization
    # ========================================================================
    
    def stabilize(self, video: np.ndarray) -> np.ndarray:
        """
        Simple video stabilization using motion estimation
        Note: This is a basic implementation. For production use, consider
        more sophisticated methods or libraries like vid.stab
        """
        T, H, W, C = video.shape
        
        # Convert to grayscale for motion estimation
        gray_frames = [cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY) for frame in video]
        
        # Calculate optical flow between consecutive frames
        transforms = []
        for i in range(len(gray_frames) - 1):
            prev = gray_frames[i]
            curr = gray_frames[i + 1]
            
            # Detect features in previous frame
            prev_pts = cv2.goodFeaturesToTrack(prev, maxCorners=200, qualityLevel=0.01, minDistance=30)
            
            if prev_pts is not None:
                # Calculate optical flow
                curr_pts, status, _ = cv2.calcOpticalFlowPyrLK(prev, curr, prev_pts, None)
                
                # Filter good points
                idx = np.where(status == 1)[0]
                prev_pts = prev_pts[idx]
                curr_pts = curr_pts[idx]
                
                # Estimate transform
                if len(prev_pts) >= 4:
                    transform, _ = cv2.estimateAffinePartial2D(prev_pts, curr_pts)
                    transforms.append(transform)
                else:
                    transforms.append(np.eye(2, 3, dtype=np.float32))
            else:
                transforms.append(np.eye(2, 3, dtype=np.float32))
        
        # Apply stabilizing transforms
        stabilized = [video[0]]
        for i, transform in enumerate(transforms):
            stabilized_frame = cv2.warpAffine(video[i + 1], transform, (W, H), borderMode=cv2.BORDER_REPLICATE)
            stabilized.append(stabilized_frame)
        
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
        if preset == "cinematic":
            video = self.apply_lut(video, "cinematic")
            video = self.sharpen(video, 0.3)
            video = self.temporal_smooth(video, window=3)
        
        elif preset == "vintage":
            video = self.apply_lut(video, "vintage")
            video = self.vignette(video, 0.4)
            video = self.adjust_contrast(video, 0.9)
        
        elif preset == "dramatic":
            video = self.adjust_contrast(video, 1.3)
            video = self.adjust_saturation(video, 0.9)
            video = self.edge_enhance(video, 0.5)
            video = self.vignette(video, 0.3)
        
        elif preset == "dreamy":
            video = self.blur(video, kernel_size=3)
            video = self.adjust_brightness(video, 1.1)
            video = self.adjust_saturation(video, 0.8)
        
        elif preset == "vivid":
            video = self.apply_lut(video, "vivid")
            video = self.sharpen(video, 0.5)
        
        return video


# ============================================================================
# Utility Functions
# ============================================================================

def load_video_from_file(path: str) -> np.ndarray:
    """Load video from file as numpy array"""
    import imageio
    reader = imageio.get_reader(path)
    frames = [frame for frame in reader]
    return np.array(frames)

def save_video_to_file(video: np.ndarray, path: str, fps: int = 8):
    """Save video numpy array to file"""
    import imageio
    imageio.mimsave(path, video, fps=fps)

def apply_effects_pipeline(
    video: np.ndarray,
    effects: List[Tuple[str, dict]],
    device: str = "cpu"
) -> np.ndarray:
    """
    Apply a pipeline of effects to video
    
    Args:
        video: Input video array
        effects: List of (effect_name, kwargs) tuples
        device: Device to use
    
    Example:
        effects = [
            ("brightness", {"factor": 1.2}),
            ("contrast", {"factor": 1.1}),
            ("cinematic_lut", {}),
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
            print(f"Warning: Unknown effect '{effect_name}'")
    
    return result
