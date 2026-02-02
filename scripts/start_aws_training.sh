#!/bin/bash
# Quick AWS Stable Diffusion Training Launcher

echo "🦉 HOOTNER - AWS Stable Diffusion Training"
echo "=========================================="
echo

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS CLI not configured. Please run: aws configure"
    exit 1
fi

# Upload training files to S3
echo "📤 Uploading training scripts to S3..."
aws s3 cp aws_train_sd.py s3://hootner-uploads-504165876439/
aws s3 cp aws_training_config.json s3://hootner-uploads-504165876439/
aws s3 cp training_prompts.json s3://hootner-uploads-504165876439/
aws s3 cp setup_aws_training.sh s3://hootner-uploads-504165876439/

echo "✅ Scripts uploaded to S3"
echo

# Create example training images directory
mkdir -p training_images
echo "📁 Created training_images/ directory"
echo "   Add your training images here, then run:"
echo "   aws s3 sync training_images/ s3://hootner-uploads-504165876439/training-data/images/"
echo

# Launch EC2 instance
echo "🚀 Options:"
echo "1. Launch GPU training instance: python launch_aws_training.py --action launch"
echo "2. Monitor training progress:    python launch_aws_training.py --action monitor --instance-id <ID>"
echo "3. Terminate instance:          python launch_aws_training.py --action terminate --instance-id <ID>"
echo

# Show current costs
echo "💰 Estimated AWS costs:"
echo "   g4dn.xlarge:  ~$0.50/hour (1x NVIDIA T4 GPU)"
echo "   p3.2xlarge:   ~$3.00/hour (1x NVIDIA V100 GPU)"
echo "   Training time: ~2-6 hours for 10 epochs"
echo

read -p "Launch GPU instance now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Launching GPU training instance..."
    python launch_aws_training.py --action launch
fi