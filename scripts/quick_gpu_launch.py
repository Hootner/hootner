#!/usr/bin/env python3
"""
Quick AWS GPU Training Launcher
"""

import boto3
import json
from datetime import datetime

def launch_gpu_training():
    print("🚀 Launching AWS GPU Training Instance...")
    
    ec2 = boto3.client('ec2', region_name='us-east-1')
    
    try:
        # Launch GPU instance
        response = ec2.run_instances(
            ImageId='ami-0c02fb55956c7d316',  # Ubuntu 20.04 LTS
            InstanceType='g4dn.xlarge',       # NVIDIA T4 GPU ($0.526/hour)
            MinCount=1,
            MaxCount=1,
            UserData="""#!/bin/bash
# Quick setup for training
apt-get update -y
apt-get install -y python3-pip awscli
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip3 install diffusers transformers accelerate boto3 Pillow

# Download training files
cd /home/ubuntu
aws s3 cp s3://hootner-uploads-504165876439/setup_training.py .
python3 setup_training.py
""",
            TagSpecifications=[
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {'Key': 'Name', 'Value': f'hootner-gpu-training-{datetime.now().strftime("%m%d-%H%M")}'},
                        {'Key': 'Purpose', 'Value': 'StableDiffusion-Training'},
                        {'Key': 'Cost', 'Value': '$0.50/hour'}
                    ]
                }
            ]
        )
        
        instance_id = response['Instances'][0]['InstanceId']
        print(f"✅ GPU Instance Launched: {instance_id}")
        print(f"💰 Cost: ~$0.53/hour (NVIDIA T4 GPU)")
        print(f"📍 Region: us-east-1")
        
        # Wait a moment for the instance to initialize
        print("⏳ Waiting for instance to start...")
        waiter = ec2.get_waiter('instance_running')
        waiter.wait(InstanceIds=[instance_id], WaiterConfig={'Delay': 15, 'MaxAttempts': 40})
        
        # Get instance details
        instances = ec2.describe_instances(InstanceIds=[instance_id])
        instance = instances['Reservations'][0]['Instances'][0]
        public_ip = instance.get('PublicIpAddress', 'Getting IP...')
        
        print(f"✅ Instance Running!")
        print(f"🌐 Public IP: {public_ip}")
        print(f"🔧 Setup Status: Installing dependencies (~5 minutes)")
        
        print(f"\n📋 Next Steps:")
        print(f"1. Monitor training: python launch_aws_training.py --action monitor --instance-id {instance_id}")
        print(f"2. Upload images: aws s3 sync ./training_images/ s3://hootner-uploads-504165876439/training-data/images/")
        print(f"3. SSH access: ssh -i ~/.ssh/your-key.pem ubuntu@{public_ip}")
        print(f"4. Terminate when done: python launch_aws_training.py --action terminate --instance-id {instance_id}")
        
        print(f"\n💡 Training will automatically start once setup completes!")
        
        return instance_id
        
    except Exception as e:
        print(f"❌ Launch failed: {e}")
        
        if "InvalidKeyPair" in str(e):
            print("💡 Fix: Create a key pair in AWS Console first")
        elif "UnauthorizedOperation" in str(e):
            print("💡 Fix: Add EC2 permissions to your IAM user")
        elif "InsufficientInstanceCapacity" in str(e):
            print("💡 Fix: Try a different instance type or region")
            
        return None

if __name__ == "__main__":
    instance_id = launch_gpu_training()
    
    if instance_id:
        print(f"\n💾 Save this Instance ID: {instance_id}")
        print(f"💰 Estimated training cost: $1-5 (2-10 hours)")
        print(f"🛑 Don't forget to terminate when done!")