"""
Model Checkpointing and Optimization
Version control, checkpoint management, and performance optimization

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import torch
import torch.nn as nn
from typing import Dict, Optional, Any
import os
import json
from datetime import datetime
from pathlib import Path


class ModelCheckpointer:
    """
    Manage model checkpoints with versioning
    
    Features:
    - Save/load model states
    - Version tracking
    - Automatic checkpoint cleanup
    - Metadata storage
    - Resume training support
    """
    
    def __init__(self, checkpoint_dir: str = "./checkpoints"):
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        self.metadata_file = self.checkpoint_dir / "metadata.json"
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> dict:
        """Load checkpoint metadata"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {"checkpoints": {}, "latest": None}
    
    def _save_metadata(self):
        """Save checkpoint metadata"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def save_checkpoint(
        self,
        model: nn.Module,
        version: str,
        optimizer: Optional[torch.optim.Optimizer] = None,
        epoch: Optional[int] = None,
        loss: Optional[float] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Save model checkpoint
        
        Args:
            model: Model to save
            version: Version identifier (e.g., "v1.0.0")
            optimizer: Optional optimizer state
            epoch: Training epoch
            loss: Training loss
            extra_data: Additional data to save
        
        Returns:
            Path to saved checkpoint
        """
        checkpoint_path = self.checkpoint_dir / f"{version}.pt"
        
        checkpoint = {
            'version': version,
            'timestamp': datetime.utcnow().isoformat(),
            'model_state_dict': model.state_dict(),
            'model_config': {
                'architecture': model.__class__.__name__,
                'parameters': sum(p.numel() for p in model.parameters())
            }
        }
        
        if optimizer is not None:
            checkpoint['optimizer_state_dict'] = optimizer.state_dict()
        
        if epoch is not None:
            checkpoint['epoch'] = epoch
        
        if loss is not None:
            checkpoint['loss'] = loss
        
        if extra_data is not None:
            checkpoint['extra_data'] = extra_data
        
        # Save checkpoint
        torch.save(checkpoint, checkpoint_path)
        
        # Update metadata
        self.metadata['checkpoints'][version] = {
            'path': str(checkpoint_path),
            'timestamp': checkpoint['timestamp'],
            'epoch': epoch,
            'loss': loss,
            'size_mb': checkpoint_path.stat().st_size / (1024 * 1024)
        }
        self.metadata['latest'] = version
        self._save_metadata()
        
        print(f"✅ Checkpoint saved: {checkpoint_path}")
        return str(checkpoint_path)
    
    def load_checkpoint(
        self,
        version: Optional[str] = None,
        model: Optional[nn.Module] = None,
        optimizer: Optional[torch.optim.Optimizer] = None,
        device: str = "cpu"
    ) -> Dict[str, Any]:
        """
        Load model checkpoint
        
        Args:
            version: Version to load (None = latest)
            model: Model to load state into
            optimizer: Optimizer to load state into
            device: Device to load to
        
        Returns:
            Checkpoint dictionary
        """
        if version is None:
            version = self.metadata.get('latest')
            if version is None:
                raise ValueError("No checkpoints found")
        
        checkpoint_path = self.checkpoint_dir / f"{version}.pt"
        
        if not checkpoint_path.exists():
            raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")
        
        print(f"📥 Loading checkpoint: {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location=device)
        
        if model is not None:
            model.load_state_dict(checkpoint['model_state_dict'])
            print(f"   ✅ Model state loaded")
        
        if optimizer is not None and 'optimizer_state_dict' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            print(f"   ✅ Optimizer state loaded")
        
        return checkpoint
    
    def list_checkpoints(self) -> list:
        """List all available checkpoints"""
        return list(self.metadata['checkpoints'].keys())
    
    def get_latest_checkpoint(self) -> Optional[str]:
        """Get latest checkpoint version"""
        return self.metadata.get('latest')
    
    def delete_checkpoint(self, version: str):
        """Delete a specific checkpoint"""
        if version in self.metadata['checkpoints']:
            checkpoint_path = Path(self.metadata['checkpoints'][version]['path'])
            if checkpoint_path.exists():
                checkpoint_path.unlink()
            del self.metadata['checkpoints'][version]
            if self.metadata['latest'] == version:
                self.metadata['latest'] = None
            self._save_metadata()
            print(f"🗑️  Checkpoint deleted: {version}")
    
    def cleanup_old_checkpoints(self, keep_latest: int = 5):
        """Keep only the N most recent checkpoints"""
        checkpoints = sorted(
            self.metadata['checkpoints'].items(),
            key=lambda x: x[1]['timestamp'],
            reverse=True
        )
        
        for version, _ in checkpoints[keep_latest:]:
            self.delete_checkpoint(version)


class MixedPrecisionTrainer:
    """
    Mixed precision training support (FP16/BF16)
    
    Features:
    - Automatic mixed precision with torch.cuda.amp
    - Gradient scaling
    - Memory efficiency
    """
    
    def __init__(self, enabled: bool = True, dtype: str = "float16"):
        self.enabled = enabled and torch.cuda.is_available()
        
        if dtype == "bfloat16" and torch.cuda.is_bf16_supported():
            self.dtype = torch.bfloat16
        else:
            self.dtype = torch.float16
        
        if self.enabled:
            self.scaler = torch.cuda.amp.GradScaler()
            print(f"✅ Mixed precision training enabled ({dtype})")
        else:
            self.scaler = None
            print("⚠️  Mixed precision training disabled")
    
    def autocast(self):
        """Get autocast context manager"""
        if self.enabled:
            return torch.cuda.amp.autocast(dtype=self.dtype)
        else:
            from contextlib import nullcontext
            return nullcontext()
    
    def scale_loss(self, loss: torch.Tensor) -> torch.Tensor:
        """Scale loss for backward pass"""
        if self.scaler:
            return self.scaler.scale(loss)
        return loss
    
    def step(self, optimizer: torch.optim.Optimizer):
        """Perform optimizer step with gradient scaling"""
        if self.scaler:
            self.scaler.step(optimizer)
            self.scaler.update()
        else:
            optimizer.step()
    
    def state_dict(self) -> dict:
        """Get scaler state dict"""
        if self.scaler:
            return self.scaler.state_dict()
        return {}
    
    def load_state_dict(self, state_dict: dict):
        """Load scaler state dict"""
        if self.scaler and state_dict:
            self.scaler.load_state_dict(state_dict)


class ModelOptimizer:
    """
    Model optimization utilities
    
    Features:
    - Gradient checkpointing
    - Model compilation (torch.compile)
    - Memory profiling
    - Inference optimization
    """
    
    @staticmethod
    def enable_gradient_checkpointing(model: nn.Module):
        """Enable gradient checkpointing to save memory"""
        if hasattr(model, 'gradient_checkpointing_enable'):
            model.gradient_checkpointing_enable()
            print("✅ Gradient checkpointing enabled")
        else:
            print("⚠️  Model does not support gradient checkpointing")
    
    @staticmethod
    def compile_model(
        model: nn.Module,
        mode: str = "default",
        fullgraph: bool = False
    ) -> nn.Module:
        """
        Compile model with torch.compile for faster execution
        
        Args:
            mode: Optimization mode ('default', 'reduce-overhead', 'max-autotune')
            fullgraph: Whether to require full graph compilation
        """
        if hasattr(torch, 'compile'):
            compiled = torch.compile(model, mode=mode, fullgraph=fullgraph)
            print(f"✅ Model compiled with mode: {mode}")
            return compiled
        else:
            print("⚠️  torch.compile not available (requires PyTorch 2.0+)")
            return model
    
    @staticmethod
    def optimize_for_inference(model: nn.Module) -> nn.Module:
        """Optimize model for inference"""
        model.eval()
        
        # Disable gradient computation
        for param in model.parameters():
            param.requires_grad = False
        
        # Fuse operations where possible
        if hasattr(torch, 'jit'):
            try:
                model = torch.jit.optimize_for_inference(torch.jit.script(model))
                print("✅ Model optimized for inference")
            except:
                print("⚠️  Could not JIT-optimize model")
        
        return model
    
    @staticmethod
    def get_memory_stats(model: nn.Module) -> dict:
        """Get model memory statistics"""
        total_params = sum(p.numel() for p in model.parameters())
        trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
        
        # Estimate memory (assuming float32)
        param_memory = total_params * 4 / (1024 ** 2)  # MB
        
        stats = {
            'total_parameters': total_params,
            'trainable_parameters': trainable_params,
            'memory_mb': param_memory,
            'memory_gb': param_memory / 1024
        }
        
        # GPU memory if available
        if torch.cuda.is_available():
            stats['gpu_allocated_mb'] = torch.cuda.memory_allocated() / (1024 ** 2)
            stats['gpu_reserved_mb'] = torch.cuda.memory_reserved() / (1024 ** 2)
        
        return stats
    
    @staticmethod
    def profile_model(
        model: nn.Module,
        input_shape: tuple,
        device: str = "cuda"
    ) -> dict:
        """
        Profile model performance
        
        Args:
            model: Model to profile
            input_shape: Input tensor shape (B, C, H, W)
            device: Device to profile on
        """
        import time
        
        model = model.to(device).eval()
        dummy_input = torch.randn(input_shape, device=device)
        
        # Warmup
        with torch.no_grad():
            for _ in range(10):
                _ = model(dummy_input)
        
        # Profile
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        
        start = time.time()
        with torch.no_grad():
            for _ in range(100):
                _ = model(dummy_input)
        
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        
        elapsed = time.time() - start
        avg_time = elapsed / 100
        
        return {
            'avg_inference_time_ms': avg_time * 1000,
            'throughput_fps': 1.0 / avg_time,
            'total_time_s': elapsed
        }


class EMAModel:
    """
    Exponential Moving Average of model weights
    
    Improves model stability and performance
    """
    
    def __init__(
        self,
        model: nn.Module,
        decay: float = 0.9999,
        device: Optional[str] = None
    ):
        self.model = model
        self.decay = decay
        self.device = device if device else next(model.parameters()).device
        
        # Create EMA copy of model parameters
        self.ema_params = {
            name: param.clone().detach()
            for name, param in model.named_parameters()
            if param.requires_grad
        }
    
    def update(self):
        """Update EMA parameters"""
        with torch.no_grad():
            for name, param in self.model.named_parameters():
                if param.requires_grad and name in self.ema_params:
                    self.ema_params[name].mul_(self.decay).add_(
                        param.data, alpha=1 - self.decay
                    )
    
    def apply_ema(self):
        """Apply EMA parameters to model (for inference)"""
        backup = {}
        for name, param in self.model.named_parameters():
            if name in self.ema_params:
                backup[name] = param.data.clone()
                param.data.copy_(self.ema_params[name])
        return backup
    
    def restore_original(self, backup: dict):
        """Restore original parameters"""
        for name, param in self.model.named_parameters():
            if name in backup:
                param.data.copy_(backup[name])
    
    def state_dict(self) -> dict:
        """Get EMA state dict"""
        return {
            'decay': self.decay,
            'ema_params': self.ema_params
        }
    
    def load_state_dict(self, state_dict: dict):
        """Load EMA state dict"""
        self.decay = state_dict['decay']
        self.ema_params = state_dict['ema_params']


# ============================================================================
# Utility Functions
# ============================================================================

def quantize_model(model: nn.Module, dtype: str = "int8") -> nn.Module:
    """
    Quantize model for faster inference and smaller size
    
    Args:
        model: Model to quantize
        dtype: Quantization data type ('int8', 'float16')
    """
    model.eval()
    
    if dtype == "int8":
        quantized = torch.quantization.quantize_dynamic(
            model,
            {nn.Linear, nn.Conv2d, nn.Conv3d},
            dtype=torch.qint8
        )
        print("✅ Model quantized to INT8")
        return quantized
    
    elif dtype == "float16":
        model = model.half()
        print("✅ Model converted to FP16")
        return model
    
    else:
        raise ValueError(f"Unknown quantization dtype: {dtype}")


def prune_model(model: nn.Module, amount: float = 0.3) -> nn.Module:
    """
    Prune model weights (structured pruning)
    
    Args:
        model: Model to prune
        amount: Fraction of parameters to prune (0.0-1.0)
    """
    import torch.nn.utils.prune as prune
    
    parameters_to_prune = []
    for module in model.modules():
        if isinstance(module, (nn.Linear, nn.Conv2d, nn.Conv3d)):
            parameters_to_prune.append((module, 'weight'))
    
    prune.global_unstructured(
        parameters_to_prune,
        pruning_method=prune.L1Unstructured,
        amount=amount,
    )
    
    # Make pruning permanent
    for module, name in parameters_to_prune:
        prune.remove(module, name)
    
    print(f"✅ Model pruned by {amount*100}%")
    return model


def export_to_onnx(
    model: nn.Module,
    output_path: str,
    input_shape: tuple,
    opset_version: int = 14
):
    """
    Export model to ONNX format
    
    Args:
        model: Model to export
        output_path: Output ONNX file path
        input_shape: Input tensor shape
        opset_version: ONNX opset version
    """
    model.eval()
    dummy_input = torch.randn(input_shape)
    
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=opset_version,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"✅ Model exported to ONNX: {output_path}")


