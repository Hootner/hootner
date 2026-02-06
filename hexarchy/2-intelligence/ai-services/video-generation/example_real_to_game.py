"""
Example: Real Photo to Stylized Game Video
Converts real images to Octane/Unreal Engine style

Author: HOOTNER Code Guardian
Date: January 10, 2026
"""

import torch  # type: ignore
from real_to_game_style import RealToGameStyler, GameStyleConditioner
from diffusion import GaussianDiffusion


def real_photo_to_game_video(
    real_photo_path: str,
    audio_path: str = None,
    model=None,
    output_shape: tuple = (1, 3, 16, 512, 512),
    device: str = "cuda"
):
    """
    Convert real photo to stylized game-like video
    
    Args:
        real_photo_path: Path to real photo
        audio_path: Optional audio for reactive motion
        model: Video generation model
        output_shape: (batch, channels, frames, height, width)
        device: Device to run on
    """
    # Initialize styler
    styler = RealToGameStyler(device=device)
    conditioner = GameStyleConditioner(feature_dim=512).to(device)
    
    # Extract style from real photo
    print(f"Stylizing real photo: {real_photo_path}")
    features = styler.stylize_from_real(real_photo_path, audio_path)
    
    print("\nExtracted game-style features:")
    print(f"  - Color grading: {features['color_grade']}")
    print(f"  - Motion dynamics: {features['motion_dynamics']}")
    print(f"  - Render quality: {features['render_quality']}")
    if "audio_reactive" in features:
        print(f"  - Audio reactive: {features['audio_reactive']}")
    
    # Create conditioning
    conditioning = conditioner(features).unsqueeze(0)
    
    # Generate stylized video
    diffusion = GaussianDiffusion(timesteps=1000, beta_schedule="cosine")
    
    print("\nGenerating stylized video...")
    video = diffusion.p_sample_loop(
        model=model,
        shape=output_shape,
        context=conditioning,
        progress=True,
        device=device
    )
    
    return video


if __name__ == "__main__":
    # Mock model
    class MockModel(torch.nn.Module):
        def forward(self, x, t, context):
            return torch.randn_like(x)
    
    model = MockModel()
    
    # Convert real photo to game-style video
    video = real_photo_to_game_video(
        real_photo_path="real_photos/landscape.jpg",
        audio_path="audio/soundtrack.mp3",
        model=model,
        device="cuda" if torch.cuda.is_available() else "cpu"
    )
    
    print(f"\nGenerated stylized video: {video.shape}")
    print("Real-to-game conversion complete!")
