"""
Advanced Sampling Strategies for Video Diffusion
DPM-Solver++, Euler, and adaptive sampling methods

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Callable, List
import numpy as np
from tqdm import tqdm


class DPMSolverPlusPlus:
    """
    DPM-Solver++: Fast ODE solver for diffusion models

    Paper: https://arxiv.org/abs/2211.01095

    Features:
    - 2nd and 3rd order solvers
    - 5-10x faster than DDPM
    - High quality at low step counts
    """

    def __init__(
        self,
        num_timesteps: int = 1000,
        beta_schedule: str = "cosine",
        prediction_type: str = "epsilon",
        algorithm_type: str = "dpmsolver++",
        solver_order: int = 2,
    ):
        self.num_timesteps = num_timesteps
        self.prediction_type = prediction_type
        self.algorithm_type = algorithm_type
        self.solver_order = solver_order

        # Compute noise schedule
        if beta_schedule == "cosine":
            self.alphas_cumprod = self._cosine_schedule(num_timesteps)
        else:
            betas = torch.linspace(0.0001, 0.02, num_timesteps)
            alphas = 1.0 - betas
            self.alphas_cumprod = torch.cumprod(alphas, dim=0)

        self.alphas = self.alphas_cumprod
        self.betas = 1 - self.alphas

    def _cosine_schedule(self, timesteps: int, s: float = 0.008) -> torch.Tensor:
        """Cosine noise schedule"""
        steps = timesteps + 1
        x = torch.linspace(0, timesteps, steps)
        alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * np.pi * 0.5) ** 2
        alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
        return alphas_cumprod[:-1]

    def _get_lambda(self, alpha_t: torch.Tensor) -> torch.Tensor:
        """Get lambda(t) = log(alpha_t / (1 - alpha_t))"""
        return torch.log(alpha_t / (1 - alpha_t))

    def _get_alpha(self, lambda_t: torch.Tensor) -> torch.Tensor:
        """Get alpha from lambda"""
        return torch.sigmoid(lambda_t)

    def sample(
        self,
        model: nn.Module,
        shape: tuple,
        num_steps: int = 20,
        conditioning: Optional[torch.Tensor] = None,
        progress_callback: Optional[Callable] = None,
    ) -> torch.Tensor:
        """
        Generate samples using DPM-Solver++

        Args:
            model: Denoising model
            shape: Output shape (B, C, T, H, W)
            num_steps: Number of sampling steps
            conditioning: Optional conditioning (text embeddings)
            progress_callback: Optional callback(step, total)

        Returns:
            Generated samples
        """
        device = next(model.parameters()).device

        # Start from noise
        x = torch.randn(shape, device=device)

        # Time schedule
        timesteps = torch.linspace(
            self.num_timesteps - 1, 0, num_steps + 1, device=device
        ).long()

        # Get lambdas
        lambdas = self._get_lambda(self.alphas_cumprod[timesteps])

        # Model outputs buffer for higher-order solvers
        model_outputs = []

        for i in tqdm(range(num_steps), desc="DPM-Solver++ sampling"):
            t = timesteps[i]
            t_next = (
                timesteps[i + 1]
                if i < num_steps - 1
                else torch.tensor(0, device=device)
            )

            lambda_t = lambdas[i]
            lambda_next = lambdas[i + 1] if i < num_steps - 1 else lambdas[-1]
            h = lambda_next - lambda_t

            # Get model prediction
            with torch.no_grad():
                t_input = t.float().view(1).expand(shape[0])
                model_output = model(x, t_input, conditioning)

            model_outputs.append(model_output)

            # Apply solver
            if self.solver_order == 1 or len(model_outputs) < 2:
                # First-order update
                x = self._first_order_update(x, model_output, lambda_t, lambda_next)
            elif self.solver_order == 2 or len(model_outputs) < 3:
                # Second-order update
                x = self._second_order_update(
                    x,
                    model_outputs[-2],
                    model_output,
                    lambda_t,
                    lambdas[i - 1],
                    lambda_next,
                )
            else:
                # Third-order update
                x = self._third_order_update(
                    x,
                    model_outputs[-3],
                    model_outputs[-2],
                    model_output,
                    lambda_t,
                    lambdas[i - 2],
                    lambdas[i - 1],
                    lambda_next,
                )

            # Keep only necessary history
            if len(model_outputs) > self.solver_order:
                model_outputs.pop(0)

            if progress_callback:
                progress_callback(i + 1, num_steps)

        return x

    def _first_order_update(
        self,
        x: torch.Tensor,
        model_output: torch.Tensor,
        lambda_t: torch.Tensor,
        lambda_next: torch.Tensor,
    ) -> torch.Tensor:
        """First-order DPM-Solver update"""
        h = lambda_next - lambda_t
        alpha_t = self._get_alpha(lambda_t)
        alpha_next = self._get_alpha(lambda_next)

        sigma_t = torch.sqrt(1 - alpha_t)
        sigma_next = torch.sqrt(1 - alpha_next)

        x_next = (alpha_next / alpha_t) * x - sigma_next * torch.expm1(h) * model_output

        return x_next

    def _second_order_update(
        self,
        x: torch.Tensor,
        model_output_prev: torch.Tensor,
        model_output: torch.Tensor,
        lambda_t: torch.Tensor,
        lambda_prev: torch.Tensor,
        lambda_next: torch.Tensor,
    ) -> torch.Tensor:
        """Second-order DPM-Solver update"""
        h = lambda_next - lambda_t
        h_prev = lambda_t - lambda_prev
        r = h_prev / h

        alpha_t = self._get_alpha(lambda_t)
        alpha_next = self._get_alpha(lambda_next)
        sigma_t = torch.sqrt(1 - alpha_t)
        sigma_next = torch.sqrt(1 - alpha_next)

        # Compute D
        D1 = (1 + 0.5 / r) * model_output - (0.5 / r) * model_output_prev

        x_next = (alpha_next / alpha_t) * x - sigma_next * torch.expm1(h) * D1

        return x_next

    def _third_order_update(
        self,
        x: torch.Tensor,
        model_output_0: torch.Tensor,
        model_output_1: torch.Tensor,
        model_output_2: torch.Tensor,
        lambda_t: torch.Tensor,
        lambda_0: torch.Tensor,
        lambda_1: torch.Tensor,
        lambda_next: torch.Tensor,
    ) -> torch.Tensor:
        """Third-order DPM-Solver update"""
        h = lambda_next - lambda_t
        h_1 = lambda_t - lambda_1
        h_0 = lambda_1 - lambda_0
        r_1 = h_1 / h
        r_0 = h_0 / h

        alpha_t = self._get_alpha(lambda_t)
        alpha_next = self._get_alpha(lambda_next)
        sigma_next = torch.sqrt(1 - alpha_next)

        # Compute D
        D1 = (1 + 0.5 / r_1) * model_output_2 - (0.5 / r_1) * model_output_1
        D2 = ((1 + 1 / (2 * r_1)) / r_0) * (model_output_2 - model_output_1) - (
            1 / (2 * r_0 * r_1)
        ) * (model_output_1 - model_output_0)

        x_next = (
            (alpha_next / alpha_t) * x
            - sigma_next * torch.expm1(h) * D1
            - sigma_next * (torch.expm1(h) - h) * D2
        )

        return x_next


class EulerAncestralSampler:
    """
    Euler Ancestral Sampling

    Stochastic sampler with noise injection
    Good for creative generation
    """

    def __init__(
        self, num_timesteps: int = 1000, beta_schedule: str = "cosine", eta: float = 1.0
    ):
        self.num_timesteps = num_timesteps
        self.eta = eta

        # Compute noise schedule
        if beta_schedule == "cosine":
            self.alphas_cumprod = self._cosine_schedule(num_timesteps)
        else:
            betas = torch.linspace(0.0001, 0.02, num_timesteps)
            alphas = 1.0 - betas
            self.alphas_cumprod = torch.cumprod(alphas, dim=0)

        self.sigmas = torch.sqrt(1 - self.alphas_cumprod)

    def _cosine_schedule(self, timesteps: int, s: float = 0.008) -> torch.Tensor:
        """Cosine noise schedule"""
        steps = timesteps + 1
        x = torch.linspace(0, timesteps, steps)
        alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * np.pi * 0.5) ** 2
        alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
        return alphas_cumprod[:-1]

    def sample(
        self,
        model: nn.Module,
        shape: tuple,
        num_steps: int = 50,
        conditioning: Optional[torch.Tensor] = None,
        progress_callback: Optional[Callable] = None,
    ) -> torch.Tensor:
        """
        Generate samples using Euler Ancestral sampling

        Args:
            model: Denoising model
            shape: Output shape
            num_steps: Number of steps
            conditioning: Optional conditioning
            progress_callback: Optional callback

        Returns:
            Generated samples
        """
        device = next(model.parameters()).device

        # Start from noise
        x = torch.randn(shape, device=device)

        # Time schedule
        timesteps = torch.linspace(
            self.num_timesteps - 1, 0, num_steps + 1, device=device
        ).long()
        sigmas = self.sigmas[timesteps].to(device)

        for i in tqdm(range(num_steps), desc="Euler Ancestral sampling"):
            t = timesteps[i]
            sigma = sigmas[i]
            sigma_next = (
                sigmas[i + 1] if i < num_steps - 1 else torch.tensor(0.0, device=device)
            )

            # Get model prediction
            with torch.no_grad():
                t_input = t.float().view(1).expand(shape[0])
                denoised = model(x, t_input, conditioning)

            # Compute derivative
            d = (x - denoised) / sigma

            # Euler step
            dt = sigma_next - sigma
            x = x + d * dt

            # Add noise (ancestral sampling)
            if sigma_next > 0 and self.eta > 0:
                noise_scale = self.eta * torch.sqrt(
                    (sigma_next**2) * (sigma**2 - sigma_next**2) / (sigma**2)
                )
                x = x + torch.randn_like(x) * noise_scale

            if progress_callback:
                progress_callback(i + 1, num_steps)

        return x


class AdaptiveSampler:
    """
    Adaptive sampling with dynamic step sizing

    Automatically adjusts step size based on error estimation
    """

    def __init__(
        self,
        num_timesteps: int = 1000,
        beta_schedule: str = "cosine",
        tolerance: float = 0.01,
        min_steps: int = 10,
        max_steps: int = 100,
    ):
        self.num_timesteps = num_timesteps
        self.tolerance = tolerance
        self.min_steps = min_steps
        self.max_steps = max_steps

        # Compute noise schedule
        if beta_schedule == "cosine":
            self.alphas_cumprod = self._cosine_schedule(num_timesteps)
        else:
            betas = torch.linspace(0.0001, 0.02, num_timesteps)
            alphas = 1.0 - betas
            self.alphas_cumprod = torch.cumprod(alphas, dim=0)

    def _cosine_schedule(self, timesteps: int, s: float = 0.008) -> torch.Tensor:
        """Cosine noise schedule"""
        steps = timesteps + 1
        x = torch.linspace(0, timesteps, steps)
        alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * np.pi * 0.5) ** 2
        alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
        return alphas_cumprod[:-1]

    def _estimate_error(
        self,
        model: nn.Module,
        x: torch.Tensor,
        t: torch.Tensor,
        conditioning: Optional[torch.Tensor],
        dt: float,
    ) -> float:
        """Estimate local truncation error"""
        with torch.no_grad():
            # First-order prediction
            pred1 = model(x, t, conditioning)
            x_temp = x - pred1 * dt

            # Second-order prediction
            t_temp = t - dt
            pred2 = model(x_temp, t_temp, conditioning)

            # Error estimate
            error = torch.abs(pred2 - pred1).mean().item()

        return error

    def sample(
        self,
        model: nn.Module,
        shape: tuple,
        conditioning: Optional[torch.Tensor] = None,
        progress_callback: Optional[Callable] = None,
    ) -> torch.Tensor:
        """
        Generate samples with adaptive step sizing

        Args:
            model: Denoising model
            shape: Output shape
            conditioning: Optional conditioning
            progress_callback: Optional callback

        Returns:
            Generated samples
        """
        # cSpell:ignore Denoising
        device = next(model.parameters()).device

        # Start from noise
        x = torch.randn(shape, device=device)

        t = float(self.num_timesteps - 1)
        steps_taken = 0
        dt = (self.num_timesteps - 1) / self.min_steps  # Initial step size

        pbar = tqdm(total=self.num_timesteps, desc="Adaptive sampling")

        while t > 0 and steps_taken < self.max_steps:
            # Estimate error for current step size
            t_tensor = torch.tensor([t], device=device).float()
            error = self._estimate_error(model, x, t_tensor, conditioning, dt)

            # Adjust step size based on error
            if error > self.tolerance:
                dt = dt * 0.5  # Reduce step size
                continue
            elif error < self.tolerance * 0.1:
                dt = min(dt * 1.5, t)  # Increase step size

            # Take step
            with torch.no_grad():
                t_input = t_tensor.expand(shape[0])
                pred = model(x, t_input, conditioning)

            x = x - pred * dt
            t = max(t - dt, 0)
            steps_taken += 1

            pbar.update(dt)

            if progress_callback:
                progress_callback(steps_taken, self.max_steps)

        pbar.close()

        print(f"  Adaptive sampling completed in {steps_taken} steps")

        return x


class PLMS:
    """
    Pseudo Linear Multi-Step sampler

    Fast high-order sampler using linear multi-step method
    """

    def __init__(self, num_timesteps: int = 1000, beta_schedule: str = "cosine"):
        self.num_timesteps = num_timesteps

        # Compute noise schedule
        if beta_schedule == "cosine":
            self.alphas_cumprod = self._cosine_schedule(num_timesteps)
        else:
            betas = torch.linspace(0.0001, 0.02, num_timesteps)
            alphas = 1.0 - betas
            self.alphas_cumprod = torch.cumprod(alphas, dim=0)

    def _cosine_schedule(self, timesteps: int, s: float = 0.008) -> torch.Tensor:
        """Cosine noise schedule"""
        steps = timesteps + 1
        x = torch.linspace(0, timesteps, steps)
        alphas_cumprod = torch.cos(((x / timesteps) + s) / (1 + s) * np.pi * 0.5) ** 2
        alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
        return alphas_cumprod[:-1]

    def sample(
        self,
        model: nn.Module,
        shape: tuple,
        num_steps: int = 50,
        conditioning: Optional[torch.Tensor] = None,
        progress_callback: Optional[Callable] = None,
    ) -> torch.Tensor:
        """
        Generate samples using PLMS

        Args:
            model: Denoising model
            shape: Output shape
            num_steps: Number of steps
            conditioning: Optional conditioning
            progress_callback: Optional callback

        Returns:
            Generated samples
        """
        device = next(model.parameters()).device

        # Start from noise
        # cSpell:ignore randn
        x = torch.randn(shape, device=device)

        # Time schedule
        timesteps = torch.linspace(
            self.num_timesteps - 1, 0, num_steps + 1, device=device
        ).long()

        # Store old predictions for multi-step
        # cSpell:ignore preds
        old_preds = []

        # Prefetch first timestep to GPU
        if num_steps > 0:
            timesteps = timesteps.pin_memory() if timesteps.device.type == 'cpu' else timesteps

        for i in tqdm(range(num_steps), desc="PLMS sampling"):
            t = timesteps[i]
            t_next = (
                timesteps[i + 1]
                if i < num_steps - 1
                else torch.tensor(0, device=device)
            )

            # Get model prediction with prefetch
            with torch.no_grad():
                t_input = t.float().view(1).expand(shape[0])
                pred = model(x, t_input, conditioning)

                # Prefetch next timestep
                if i < num_steps - 1:
                    _ = timesteps[i + 1]

            old_preds.append(pred)

            # Apply multi-step formula
            if len(old_preds) == 1:
                # First step: Euler
                x_next = self._euler_step(x, pred, t, t_next)
            elif len(old_preds) == 2:
                # Second step: 2nd order
                x_next = self._plms_step_2(x, old_preds, t, t_next)
            elif len(old_preds) == 3:
                # Third step: 3rd order
                x_next = self._plms_step_3(x, old_preds, t, t_next)
            else:
                # Fourth step and beyond: 4th order
                x_next = self._plms_step_4(x, old_preds, t, t_next)

            x = x_next

            # Keep only last 4 predictions
            if len(old_preds) > 4:
                old_preds.pop(0)

            if progress_callback:
                progress_callback(i + 1, num_steps)

        return x

    def _euler_step(
        self, x: torch.Tensor, pred: torch.Tensor, t: torch.Tensor, t_next: torch.Tensor
    ) -> torch.Tensor:
        """Euler step"""
        alpha_t = self.alphas_cumprod[t]
        alpha_next = self.alphas_cumprod[t_next]

        x_0_pred = (x - torch.sqrt(1 - alpha_t) * pred) / torch.sqrt(alpha_t)
        x_next = torch.sqrt(alpha_next) * x_0_pred + torch.sqrt(1 - alpha_next) * pred

        return x_next

    def _plms_step_2(
        self,
        x: torch.Tensor,
        old_preds: List[torch.Tensor],
        t: torch.Tensor,
        t_next: torch.Tensor,
    ) -> torch.Tensor:
        """2nd order PLMS step"""
        pred = (3 * old_preds[-1] - old_preds[-2]) / 2
        return self._euler_step(x, pred, t, t_next)

    def _plms_step_3(
        self,
        x: torch.Tensor,
        old_preds: List[torch.Tensor],
        t: torch.Tensor,
        t_next: torch.Tensor,
    ) -> torch.Tensor:
        """3rd order PLMS step"""
        pred = (23 * old_preds[-1] - 16 * old_preds[-2] + 5 * old_preds[-3]) / 12
        return self._euler_step(x, pred, t, t_next)

    def _plms_step_4(
        self,
        x: torch.Tensor,
        old_preds: List[torch.Tensor],
        t: torch.Tensor,
        t_next: torch.Tensor,
    ) -> torch.Tensor:
        """4th order PLMS step"""
        # Adams-Bashforth 4th order coefficients
        # cSpell:ignore Bashforth
        coef_1 = 55 * old_preds[-1]
        coef_2 = -59 * old_preds[-2]
        coef_3 = 37 * old_preds[-3]
        coef_4 = -9 * old_preds[-4]
        pred = (coef_1 + coef_2 + coef_3 + coef_4) / 24
        return self._euler_step(x, pred, t, t_next)

    def map(self, fn: Callable, tensors: List[torch.Tensor]) -> List[torch.Tensor]:
        """Apply function to list of tensors"""
        return [fn(t) for t in tensors]


# ============================================================================
# Sampler Factory
# ============================================================================


def create_sampler(sampler_type: str = "dpm", num_timesteps: int = 1000, **kwargs):
    """
    Factory function to create samplers

    Args:
        sampler_type: 'dpm', 'euler', 'adaptive', 'plms'
        num_timesteps: Number of diffusion timesteps
        **kwargs: Additional sampler-specific arguments

    Returns:
        Sampler instance
    """
    # cSpell:ignore plms
    if sampler_type == "dpm":
        return DPMSolverPlusPlus(num_timesteps=num_timesteps, **kwargs)
    elif sampler_type == "euler":
        return EulerAncestralSampler(num_timesteps=num_timesteps, **kwargs)
    elif sampler_type == "adaptive":
        return AdaptiveSampler(num_timesteps=num_timesteps, **kwargs)
    elif sampler_type == "plms":
        return PLMS(num_timesteps=num_timesteps, **kwargs)
    else:
        raise ValueError(f"Unknown sampler type: {sampler_type}")
