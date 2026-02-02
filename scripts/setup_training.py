"""
Manual AWS Stable Diffusion Training Setup
Run this script on an AWS EC2 GPU instance
"""

import subprocess
import os
import sys

def setup_environment():
    """Setup Python environment for training"""
    print("🔧 Setting up training environment...")

    commands = [
        "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118",
        "pip install diffusers==0.21.4",
        "pip install transformers==4.35.0",
        "pip install accelerate==0.24.1",
        "pip install xformers==0.0.22",
        "pip install boto3==1.29.0",
        "pip install Pillow==10.0.1",
        "pip install safetensors==0.4.0",
        "pip install ftfy==6.1.1"
    ]

    for cmd in commands:
        print(f"Running: {cmd}")
        result = subprocess.run(cmd.split(), capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
        else:
            print("✅ Success")

def download_training_files():
    """Download training files from S3"""
    print("📥 Downloading training files from S3...")

    files = [
        "aws_train_sd.py",
        "aws_training_config.json",
        "training_prompts.json"
    ]

    for file in files:
        cmd = f"aws s3 cp s3://hootner-uploads-504165876439/{file} ."
        print(f"Downloading: {file}")
        result = subprocess.run(cmd.split(), capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Downloaded {file}")
        else:
            print(f"❌ Failed to download {file}: {result.stderr}")

def check_gpu():
    """Check if GPU is available"""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ GPU detected: {gpu_name}")
            print(f"   CUDA version: {torch.version.cuda}")
            print(f"   PyTorch version: {torch.__version__}")
            return True
        else:
            print("❌ No GPU detected")
            return False
    except ImportError:
        print("❌ PyTorch not installed")
        return False

def main():
    print("🦉 HOOTNER AWS Stable Diffusion Training Setup")
    print("=" * 50)

    # Setup environment
    setup_environment()

    # Download files
    download_training_files()

    # Check GPU
    gpu_available = check_gpu()

    if gpu_available:
        print("\n🚀 Ready to start training!")
        print("Run: python aws_train_sd.py --config aws_training_config.json")
    else:
        print("\n⚠️  GPU not detected. Training will be very slow on CPU.")

    print("\n📋 Next steps:")
    print("1. Upload training images: aws s3 sync ./images/ s3://hootner-uploads-504165876439/training-data/images/")
    print("2. Edit training_prompts.json with your image descriptions")
    print("3. Start training: python aws_train_sd.py --config aws_training_config.json")

if __name__ == "__main__":
    main()
