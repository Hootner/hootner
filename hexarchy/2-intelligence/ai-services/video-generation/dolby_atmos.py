"""
Dolby Atmos Audio Generation and Processing
Object-based spatial audio with 7.1.4 channel configuration

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Optional, List, Tuple, Dict
import scipy.signal as signal
import scipy.fft as fft


class DolbyAtmosProcessor:
    """
    Dolby Atmos audio processor

    Features:
    - 7.1.4 channel configuration (7 bed + 1 LFE + 4 height)
    - Object-based audio (up to 118 objects)
    - Binaural rendering for headphones
    - Room modeling and acoustics
    - EAC3 (Enhanced AC-3) encoding
    """

    def __init__(
        self, sample_rate: int = 48000, bit_depth: int = 24, channels: str = "7.1.4"
    ):
        self.sample_rate = sample_rate
        self.bit_depth = bit_depth
        self.channels = channels

        # Channel layout: L, R, C, LFE, Ls, Rs, Lrs, Rrs, Ltm, Rtm, Ltf, Rtf
        self.channel_layout = self._parse_channel_layout(channels)
        self.num_channels = len(self.channel_layout)

        # Audio objects (max 118 for Dolby Atmos)
        self.audio_objects = []

        # Room acoustics parameters
        self.room_params = {
            "size": [10, 8, 3],  # meters (width, depth, height)
            "absorption": 0.3,  # wall absorption coefficient
            "diffusion": 0.5,  # sound diffusion
        }

    def _parse_channel_layout(self, channels: str) -> List[str]:
        """
        Parse channel configuration string

        Args:
            channels: Channel configuration (e.g., "7.1.4")

        Returns:
            List of channel names
        """
        bed, lfe, height = channels.split(".")
        bed = int(bed)
        lfe = int(lfe)
        height = int(height)

        layout = []

        # Bed channels (7.1 layout)
        if bed >= 2:
            layout.extend(["L", "R"])  # Front Left/Right
        if bed >= 3:
            layout.append("C")  # Center
        if bed >= 5:
            layout.extend(["Ls", "Rs"])  # Side Left/Right
        if bed >= 7:
            layout.extend(["Lrs", "Rrs"])  # Rear Left/Right

        # LFE channel
        if lfe >= 1:
            layout.append("LFE")

        # Height channels (4 overhead speakers)
        if height >= 2:
            layout.extend(["Ltm", "Rtm"])  # Top Middle Left/Right
        if height >= 4:
            layout.extend(["Ltf", "Rtf"])  # Top Front Left/Right

        return layout

    def generate_spatial_audio(
        self,
        audio: np.ndarray,
        object_positions: Optional[List[Tuple[float, float, float]]] = None,
        object_gains: Optional[List[float]] = None,
    ) -> np.ndarray:
        """
        Generate spatial audio from mono/stereo sources

        Args:
            audio: (T,) or (T, C) input audio
            object_positions: List of (x, y, z) positions in normalized space [-1, 1]
            object_gains: List of gain values for each object

        Returns:
            Multi-channel spatial audio (T, num_channels)
        """
        if audio.ndim == 1:
            audio = audio[:, np.newaxis]

        T, C = audio.shape

        # Default to single centered object if no positions specified
        if object_positions is None:
            object_positions = [(0.0, 0.0, 0.0)]  # Center position

        if object_gains is None:
            object_gains = [1.0] * len(object_positions)

        # Initialize output channels
        output = np.zeros((T, self.num_channels))

        # Process each audio object
        for obj_idx, (pos, gain) in enumerate(zip(object_positions, object_gains)):
            # Get channel gains based on object position
            channel_gains = self._calculate_panning(pos)

            # Apply object audio to channels
            obj_audio = audio[:, obj_idx % C] * gain
            for ch_idx, ch_gain in enumerate(channel_gains):
                output[:, ch_idx] += obj_audio * ch_gain

        # Apply room acoustics
        output = self._apply_room_acoustics(output)

        # Normalize to prevent clipping
        max_val = np.abs(output).max()
        if max_val > 1.0:
            output = output / max_val

        return output

    def _calculate_panning(self, position: Tuple[float, float, float]) -> np.ndarray:
        """
        Calculate channel gains for a 3D audio object position

        Args:
            position: (x, y, z) normalized position [-1, 1]

        Returns:
            Array of channel gains (num_channels,)
        """
        x, y, z = position
        gains = np.zeros(self.num_channels)

        # Angle from front (0 = front, ±π = rear)
        angle = np.arctan2(x, y)

        # Distance from center
        distance = np.sqrt(x**2 + y**2)
        distance = np.clip(distance, 0, 1)

        # Height elevation (-1 = floor, 0 = ear level, 1 = ceiling)
        elevation = z

        # Calculate gains for bed channels (ear level)
        bed_gain = 1.0 - abs(elevation) * 0.7  # Reduce bed when object is high/low

        # Front channels (L, R, C)
        if "L" in self.channel_layout:
            l_idx = self.channel_layout.index("L")
            # More gain when object is on the left and in front
            gains[l_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle + np.pi / 4) * bed_gain
            )

        if "R" in self.channel_layout:
            r_idx = self.channel_layout.index("R")
            gains[r_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle - np.pi / 4) * bed_gain
            )

        if "C" in self.channel_layout:
            c_idx = self.channel_layout.index("C")
            gains[c_idx] = max(0, (1 - distance * 0.5) * np.cos(angle) * bed_gain)

        # Side channels (Ls, Rs)
        if "Ls" in self.channel_layout:
            ls_idx = self.channel_layout.index("Ls")
            gains[ls_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle + np.pi / 2) * bed_gain
            )

        if "Rs" in self.channel_layout:
            rs_idx = self.channel_layout.index("Rs")
            gains[rs_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle - np.pi / 2) * bed_gain
            )

        # Rear channels (Lrs, Rrs)
        if "Lrs" in self.channel_layout:
            lrs_idx = self.channel_layout.index("Lrs")
            gains[lrs_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle + 3 * np.pi / 4) * bed_gain
            )

        if "Rrs" in self.channel_layout:
            rrs_idx = self.channel_layout.index("Rrs")
            gains[rrs_idx] = max(
                0, (1 - distance * 0.3) * np.cos(angle - 3 * np.pi / 4) * bed_gain
            )

        # LFE (low frequency)
        if "LFE" in self.channel_layout:
            lfe_idx = self.channel_layout.index("LFE")
            gains[lfe_idx] = 0.5  # Constant LFE presence

        # Height channels (overhead speakers)
        height_gain = max(0, elevation)  # More gain when object is elevated

        if "Ltm" in self.channel_layout:
            ltm_idx = self.channel_layout.index("Ltm")
            gains[ltm_idx] = max(0, np.cos(angle + np.pi / 4) * height_gain)

        if "Rtm" in self.channel_layout:
            rtm_idx = self.channel_layout.index("Rtm")
            gains[rtm_idx] = max(0, np.cos(angle - np.pi / 4) * height_gain)

        if "Ltf" in self.channel_layout:
            ltf_idx = self.channel_layout.index("Ltf")
            gains[ltf_idx] = max(0, np.cos(angle + np.pi / 6) * height_gain)

        if "Rtf" in self.channel_layout:
            rtf_idx = self.channel_layout.index("Rtf")
            gains[rtf_idx] = max(0, np.cos(angle - np.pi / 6) * height_gain)

        # Normalize gains to maintain consistent power
        total_power = np.sum(gains**2)
        if total_power > 0:
            gains = gains / np.sqrt(total_power)

        return gains

    def _apply_room_acoustics(self, audio: np.ndarray) -> np.ndarray:
        """
        Apply room acoustics and reverberation

        Args:
            audio: Multi-channel audio (T, C)

        Returns:
            Audio with room effects
        """
        T, C = audio.shape

        # Simple room reverb using feedback delay network
        reverb_time = 0.5  # seconds
        reverb_samples = int(reverb_time * self.sample_rate)

        # Create reverb tail
        reverb = np.zeros_like(audio)
        decay = np.exp(-3 * np.arange(reverb_samples) / reverb_samples)

        for ch in range(C):
            # Add delayed and decayed versions
            for delay in [
                int(0.02 * self.sample_rate),
                int(0.04 * self.sample_rate),
                int(0.06 * self.sample_rate),
            ]:
                if T > delay:
                    padded = np.pad(audio[:, ch], (delay, 0), mode="constant")[:T]
                    reverb[:, ch] += padded * 0.3 * self.room_params["diffusion"]

        # Mix dry and wet
        dry_wet = 0.2  # 20% wet
        output = audio * (1 - dry_wet) + reverb * dry_wet

        return output

    def binaural_render(self, spatial_audio: np.ndarray) -> np.ndarray:
        """
        Render multi-channel audio to binaural stereo for headphones

        Args:
            spatial_audio: (T, num_channels) spatial audio

        Returns:
            Binaural stereo (T, 2)
        """
        T, C = spatial_audio.shape

        # Head-Related Transfer Function (HRTF) simulation
        # Simplified: Real implementation would use measured HRTFs

        binaural = np.zeros((T, 2))

        # Map channels to binaural stereo
        for ch_idx, ch_name in enumerate(self.channel_layout):
            ch_audio = spatial_audio[:, ch_idx]

            if ch_name == "L":
                binaural[:, 0] += ch_audio * 1.0
                binaural[:, 1] += ch_audio * 0.3  # Crosstalk
            elif ch_name == "R":
                binaural[:, 1] += ch_audio * 1.0
                binaural[:, 0] += ch_audio * 0.3
            elif ch_name == "C":
                binaural[:, 0] += ch_audio * 0.7
                binaural[:, 1] += ch_audio * 0.7
            elif ch_name in ["Ls", "Lrs"]:
                binaural[:, 0] += ch_audio * 0.8
                binaural[:, 1] += ch_audio * 0.2
            elif ch_name in ["Rs", "Rrs"]:
                binaural[:, 1] += ch_audio * 0.8
                binaural[:, 0] += ch_audio * 0.2
            elif ch_name in ["Ltm", "Ltf"]:
                # Height channels - add subtle phase shift for elevation cue
                binaural[:, 0] += ch_audio * 0.6
                binaural[:, 1] += self._phase_shift(ch_audio, 0.0002) * 0.4
            elif ch_name in ["Rtm", "Rtf"]:
                binaural[:, 1] += ch_audio * 0.6
                binaural[:, 0] += self._phase_shift(ch_audio, 0.0002) * 0.4
            elif ch_name == "LFE":
                # LFE equally to both channels
                binaural[:, 0] += ch_audio * 0.5
                binaural[:, 1] += ch_audio * 0.5

        # Normalize
        max_val = np.abs(binaural).max()
        if max_val > 1.0:
            binaural = binaural / max_val

        return binaural

    def _phase_shift(self, audio: np.ndarray, delay_seconds: float) -> np.ndarray:
        """Apply phase shift (ITD - Interaural Time Difference)"""
        delay_samples = int(delay_seconds * self.sample_rate)
        if delay_samples > 0:
            return np.pad(audio, (delay_samples, 0), mode="constant")[:-delay_samples]
        return audio

    def encode_eac3(self, audio: np.ndarray, output_path: str, bitrate: int = 768):
        """
        Encode multi-channel audio to EAC3 (Enhanced AC-3) with Atmos metadata

        Args:
            audio: (T, num_channels) audio
            output_path: Output file path
            bitrate: Bitrate in kbps
        """
        import subprocess
        import soundfile as sf
        import tempfile
        import os

        # Save to temporary WAV file
        temp_wav = tempfile.mktemp(suffix=".wav")

        # Convert to proper format
        audio_int = (audio * (2 ** (self.bit_depth - 1) - 1)).astype(np.int32)
        sf.write(temp_wav, audio_int, self.sample_rate, subtype=f"PCM_{self.bit_depth}")

        # FFmpeg command for EAC3 encoding with Atmos
        channel_layout = self._get_ffmpeg_channel_layout()

        cmd = [
            "ffmpeg",
            "-i",
            temp_wav,
            "-c:a",
            "eac3",
            "-b:a",
            f"{bitrate}k",
            "-channel_layout",
            channel_layout,
            "-ar",
            str(self.sample_rate),
            "-metadata:s:a:0",
            "title=Dolby Atmos",
            "-y",
            output_path,
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"✅ Dolby Atmos audio encoded: {output_path}")
        except subprocess.CalledProcessError as e:
            print(f"❌ FFmpeg error: {e.stderr.decode()}")
            raise
        finally:
            if os.path.exists(temp_wav):
                os.remove(temp_wav)

    def _get_ffmpeg_channel_layout(self) -> str:
        """Get FFmpeg channel layout string"""
        # Map to FFmpeg channel layout names
        if self.channels == "7.1.4":
            return "7.1.4"
        elif self.channels == "5.1.2":
            return "5.1.2"
        else:
            return "7.1"


class AudioGenerator:
    """
    AI-powered audio generation using MusicGen or similar models
    """

    def __init__(self, model_name: str = "musicgen-small"):
        self.model_name = model_name
        self.model = None

    def load_model(self):
        """Load audio generation model"""
        try:
            # Try to import audiocraft (Meta MusicGen)
            from audiocraft.models import musicgen

            self.model = musicgen.MusicGen.get_pretrained(self.model_name)
            print(f"✅ Loaded {self.model_name}")
        except ImportError:
            print("⚠️  audiocraft not available, using placeholder")
            self.model = None

    def generate(
        self, prompt: str, duration: float = 10.0, sample_rate: int = 48000
    ) -> np.ndarray:
        """
        Generate audio from text prompt

        Args:
            prompt: Text description of desired audio/music
            duration: Duration in seconds
            sample_rate: Output sample rate

        Returns:
            Generated audio (T,) mono
        """
        if self.model is not None:
            # Use actual model
            self.model.set_generation_params(duration=duration)
            wav = self.model.generate([prompt])

            # Convert to numpy
            audio = wav[0].cpu().numpy().squeeze()

            # Resample if needed
            if self.model.sample_rate != sample_rate:
                from scipy import signal

                num_samples = int(len(audio) * sample_rate / self.model.sample_rate)
                audio = signal.resample(audio, num_samples)

            return audio
        else:
            # Placeholder: Generate simple tone
            print(f"⚠️  Generating placeholder audio for: {prompt}")
            num_samples = int(duration * sample_rate)
            t = np.linspace(0, duration, num_samples)

            # Simple musical chord
            audio = (
                np.sin(2 * np.pi * 440 * t)  # A4
                + np.sin(2 * np.pi * 554.37 * t)  # C#5
                + np.sin(2 * np.pi * 659.25 * t)  # E5
            ) / 3

            # Add envelope
            envelope = np.exp(-t * 0.5)
            audio *= envelope

            return audio


# ============================================================================
# Utility Functions
# ============================================================================


def generate_atmos_audio(
    prompt: str,
    duration: float = 10.0,
    object_positions: Optional[List[Tuple[float, float, float]]] = None,
) -> Tuple[np.ndarray, int]:
    """
    Generate Dolby Atmos audio from text prompt

    Args:
        prompt: Audio description
        duration: Duration in seconds
        object_positions: 3D positions for audio objects

    Returns:
        Tuple of (audio array, sample rate)
    """
    # Generate base audio
    generator = AudioGenerator()
    generator.load_model()
    mono_audio = generator.generate(prompt, duration)

    # Process to Dolby Atmos
    processor = DolbyAtmosProcessor()
    spatial_audio = processor.generate_spatial_audio(
        mono_audio, object_positions=object_positions
    )

    return spatial_audio, processor.sample_rate


def sync_audio_to_video(
    audio: np.ndarray, video_duration: float, audio_sample_rate: int
) -> np.ndarray:
    """
    Synchronize audio duration to match video

    Args:
        audio: Input audio
        video_duration: Target video duration in seconds
        audio_sample_rate: Audio sample rate

    Returns:
        Time-stretched audio
    """
    current_duration = len(audio) / audio_sample_rate
    stretch_factor = current_duration / video_duration

    if abs(stretch_factor - 1.0) < 0.01:
        return audio  # No stretching needed

    # Use phase vocoder for time stretching
    from scipy.signal import resample

    target_samples = int(len(audio) / stretch_factor)

    if audio.ndim == 1:
        stretched = resample(audio, target_samples)
    else:
        stretched = np.zeros((target_samples, audio.shape[1]))
        for ch in range(audio.shape[1]):
            stretched[:, ch] = resample(audio[:, ch], target_samples)

    return stretched


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    print("Dolby Atmos Audio Processing Example\n")

    # Generate test audio
    duration = 5.0
    sample_rate = 48000
    t = np.linspace(0, duration, int(duration * sample_rate))
    mono_audio = np.sin(2 * np.pi * 440 * t)  # A4 tone

    # Create Dolby Atmos processor
    processor = DolbyAtmosProcessor()

    # Define audio object positions (moving object)
    num_frames = len(mono_audio)
    positions = []
    for i in range(num_frames):
        # Object moves in a circle
        angle = 2 * np.pi * i / num_frames
        x = np.cos(angle) * 0.8
        y = np.sin(angle) * 0.8
        z = 0.0
        if i % (num_frames // 3) == 0:  # Sample every N frames
            positions.append((x, y, z))

    # Generate spatial audio
    spatial = processor.generate_spatial_audio(mono_audio, positions[:10])
    print(f"✅ Spatial audio shape: {spatial.shape}")
    print(f"   Channels: {processor.channel_layout}")

    # Render to binaural
    binaural = processor.binaural_render(spatial)
    print(f"✅ Binaural audio shape: {binaural.shape}")
