#!/usr/bin/env python3
"""
Automatic Dependency Installer for Video Generation Service
Handles PyTorch installation with CUDA support detection

Author: HOOTNER Code Guardian
"""

import subprocess
import sys
import platform
import os


def run_command(cmd):
    """Run shell command and return output"""
    try:
        # Validate command to prevent command injection
        if not isinstance(cmd, str) or any(c in cmd for c in [';', '|', '&', '`', '$']):
            return None
        
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, check=True, timeout=30
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None


def check_cuda():
    """Check if CUDA is available"""
    print("🔍 Checking for CUDA...")

    # Check nvidia-smi
    cuda_version = run_command(
        "nvidia-smi --query-gpu=driver_version --format=csv,noheader"
    )

    if cuda_version:
        print(f"✅ CUDA detected: Driver {cuda_version}")
        return True
    else:
        print("⚠️  No CUDA found - will install CPU-only PyTorch")
        return False


def install_pytorch(has_cuda):
    """Install PyTorch with appropriate backend"""
    print("\n📦 Installing PyTorch...")

    if has_cuda:
        # CUDA 11.8 (most compatible)
        cmd = [sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/cu118"]
    else:
        # CPU only
        cmd = [sys.executable, "-m", "pip", "install", "torch", "torchvision", "torchaudio", "--index-url", "https://download.pytorch.org/whl/cpu"]

    print(f"   Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("✅ PyTorch installed successfully")
    else:
        print("❌ PyTorch installation failed")
        sys.exit(1)


def install_requirements():
    """Install remaining dependencies"""
    print("\n📦 Installing remaining dependencies...")

    packages = ["transformers", "pillow", "imageio", "imageio-ffmpeg", "opencv-python", "flask", "flask-cors", "werkzeug", "numpy", "tqdm"]
    cmd = [sys.executable, "-m", "pip", "install"] + packages
    print(f"   Running: {' '.join(cmd)}")

    result = subprocess.run(cmd)

    if result.returncode == 0:
        print("✅ Dependencies installed successfully")
    else:
        print("❌ Dependency installation failed")
        sys.exit(1)


def verify_installation():
    """Verify PyTorch installation"""
    print("\n🧪 Verifying installation...")

    try:
        import torch

        print(f"   PyTorch version: {torch.__version__}")
        print(f"   CUDA available: {torch.cuda.is_available()}")

        if torch.cuda.is_available():
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   GPU count: {torch.cuda.device_count()}")
            if torch.cuda.device_count() > 0:
                print(f"   GPU 0: {torch.cuda.get_device_name(0)}")

        print("✅ Installation verified")
        return True

    except ImportError as e:
        print(f"❌ Verification failed: {e}")
        return False


def main():
    print("=" * 60)
    print("🦉 HOOTNER Video Generation Service")
    print("   Automatic Dependency Installer")
    print("=" * 60)
    print(f"\n🖥️  System: {platform.system()} {platform.machine()}")
    print(f"🐍 Python: {sys.version.split()[0]}")

    # Check Python version
    if sys.version_info < (3, 8):
        print("\n❌ Python 3.8+ required")
        sys.exit(1)

    # Check CUDA
    has_cuda = check_cuda()

    # Install PyTorch
    install_pytorch(has_cuda)

    # Install other dependencies
    install_requirements()

    # Verify
    if verify_installation():
        print("\n" + "=" * 60)
        print("✅ Installation Complete!")
        print("\n📚 Next steps:")
        print("   1. Test generation: python generator.py")
        print("   2. Start API server: python api.py")
        print("   3. Access API: http://localhost:5003/health")
        print("=" * 60 + "\n")
    else:
        print("\n❌ Installation verification failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
