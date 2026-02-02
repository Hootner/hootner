#!/bin/bash
# AWS EC2 GPU Instance Setup for Stable Diffusion Training

set -e

echo "🚀 Setting up AWS EC2 for Stable Diffusion Training..."

# Update system
sudo apt-get update -y
sudo apt-get install -y curl wget git

# Install NVIDIA drivers (for GPU instances)
if lspci | grep -i nvidia; then
    echo "Installing NVIDIA drivers..."
    sudo apt-get install -y nvidia-driver-535
    
    # Install CUDA
    wget https://developer.download.nvidia.com/compute/cuda/12.0.0/local_installers/cuda_12.0.0_525.60.13_linux.run
    sudo sh cuda_12.0.0_525.60.13_linux.run --silent --toolkit
    
    echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
    echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
    source ~/.bashrc
fi

# Install Python and pip
sudo apt-get install -y python3.9 python3.9-venv python3.9-dev python3-pip

# Create virtual environment
python3.9 -m venv ~/sd_training_env
source ~/sd_training_env/bin/activate

# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install required packages
pip install -r << 'EOF'
diffusers==0.21.4
transformers==4.35.0
accelerate==0.24.1
xformers==0.0.22
boto3==1.29.0
Pillow==10.0.1
torchvision==0.16.0
bitsandbytes==0.41.1
wandb==0.16.0
omegaconf==2.3.0
safetensors==0.4.0
ftfy==6.1.1
tensorboard==2.15.1
EOF

# Configure AWS CLI (if not already configured)
if ! aws configure list &>/dev/null; then
    echo "⚠️  AWS CLI not configured. Run 'aws configure' with your credentials."
fi

# Create training directory
mkdir -p ~/sd_training
cd ~/sd_training

# Download training scripts from S3
aws s3 cp s3://hootner-uploads-504165876439/training-scripts/ . --recursive

echo "✅ Setup complete!"
echo "📁 Training directory: ~/sd_training"
echo "🐍 Python environment: ~/sd_training_env"
echo ""
echo "To start training:"
echo "1. Activate environment: source ~/sd_training_env/bin/activate"
echo "2. Upload training data to S3: aws s3 sync ./images/ s3://hootner-uploads-504165876439/training-data/images/"
echo "3. Run training: python aws_train_sd.py --config aws_training_config.json"