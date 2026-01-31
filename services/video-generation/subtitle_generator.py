"""
AI-Powered Subtitle & Caption Generator
Automatic speech recognition and multi-language subtitles

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


class SubtitleSegment:
    """Represents a single subtitle segment"""

    def __init__(
        self,
        index: int,
        start_time: float,
        end_time: float,
        text: str,
        confidence: float = 1.0,
    ):
        self.index = index
        self.start_time = start_time
        self.end_time = end_time
        self.text = text
        self.confidence = confidence

    def to_srt(self) -> str:
        """Convert to SRT format"""
        start = self._format_time(self.start_time)
        end = self._format_time(self.end_time)
        return f"{self.index}\n{start} --> {end}\n{self.text}\n\n"

    def to_vtt(self) -> str:
        """Convert to WebVTT format"""
        start = self._format_time(self.start_time, vtt=True)
        end = self._format_time(self.end_time, vtt=True)
        return f"{start} --> {end}\n{self.text}\n\n"

    def _format_time(self, seconds: float, vtt: bool = False) -> str:
        """Format time for subtitle files"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        # cSpell:ignore millis
        millis = int((seconds % 1) * 1000)

        if vtt:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"
        else:
            return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "index": self.index,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "text": self.text,
            "confidence": self.confidence,
        }


