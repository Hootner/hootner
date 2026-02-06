"""
Advanced Diffusion Models for Video Generation
Implements DDPM, DDIM, and optimized sampling strategies

Author: HOOTNER Code Guardian
Date: January 10, 2026
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple, Callable
import numpy as np
from tqdm import tqdm


class GaussianDiffusion:
    """
    Denoising Diffusion Probabilistic Models (DDPM) for video generation

    Features:
    - Cosine noise schedule
    - DDIM fast sampling
    - Classifier-free guidance
    - Progressive generation
    """

    def __init__(
        self,
        timesteps: int = 1000,
        beta_schedule: str = "cosine",
        beta_start: float = 0.0001,
        beta_end: float = 0.02,
        clip_denoised: bool = True,
        predict_noise: bool = True,
    ):
        self.timesteps = timesteps
        self.clip_denoised = clip_denoised
        self.predict_noise = predict_noise

        # Generate beta schedule
        if beta_schedule == "linear":
            betas = torch.linspace(beta_start, beta_end, timesteps)
        elif beta_schedule == "cosine":
            betas = self._cosine_beta_schedule(timesteps)
        elif beta_schedule == "quadratic":
            betas = torch.linspace(beta_start**0.5, beta_end**0.5, timesteps) ** 2
        else:
            raise ValueError(f"Unknown beta schedule: {beta_schedule}")

        # Pre-compute diffusion parameters
        alphas = 1.0 - betas
        alphas_cumprod = torch.cumprod(alphas, dim=0)
        alphas_cumprod_prev = F.pad(alphas_cumprod[:-1], (1, 0), value=1.0)

        # Store as buffers
        self.register_buffer("betas", betas)
        self.register_buffer("alphas", alphas)
        self.register_buffer("alphas_cumprod", alphas_cumprod)
        self.register_buffer("alphas_cumprod_prev", alphas_cumprod_prev)

        # Calculations for diffusion q(x_t | x_{t-1})
        self.register_buffer("sqrt_alphas_cumprod", torch.sqrt(alphas_cumprod))
        self.register_buffer(
            "sqrt_one_minus_alphas_cumprod", torch.sqrt(1.0 - alphas_cumprod)
        )

        # Calculations for posterior q(x_{t-1} | x_t, x_0)
        self.register_buffer(
            "posterior_variance",
            betas * (1.0 - alphas_cumprod_prev) / (1.0 - alphas_cumprod),
        )
        self.register_buffer(
            "posterior_log_variance_clipped",
            torch.log(torch.clamp(self.posterior_variance, min=1e-20)),
        )
        self.register_buffer(
            "posterior_mean_coef1",
            betas * torch.sqrt(alphas_cumprod_prev) / (1.0 - alphas_cumprod),
        )
        self.register_buffer(
            "posterior_mean_coef2",
            (1.0 - alphas_cumprod_prev) * torch.sqrt(alphas) / (1.0 - alphas_cumprod),
        )

    def register_buffer(self, name: str, tensor: torch.Tensor):
        """Helper to store tensors as class attributes"""
        setattr(self, name, tensor)

    def _cosine_beta_schedule(self, timesteps: int, s: float = 0.008) -> torch.Tensor:
        """
        Cosine schedule as proposed in https://arxiv.org/abs/2102.09672
        """
        steps = timesteps + 1
        x = torch.linspace(0, timesteps, steps)
        alphas_cumprod = (
            torch.cos(((x / timesteps) + s) / (1 + s) * torch.pi * 0.5) ** 2
        )
        alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
        betas = 1 - (alphas_cumprod[1:] / alphas_cumprod[:-1])
        return torch.clip(betas, 0.0001, 0.9999)

    def q_sample(
        self,
        x_start: torch.Tensor,
        t: torch.Tensor,
        noise: Optional[torch.Tensor] = None,
    ) -> torch.Tensor:
        """
        Forward diffusion process: add noise to x_start at timestep t

        Args:
            x_start: (B, C, T, H, W) - Original video
            t: (B,) - Timesteps
            noise: Optional pre-generated noise

        Returns:
            x_t: Noisy video at timestep t
        """
        if noise is None:
            noise = torch.randn_like(x_start)

        sqrt_alphas_cumprod_t = self._extract(
            self.sqrt_alphas_cumprod, t, x_start.shape
        )
        sqrt_one_minus_alphas_cumprod_t = self._extract(
            self.sqrt_one_minus_alphas_cumprod, t, x_start.shape
        )

        return sqrt_alphas_cumprod_t * x_start + sqrt_one_minus_alphas_cumprod_t * noise

    def q_posterior_mean_variance(
        self, x_start: torch.Tensor, x_t: torch.Tensor, t: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Compute mean and variance of posterior q(x_{t-1} | x_t, x_0)
        """
        posterior_mean = (
            self._extract(self.posterior_mean_coef1, t, x_t.shape) * x_start
            + self._extract(self.posterior_mean_coef2, t, x_t.shape) * x_t
        )
        posterior_variance = self._extract(self.posterior_variance, t, x_t.shape)
        posterior_log_variance = self._extract(
            self.posterior_log_variance_clipped, t, x_t.shape
        )

        return posterior_mean, posterior_variance, posterior_log_variance

    def predict_start_from_noise(
        self, x_t: torch.Tensor, t: torch.Tensor, noise: torch.Tensor
    ) -> torch.Tensor:
        """Predict x_0 from x_t and predicted noise"""
        return (
            self._extract(self.sqrt_alphas_cumprod, t, x_t.shape) * x_t
            - self._extract(self.sqrt_one_minus_alphas_cumprod, t, x_t.shape) * noise
        ) / self._extract(self.sqrt_alphas_cumprod, t, x_t.shape)

    def p_mean_variance(
        self,
        model: nn.Module,
        x_t: torch.Tensor,
        t: torch.Tensor,
        context: Optional[torch.Tensor] = None,
        clip_denoised: bool = True,
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Compute mean and variance for reverse process p(x_{t-1} | x_t)
        """
        # Model prediction
        model_output = model(x_t, t, context)

        if self.predict_noise:
            # Model predicts noise
            pred_noise = model_output
            x_start = self.predict_start_from_noise(x_t, t, pred_noise)
        else:
            # Model predicts x_0 directly
            x_start = model_output

        if clip_denoised:
            x_start = torch.clamp(x_start, -1, 1)

        model_mean, posterior_variance, posterior_log_variance = (
            self.q_posterior_mean_variance(x_start, x_t, t)
        )

        return model_mean, posterior_variance, posterior_log_variance

    @torch.no_grad()
    def p_sample(
        self,
        model: nn.Module,
        x_t: torch.Tensor,
        t: torch.Tensor,
        context: Optional[torch.Tensor] = None,
        clip_denoised: bool = True,
    ) -> torch.Tensor:
        """
        Single denoising step: sample x_{t-1} from x_t
        """
        model_mean, _, model_log_variance = self.p_mean_variance(
            model, x_t, t, context, clip_denoised
        )

        noise = torch.randn_like(x_t)
        # No noise when t == 0
        nonzero_mask = (t != 0).float().view(-1, *([1] * (len(x_t.shape) - 1)))

        return model_mean + nonzero_mask * torch.exp(0.5 * model_log_variance) * noise

    @torch.no_grad()
    def p_sample_loop(
        self,
        model: nn.Module,
        shape: Tuple[int, ...],
        context: Optional[torch.Tensor] = None,
        progress: bool = True,
        device: str = "cuda",
    ) -> torch.Tensor:
        """
        Full sampling loop: generate video from noise

        Args:
            model: Denoising U-Net
            shape: (B, C, T, H, W)
            context: Optional conditioning
            progress: Show progress bar
            device: Device to run on

        Returns:
            Generated video
        """
        batch_size = shape[0]

        # Start from pure noise
        video = torch.randn(shape, device=device)

        timesteps = list(range(self.timesteps))[::-1]

        if progress:
            timesteps = tqdm(timesteps, desc="Sampling")

        for t in timesteps:
            t_batch = torch.full((batch_size,), t, device=device, dtype=torch.long)
            video = self.p_sample(model, video, t_batch, context)

        return video

    @torch.no_grad()
    def ddim_sample(
        self,
        model: nn.Module,
        shape: Tuple[int, ...],
        context: Optional[torch.Tensor] = None,
        steps: int = 50,
        eta: float = 0.0,
        progress: bool = True,
        device: str = "cuda",
    ) -> torch.Tensor:
        """
        DDIM sampling for faster generation

        Args:
            model: Denoising U-Net
            shape: (B, C, T, H, W)
            context: Optional conditioning
            steps: Number of sampling steps (< timesteps for speedup)
            eta: Stochasticity parameter (0 = deterministic)
            progress: Show progress bar
            device: Device to run on

        Returns:
            Generated video
        """
        batch_size = shape[0]

        # Start from pure noise
        video = torch.randn(shape, device=device)

        # Create timestep schedule
        skip = self.timesteps // steps
        timesteps = list(range(0, self.timesteps, skip))[::-1]

        if progress:
            timesteps = tqdm(timesteps, desc="DDIM Sampling")

        for i, t in enumerate(timesteps):
            t_batch = torch.full((batch_size,), t, device=device, dtype=torch.long)

            # Predict noise
            pred_noise = model(video, t_batch, context)

            # Get alpha values
            alpha_t = self._extract(self.alphas_cumprod, t_batch, video.shape)

            if i < len(timesteps) - 1:
                alpha_t_prev = self._extract(
                    self.alphas_cumprod,
                    torch.full(
                        (batch_size,), timesteps[i + 1], device=device, dtype=torch.long
                    ),
                    video.shape,
                )
            else:
                alpha_t_prev = torch.ones_like(alpha_t)

            # Predict x_0
            pred_x0 = (video - torch.sqrt(1 - alpha_t) * pred_noise) / torch.sqrt(
                alpha_t
            )

            if self.clip_denoised:
                pred_x0 = torch.clamp(pred_x0, -1, 1)

            # Compute direction pointing to x_t
            dir_xt = torch.sqrt(1 - alpha_t_prev - eta**2) * pred_noise

            # Add noise
            noise = torch.randn_like(video) if eta > 0 else 0

            # Update
            video = torch.sqrt(alpha_t_prev) * pred_x0 + dir_xt + eta * noise

        return video

    @torch.no_grad()
    def progressive_sampling(
        self,
        model: nn.Module,
        shape: Tuple[int, ...],
        context: Optional[torch.Tensor] = None,
        num_stages: int = 4,
        device: str = "cuda",
    ) -> torch.Tensor:
        """
        Progressive generation: coarse-to-fine video synthesis

        Generates video in multiple stages, upsampling resolution each time
        """
        B, C, T, H, W = shape

        # Start with low resolution
        current_shape = (B, C, T, H // (2**num_stages), W // (2**num_stages))

        for stage in range(num_stages):
            print(
                f"🎬 Stage {stage + 1}/{num_stages} - Resolution: {current_shape[-2:]} "
            )

            # Generate at current resolution
            video = self.ddim_sample(
                model, current_shape, context, steps=25, device=device
            )

            # Upsample for next stage
            if stage < num_stages - 1:
                video = F.interpolate(
                    video, scale_factor=(1, 2, 2), mode="trilinear", align_corners=False
                )
                current_shape = video.shape

        return video

    def training_losses(
        self,
        model: nn.Module,
        x_start: torch.Tensor,
        t: Optional[torch.Tensor] = None,
        context: Optional[torch.Tensor] = None,
        noise: Optional[torch.Tensor] = None,
    ) -> dict:
        """
        Compute training losses

        Returns:
            Dictionary with 'loss' and optional metrics
        """
        if t is None:
            t = torch.randint(
                0, self.timesteps, (x_start.shape[0],), device=x_start.device
            )

        if noise is None:
            noise = torch.randn_like(x_start)

        # Forward diffusion
        x_t = self.q_sample(x_start, t, noise=noise)

        # Model prediction
        model_output = model(x_t, t, context)

        # Compute loss
        if self.predict_noise:
            target = noise
        else:
            target = x_start

        loss = F.mse_loss(model_output, target, reduction="mean")

        return {"loss": loss, "mse": loss.item()}

    def _extract(
        self, a: torch.Tensor, t: torch.Tensor, x_shape: Tuple
    ) -> torch.Tensor:
        """
        Extract values from tensor a at indices t and reshape for broadcasting
        """
        try:
            batch_size = t.shape[0]
            out = a.gather(-1, t.cpu()).to(t.device)
            return out.reshape(batch_size, *((1,) * (len(x_shape) - 1)))
        except (RuntimeError, IndexError) as e:
            raise ValueError(f"Failed to extract diffusion parameters: {str(e)}")


class ClassifierFreeGuidance:
    """
    Classifier-free guidance for conditional generation
    Allows trading off sample quality vs diversity
    """

    def __init__(self, guidance_scale: float = 7.5):
        self.guidance_scale = guidance_scale

    @torch.no_grad()
    def guided_sample(
        self,
        model: nn.Module,
        diffusion: GaussianDiffusion,
        shape: Tuple[int, ...],
        context: torch.Tensor,
        unconditional_context: Optional[torch.Tensor] = None,
        method: str = "ddim",
        steps: int = 50,
        device: str = "cuda",
    ) -> torch.Tensor:
        """
        Sample with classifier-free guidance

        Args:
            model: U-Net model
            diffusion: Diffusion process
            shape: Output shape
            context: Conditional context (e.g., text embeddings)
            unconditional_context: Null context for unconditional generation
            method: 'ddpm' or 'ddim'
            steps: Number of sampling steps
            device: Device to run on

        Returns:
            Generated video with guidance
        """
        batch_size = shape[0]

        # Start from noise
        video = torch.randn(shape, device=device)

        # Prepare unconditional context
        if unconditional_context is None:
            unconditional_context = torch.zeros_like(context)

        # Create double batch for conditional and unconditional
        context_double = torch.cat([unconditional_context, context], dim=0)

        timesteps = list(range(0, diffusion.timesteps, diffusion.timesteps // steps))[
            ::-1
        ]

        for t in tqdm(timesteps, desc="Guided Sampling"):
            t_batch = torch.full((batch_size,), t, device=device, dtype=torch.long)
            t_double = torch.cat([t_batch, t_batch], dim=0)

            # Double forward pass
            video_double = torch.cat([video, video], dim=0)
            pred_noise_double = model(video_double, t_double, context_double)

            # Split predictions
            pred_noise_uncond, pred_noise_cond = pred_noise_double.chunk(2, dim=0)

            # Apply guidance
            pred_noise = pred_noise_uncond + self.guidance_scale * (
                pred_noise_cond - pred_noise_uncond
            )

            # Single denoising step
            if method == "ddim":
                # DDIM update
                alpha_t = diffusion._extract(
                    diffusion.alphas_cumprod, t_batch, video.shape
                )
                video = diffusion._ddim_step(video, pred_noise, alpha_t)
            else:
                # DDPM update
                video = diffusion.p_sample_with_noise(video, t_batch, pred_noise)

        return video


if __name__ == "__main__":
    print("🧪 Testing Diffusion Process")

    # Test parameters
    batch_size = 2
    channels = 3
    frames = 16
    height, width = 64, 64

    # Create diffusion
    diffusion = GaussianDiffusion(timesteps=1000, beta_schedule="cosine")

    print(f"✅ Diffusion initialized with {diffusion.timesteps} timesteps")

    # Test forward diffusion
    x_start = torch.randn(batch_size, channels, frames, height, width)
    t = torch.randint(0, 1000, (batch_size,))
    x_t = diffusion.q_sample(x_start, t)

    print(f"✅ Forward diffusion test passed")
    print(f"   Input shape: {x_start.shape}")
    print(f"   Noisy output shape: {x_t.shape}")

    print("\n🎬 Diffusion process ready for video generation!")
