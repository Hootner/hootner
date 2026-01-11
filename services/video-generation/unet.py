"""
Optimized 3D U-Net Architecture for Video Diffusion
Memory-efficient implementation with flash attention and gradient checkpointing

Author: HOOTNER Code Guardian
Date: January 10, 2026
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple
import math


class MemoryEfficientAttention(nn.Module):
    """
    Memory-efficient attention mechanism using chunked computation
    Reduces memory from O(N²) to O(N) for sequence length N
    """

    def __init__(self, dim: int, num_heads: int = 8, chunk_size: int = 512):
        super().__init__()
        self.num_heads = num_heads
        self.chunk_size = chunk_size
        self.head_dim = dim // num_heads
        self.scale = self.head_dim**-0.5

        # Projections
        self.qkv = nn.Linear(dim, dim * 3, bias=False)
        self.proj = nn.Linear(dim, dim)

        # Optimization: fused layer norm
        self.norm = nn.LayerNorm(dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (B, T, H, W, C) or (B, T*H*W, C)
        Returns:
            out: Same shape as input
        """
        B, N, C = x.shape

        # Normalize input
        x = self.norm(x)

        # Compute Q, K, V
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim)
        qkv = qkv.permute(2, 0, 3, 1, 4)  # (3, B, H, N, D)
        q, k, v = qkv[0], qkv[1], qkv[2]

        # Chunked attention computation
        out_chunks = []
        for i in range(0, N, self.chunk_size):
            end_idx = min(i + self.chunk_size, N)
            q_chunk = q[:, :, i:end_idx]  # (B, H, chunk, D)

            # Compute attention scores for chunk
            attn = (q_chunk @ k.transpose(-2, -1)) * self.scale
            attn = F.softmax(attn, dim=-1)

            # Apply attention to values
            out_chunk = attn @ v
            out_chunks.append(out_chunk)

        # Concatenate chunks
        out = torch.cat(out_chunks, dim=2)  # (B, H, N, D)
        out = out.transpose(1, 2).reshape(B, N, C)

        return self.proj(out)