def benchmark_model(
    model: nn.Module,
    input_shapes: list,
    device: str = "cuda",
    iterations: int = 100
) -> dict:
    """
    Benchmark model performance across different input sizes
    
    Args:
        model: Model to benchmark
        input_shapes: List of input shapes to test
        device: Device to benchmark on
        iterations: Number of iterations per shape
    
    Returns:
        Benchmark results dictionary
    """
    import time
    
    model = model.to(device).eval()
    results = {}
    
    for shape in input_shapes:
        shape_key = 'x'.join(map(str, shape))
        dummy_input = torch.randn(shape, device=device)
        
        # Warmup
        with torch.no_grad():
            for _ in range(10):
                _ = model(dummy_input)
        
        # Benchmark
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        
        start = time.time()
        with torch.no_grad():
            for _ in range(iterations):
                _ = model(dummy_input)
        
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        
        elapsed = time.time() - start
        avg_time = elapsed / iterations
        
        results[shape_key] = {
            'shape': shape,
            'avg_time_ms': avg_time * 1000,
            'fps': 1.0 / avg_time,
            'memory_mb': torch.cuda.max_memory_allocated() / (1024 ** 2) if torch.cuda.is_available() else 0
        }
        
        print(f"  {shape_key}: {avg_time*1000:.2f}ms, {1.0/avg_time:.1f} FPS")
    
    return results