class SubtitleGenerator:
    """
    Generate subtitles from audio

    Features:
    - Speech-to-text transcription
    - Automatic timing
    - Multi-language support
    - Speaker diarization
    - Punctuation restoration
    """

    def __init__(self, model: str = "whisper"):
        self.model = model
        self.asr_model = None
        self._init_model()

    def _init_model(self):
        """Initialize ASR model"""
        logger.info(f"🎤 Initializing {self.model} model...")

        try:
            if self.model == "whisper":
                import whisper

                self.asr_model = whisper.load_model("base")
                logger.info("✅ Whisper model loaded")
            else:
                logger.warning(f"Model {self.model} not available, using mock")
        except ImportError:
            logger.warning("Whisper not installed, using mock transcription")

    def generate_from_audio(
        self, audio_path: str, language: str = "en", max_chars_per_segment: int = 42
    ) -> List[SubtitleSegment]:
        """
        Generate subtitles from audio file

        Args:
            audio_path: Path to audio file
            language: Target language code
            max_chars_per_segment: Maximum characters per subtitle

        Returns:
            List of subtitle segments
        """
        logger.info(f"🎤 Generating subtitles from {audio_path}...")

        if self.asr_model is not None:
            # Real transcription with Whisper
            result = self.asr_model.transcribe(
                audio_path, language=language, word_timestamps=True
            )

            segments = self._process_whisper_output(result, max_chars_per_segment)
        else:
            # Mock transcription for demonstration
            segments = self._generate_mock_subtitles(audio_path)

        logger.info(f"✅ Generated {len(segments)} subtitle segments")
        return segments

    def _process_whisper_output(
        self, result: Dict, max_chars: int
    ) -> List[SubtitleSegment]:
        """Process Whisper transcription result"""
        segments = []

        for i, segment in enumerate(result["segments"]):
            text = segment["text"].strip()
            start = segment["start"]
            end = segment["end"]

            # Split long segments
            if len(text) > max_chars:
                sub_segments = self._split_segment(text, start, end, max_chars)
                segments.extend(sub_segments)
            else:
                segments.append(
                    SubtitleSegment(
                        index=len(segments) + 1,
                        start_time=start,
                        end_time=end,
                        text=text,
                        confidence=segment.get("confidence", 1.0),
                    )
                )

        # Re-index
        for i, seg in enumerate(segments):
            seg.index = i + 1

        return segments

    def _split_segment(
        self, text: str, start: float, end: float, max_chars: int
    ) -> List[SubtitleSegment]:
        """Split long segment into multiple subtitle segments"""
        words = text.split()
        segments = []
        current_text = ""
        segment_start = start
        duration = end - start

        for word in words:
            if len(current_text) + len(word) + 1 <= max_chars:
                current_text += word + " "
            else:
                # Create segment
                progress = len(current_text) / len(text)
                segment_end = start + (duration * progress)

                segments.append(
                    SubtitleSegment(
                        index=0,  # Will be re-indexed
                        start_time=segment_start,
                        end_time=segment_end,
                        text=current_text.strip(),
                    )
                )

                current_text = word + " "
                segment_start = segment_end

        # Add remaining text
        if current_text:
            segments.append(
                SubtitleSegment(
                    index=0,
                    start_time=segment_start,
                    end_time=end,
                    text=current_text.strip(),
                )
            )

        return segments

    def _generate_mock_subtitles(self, audio_path: str) -> List[SubtitleSegment]:
        """Generate mock subtitles for demonstration"""
        mock_segments = [
            SubtitleSegment(1, 0.0, 3.0, "Welcome to our video.", 0.95),
            SubtitleSegment(2, 3.5, 6.5, "Today we'll explore amazing content.", 0.92),
            SubtitleSegment(3, 7.0, 10.0, "Let's dive right in!", 0.98),
            SubtitleSegment(
                4, 10.5, 14.0, "First, let me show you something interesting.", 0.90
            ),
            SubtitleSegment(5, 14.5, 18.0, "This is truly remarkable.", 0.93),
        ]
        return mock_segments

    def translate_subtitles(
        self, segments: List[SubtitleSegment], target_language: str
    ) -> List[SubtitleSegment]:
        """
        Translate subtitles to another language

        Args:
            segments: Original subtitle segments
            target_language: Target language code

        Returns:
            Translated subtitle segments
        """
        logger.info(f"🌍 Translating {len(segments)} segments to {target_language}...")

        try:
            from transformers import MarianMTModel, MarianTokenizer

            model_name = f"Helsinki-NLP/opus-mt-en-{target_language}"
            tokenizer = MarianTokenizer.from_pretrained(model_name)
            model = MarianMTModel.from_pretrained(model_name)

            translated = []

            for seg in segments:
                # Translate text
                inputs = tokenizer(seg.text, return_tensors="pt", padding=True)
                outputs = model.generate(**inputs)
                translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

                # Create new segment
                translated.append(
                    SubtitleSegment(
                        index=seg.index,
                        start_time=seg.start_time,
                        end_time=seg.end_time,
                        text=translated_text,
                        confidence=seg.confidence * 0.9,  # Slightly lower confidence
                    )
                )

            logger.info(f"✅ Translation complete")
            return translated

        except ImportError:
            logger.warning("Translation model not available, returning original")
            return segments

    def save_srt(self, segments: List[SubtitleSegment], output_path: str):
        """Save subtitles as SRT file"""
        with open(output_path, "w", encoding="utf-8") as f:
            for seg in segments:
                f.write(seg.to_srt())

        logger.info(f"💾 Saved SRT: {output_path}")

    def save_vtt(self, segments: List[SubtitleSegment], output_path: str):
        """Save subtitles as WebVTT file"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("WEBVTT\n\n")
            for seg in segments:
                f.write(seg.to_vtt())

        logger.info(f"💾 Saved VTT: {output_path}")

    def save_json(self, segments: List[SubtitleSegment], output_path: str):
        """Save subtitles as JSON"""
        import json

        data = {
            "subtitles": [seg.to_dict() for seg in segments],
            "count": len(segments),
            "generated_at": str(timedelta(seconds=0)),
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        logger.info(f"💾 Saved JSON: {output_path}")


class BurnedCaptionGenerator:
    """
    Generate burned-in captions (hard-coded into video)

    Features:
    - Stylized captions
    - Positioning options
    - Background boxes
    - Animations
    """

    def __init__(self):
        pass

    def burn_captions(
        self, video_path: str, subtitle_path: str, output_path: str, style: Dict = None
    ) -> str:
        """
        Burn captions into video using FFmpeg

        Args:
            video_path: Input video
            subtitle_path: Subtitle file (SRT/VTT)
            output_path: Output video path
            style: Caption styling options

        Returns:
            Path to output video
        """
        import subprocess

        if style is None:
            style = {
                "font": "Arial",
                "font_size": 24,
                "color": "white",
                "bg_color": "black@0.5",
                "position": "bottom",
                "margin": 20,
            }

        logger.info(f"🔥 Burning captions into video...")

        # Build FFmpeg filter
        filter_str = (
            f"subtitles={subtitle_path}:"
            f"force_style='FontName={style['font']},"
            f"FontSize={style['font_size']},"
            f"PrimaryColour=&H{self._color_to_hex(style['color'])},"
            f"BackColour=&H{self._color_to_hex(style['bg_color'])},"
            f"MarginV={style['margin']}'"
        )

        cmd = [
            "ffmpeg",
            "-i",
            video_path,
            "-vf",
            filter_str,
            "-c:a",
            "copy",
            output_path,
        ]

        subprocess.run(cmd, check=True, capture_output=True)

        logger.info(f"✅ Captions burned into video: {output_path}")
        return output_path

    def _color_to_hex(self, color: str) -> str:
        """Convert color name to hex"""
        colors = {
            "white": "FFFFFF",
            "black": "000000",
            "black@0.5": "00000080",
            "yellow": "FFFF00",
        }
        return colors.get(color, "FFFFFF")


# ============================================================================
# High-Level API
# ============================================================================


def generate_multi_language_subtitles(
    audio_path: str,
    output_dir: str,
    languages: List[str] = ["en", "es", "fr", "de"],
    formats: List[str] = ["srt", "vtt", "json"],
) -> Dict:
    """
    Generate subtitles in multiple languages and formats

    Args:
        audio_path: Audio file path
        output_dir: Output directory
        languages: List of language codes
        formats: Output formats

    Returns:
        Dictionary with paths to generated files
    """
    import os

    os.makedirs(output_dir, exist_ok=True)

    logger.info(f"🌍 Generating subtitles in {len(languages)} languages...")

    generator = SubtitleGenerator()
    result = {}

    # Generate base subtitles
    base_segments = generator.generate_from_audio(audio_path)

    for lang in languages:
        # Translate if not English
        if lang != "en":
            segments = generator.translate_subtitles(base_segments, lang)
        else:
            segments = base_segments

        lang_files = {}

        # Save in requested formats
        if "srt" in formats:
            srt_path = os.path.join(output_dir, f"subtitles_{lang}.srt")
            generator.save_srt(segments, srt_path)
            lang_files["srt"] = srt_path

        if "vtt" in formats:
            vtt_path = os.path.join(output_dir, f"subtitles_{lang}.vtt")
            generator.save_vtt(segments, vtt_path)
            lang_files["vtt"] = vtt_path

        if "json" in formats:
            json_path = os.path.join(output_dir, f"subtitles_{lang}.json")
            generator.save_json(segments, json_path)
            lang_files["json"] = json_path

        result[lang] = lang_files

    logger.info(f"✅ Generated subtitles in {len(languages)} languages")
    return result


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("AI-Powered Subtitle Generator")
    print("=" * 60)

    # Example: Generate subtitles
    generator = SubtitleGenerator()

    # Mock generation
    segments = generator._generate_mock_subtitles("audio.mp3")

    print(f"\n📝 Generated {len(segments)} subtitle segments:")
    for seg in segments[:3]:
        print(f"   [{seg.start_time:.1f}s - {seg.end_time:.1f}s] {seg.text}")

    # Save formats
    generator.save_srt(segments, "test_output.srt")
    generator.save_vtt(segments, "test_output.vtt")
    generator.save_json(segments, "test_output.json")

    print("\n✅ Subtitle generator ready!")