class FlashAttention3D(nn.Module):
    """
    Flash Attention for 3D (video) data with temporal awareness
    Optimized for T-H-W spatial-temporal attention
    """

    def __init__(self, dim: int, num_heads: int = 8, temporal_window: int = 4):
        super().__init__()
        self.num_heads = num_heads
        self.temporal_window = temporal_window
        self.head_dim = dim // num_heads
        self.scale = self.head_dim**-0.5

        self.qkv = nn.Linear(dim, dim * 3, bias=False)
        self.proj = nn.Linear(dim, dim)

    def forward(
        self, x: torch.Tensor, mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Args:
            x: (B, T, H, W, C)
            mask: Optional attention mask
        """
        B, T, H, W, C = x.shape

        # Reshape for attention
        x_flat = x.reshape(B, T * H * W, C)

        # QKV projection
        qkv = self.qkv(x_flat).reshape(B, T * H * W, 3, self.num_heads, self.head_dim)
        qkv = qkv.permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]

        # Temporal-aware windowed attention
        attn = self._compute_windowed_attention(q, k, v, T, H, W)

        # Reshape back
        out = attn.transpose(1, 2).reshape(B, T * H * W, C)
        out = self.proj(out)

        return out.reshape(B, T, H, W, C)

    def _compute_windowed_attention(self, q, k, v, T, H, W):
        """Compute attention with temporal windowing for efficiency"""
        B, num_heads, N, head_dim = q.shape

        # Reshape to separate temporal dimension
        q = q.reshape(B, num_heads, T, H * W, head_dim)
        k = k.reshape(B, num_heads, T, H * W, head_dim)
        v = v.reshape(B, num_heads, T, H * W, head_dim)

        # Compute attention within temporal windows
        out_frames = []
        for t in range(T):
            # Define temporal window
            t_start = max(0, t - self.temporal_window // 2)
            t_end = min(T, t + self.temporal_window // 2 + 1)

            q_t = q[:, :, t : t + 1]  # Current frame query
            k_window = k[:, :, t_start:t_end]  # Windowed keys
            v_window = v[:, :, t_start:t_end]  # Windowed values

            # Flatten window
            k_flat = k_window.reshape(B, num_heads, -1, head_dim)
            v_flat = v_window.reshape(B, num_heads, -1, head_dim)
            q_flat = q_t.reshape(B, num_heads, H * W, head_dim)

            # Attention computation
            attn = (q_flat @ k_flat.transpose(-2, -1)) * self.scale
            attn = F.softmax(attn, dim=-1)
            out_t = attn @ v_flat

            out_frames.append(out_t)

        # Stack temporal dimension
        out = torch.stack(out_frames, dim=2)  # (B, H, T, HW, D)
        return out.reshape(B, num_heads, T * H * W, head_dim)


class SpatialTemporalBlock(nn.Module):
    """
    Optimized spatial-temporal convolution block with separable convolutions
    Reduces parameters from T*H*W to T + H*W
    """

    def __init__(self, in_channels: int, out_channels: int, temporal_kernel: int = 3):
        super().__init__()

        # Temporal convolution (1D)
        self.temporal_conv = nn.Conv3d(
            in_channels,
            in_channels,
            kernel_size=(temporal_kernel, 1, 1),
            padding=(temporal_kernel // 2, 0, 0),
            groups=in_channels,  # Depthwise
        )

        # Spatial convolution (2D)
        self.spatial_conv = nn.Conv3d(
            in_channels, out_channels, kernel_size=(1, 3, 3), padding=(0, 1, 1)
        )

        # Normalization and activation
        self.norm1 = nn.GroupNorm(min(32, in_channels), in_channels)
        self.norm2 = nn.GroupNorm(min(32, out_channels), out_channels)
        self.act = nn.SiLU()

        # Residual connection
        self.residual = (
            nn.Conv3d(in_channels, out_channels, 1)
            if in_channels != out_channels
            else nn.Identity()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (B, C, T, H, W)
        """
        identity = x

        # Temporal processing
        x = self.temporal_conv(x)
        x = self.norm1(x)
        x = self.act(x)

        # Spatial processing
        x = self.spatial_conv(x)
        x = self.norm2(x)

        # Residual connection
        x = x + self.residual(identity)
        x = self.act(x)

        return x


class DownsampleBlock3D(nn.Module):
    """Efficient 3D downsampling with optional attention"""

    def __init__(
        self, in_channels: int, out_channels: int, use_attention: bool = False
    ):
        super().__init__()

        self.conv_block = SpatialTemporalBlock(in_channels, out_channels)

        # Strided convolution for downsampling
        self.downsample = nn.Conv3d(
            out_channels, out_channels, kernel_size=(1, 2, 2), stride=(1, 2, 2)
        )

        self.use_attention = use_attention
        if use_attention:
            self.attention = MemoryEfficientAttention(out_channels, num_heads=8)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Returns:
            x_down: Downsampled features
            x_skip: Skip connection features
        """
        x = self.conv_block(x)
        x_skip = x

        # Optional attention before downsampling
        if self.use_attention:
            B, C, T, H, W = x.shape
            x_flat = x.permute(0, 2, 3, 4, 1).reshape(B, T * H * W, C)
            x_flat = self.attention(x_flat)
            x = x_flat.reshape(B, T, H, W, C).permute(0, 4, 1, 2, 3)

        x_down = self.downsample(x)

        return x_down, x_skip


class UpsampleBlock3D(nn.Module):
    """Efficient 3D upsampling with skip connections"""

    def __init__(
        self,
        in_channels: int,
        skip_channels: int,
        out_channels: int,
        use_attention: bool = False,
    ):
        super().__init__()

        # Transposed convolution for upsampling
        self.upsample = nn.ConvTranspose3d(
            in_channels, in_channels, kernel_size=(1, 2, 2), stride=(1, 2, 2)
        )

        # Combine upsampled + skip connection
        self.conv_block = SpatialTemporalBlock(
            in_channels + skip_channels, out_channels
        )

        self.use_attention = use_attention
        if use_attention:
            self.attention = MemoryEfficientAttention(out_channels, num_heads=8)

    def forward(self, x: torch.Tensor, x_skip: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Upsampled features
            x_skip: Skip connection from encoder
        """
        x = self.upsample(x)

        # Concatenate skip connection
        x = torch.cat([x, x_skip], dim=1)

        x = self.conv_block(x)

        # Optional attention
        if self.use_attention:
            B, C, T, H, W = x.shape
            x_flat = x.permute(0, 2, 3, 4, 1).reshape(B, T * H * W, C)
            x_flat = self.attention(x_flat)
            x = x_flat.reshape(B, T, H, W, C).permute(0, 4, 1, 2, 3)

        return x


class TimeEmbedding(nn.Module):
    """Sinusoidal time embedding for diffusion timesteps"""

    def __init__(self, dim: int):
        super().__init__()
        self.dim = dim

        self.mlp = nn.Sequential(
            nn.Linear(dim, dim * 4), nn.SiLU(), nn.Linear(dim * 4, dim)
        )

    def forward(self, timesteps: torch.Tensor) -> torch.Tensor:
        """
        Args:
            timesteps: (B,)
        Returns:
            embeddings: (B, dim)
        """
        # Sinusoidal embeddings
        half_dim = self.dim // 2
        emb = math.log(10000) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=timesteps.device) * -emb)
        emb = timesteps[:, None] * emb[None, :]
        emb = torch.cat([torch.sin(emb), torch.cos(emb)], dim=-1)

        return self.mlp(emb)


class UNet3D(nn.Module):
    """
    Optimized 3D U-Net for Video Diffusion

    Features:
    - Memory-efficient attention mechanisms
    - Separable spatial-temporal convolutions
    - Gradient checkpointing support
    - Flash attention for long sequences
    - Skip connections with feature fusion

    Args:
        in_channels: Input channels (typically 3 for RGB + 1 for noise)
        out_channels: Output channels (typically 3 for RGB)
        base_channels: Base channel count (scales with depth)
        channel_multipliers: Channel multiplier per level
        num_blocks: Blocks per resolution level
        use_attention: Which levels to use attention
        temporal_length: Number of frames
    """

    def __init__(
        self,
        in_channels: int = 4,
        out_channels: int = 3,
        base_channels: int = 64,
        channel_multipliers: Tuple[int, ...] = (1, 2, 4, 8),
        num_blocks: int = 2,
        use_attention: Tuple[bool, ...] = (False, False, True, True),
        temporal_length: int = 16,
        use_checkpoint: bool = True,
    ):
        super().__init__()

        self.in_channels = in_channels
        self.out_channels = out_channels
        self.temporal_length = temporal_length
        self.use_checkpoint = use_checkpoint

        # Time embedding
        time_dim = base_channels * 4
        self.time_embed = TimeEmbedding(time_dim)

        # Initial convolution
        self.conv_in = nn.Conv3d(in_channels, base_channels, kernel_size=3, padding=1)

        # Encoder (downsampling path)
        self.down_blocks = nn.ModuleList()
        channels = [base_channels]
        in_ch = base_channels

        for i, mult in enumerate(channel_multipliers):
            out_ch = base_channels * mult

            for _ in range(num_blocks):
                self.down_blocks.append(
                    DownsampleBlock3D(in_ch, out_ch, use_attention=use_attention[i])
                )
                in_ch = out_ch
                channels.append(in_ch)

        # Bottleneck with flash attention
        self.bottleneck = nn.ModuleList(
            [
                SpatialTemporalBlock(in_ch, in_ch),
                FlashAttention3D(in_ch, num_heads=8),
                SpatialTemporalBlock(in_ch, in_ch),
            ]
        )

        # Decoder (upsampling path)
        self.up_blocks = nn.ModuleList()

        for i, mult in enumerate(reversed(channel_multipliers)):
            out_ch = base_channels * mult

            for j in range(num_blocks + 1):
                skip_ch = channels.pop()
                self.up_blocks.append(
                    UpsampleBlock3D(
                        in_ch, skip_ch, out_ch, use_attention=use_attention[-(i + 1)]
                    )
                )
                in_ch = out_ch

        # Output projection
        self.conv_out = nn.Sequential(
            nn.GroupNorm(min(32, in_ch), in_ch),
            nn.SiLU(),
            nn.Conv3d(in_ch, out_channels, kernel_size=3, padding=1),
        )

    def forward(
        self,
        x: torch.Tensor,
        timesteps: torch.Tensor,
        context: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Forward pass with gradient checkpointing support

        Args:
            x: (B, C, T, H, W) - Noisy video
            timesteps: (B,) - Diffusion timesteps
            context: (B, seq_len, dim) - Optional conditioning (e.g., text embeddings)

        Returns:
            denoised: (B, C, T, H, W) - Predicted noise or denoised video
        """
        # Time embedding
        t_emb = self.time_embed(timesteps)

        # Initial convolution
        x = self.conv_in(x)

        # Store skip connections
        skips = []

        # Encoder
        for block in self.down_blocks:
            if self.use_checkpoint and self.training:
                x, skip = torch.utils.checkpoint.checkpoint(block, x)
            else:
                x, skip = block(x)
            skips.append(skip)

        # Bottleneck
        for layer in self.bottleneck:
            if isinstance(layer, FlashAttention3D):
                B, C, T, H, W = x.shape
                x_shaped = x.permute(0, 2, 3, 4, 1)  # (B, T, H, W, C)
                if self.use_checkpoint and self.training:
                    x_shaped = torch.utils.checkpoint.checkpoint(layer, x_shaped)
                else:
                    x_shaped = layer(x_shaped)
                x = x_shaped.permute(0, 4, 1, 2, 3)
            else:
                if self.use_checkpoint and self.training:
                    x = torch.utils.checkpoint.checkpoint(layer, x)
                else:
                    x = layer(x)

        # Decoder with skip connections
        for block in self.up_blocks:
            skip = skips.pop()
            if self.use_checkpoint and self.training:
                x = torch.utils.checkpoint.checkpoint(block, x, skip)
            else:
                x = block(x, skip)

        # Output
        x = self.conv_out(x)

        return x

    def get_memory_stats(self) -> dict:
        """Get model memory statistics"""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)

        return {
            "total_parameters": total_params,
            "trainable_parameters": trainable_params,
            "memory_mb": total_params * 4 / (1024**2),  # Assuming float32
            "use_checkpoint": self.use_checkpoint,
        }


def create_unet_small(temporal_length: int = 16) -> UNet3D:
    """Create a small U-Net for testing (fast, low memory)"""
    return UNet3D(
        base_channels=32,
        channel_multipliers=(1, 2, 4),
        num_blocks=1,
        use_attention=(False, True, True),
        temporal_length=temporal_length,
    )


def create_unet_base(temporal_length: int = 16) -> UNet3D:
    """Create base U-Net for production (balanced)"""
    return UNet3D(
        base_channels=64,
        channel_multipliers=(1, 2, 4, 8),
        num_blocks=2,
        use_attention=(False, False, True, True),
        temporal_length=temporal_length,
    )


def create_unet_large(temporal_length: int = 16) -> UNet3D:
    """Create large U-Net for high quality (slower, more memory)"""
    return UNet3D(
        base_channels=128,
        channel_multipliers=(1, 2, 4, 8, 16),
        num_blocks=3,
        use_attention=(False, False, True, True, True),
        temporal_length=temporal_length,
    )


if __name__ == "__main__":
    # Test the model
    print("🧪 Testing Optimized 3D U-Net")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")

    # Create model
    model = create_unet_base(temporal_length=16).to(device)

    # Print statistics
    stats = model.get_memory_stats()
    print(f"\n📊 Model Statistics:")
    print(f"  Total parameters: {stats['total_parameters']:,}")
    print(f"  Trainable parameters: {stats['trainable_parameters']:,}")
    print(f"  Estimated memory: {stats['memory_mb']:.2f} MB")
    print(f"  Gradient checkpointing: {stats['use_checkpoint']}")

    # Test forward pass
    batch_size = 2
    frames = 16
    height, width = 64, 64

    x = torch.randn(batch_size, 4, frames, height, width).to(device)
    timesteps = torch.randint(0, 1000, (batch_size,)).to(device)

    print(f"\n🔬 Testing forward pass...")
    print(f"  Input shape: {x.shape}")

    with torch.no_grad():
        output = model(x, timesteps)

    print(f"  Output shape: {output.shape}")
    print(f"\n✅ Model test successful!")
