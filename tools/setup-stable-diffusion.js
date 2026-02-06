#!/usr/bin/env node

/**
 * HOOTNER Stable Diffusion Training Setup
 * Properly configures and launches SD training on AWS
 */

import 'dotenv/config';

import { S3Client, CreateBucketCommand, PutBucketPolicyCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { EC2Client, DescribeInstancesCommand, RunInstancesCommand } from '@aws-sdk/client-ec2';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class StableDiffusionSetup {
  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.bucketName = process.env.TRAINING_DATA_BUCKET || process.env.UPLOAD_BUCKET || process.env.VIDEO_BUCKET;
    this.s3 = new S3Client({ region: this.region });
    this.ec2 = new EC2Client({ region: this.region });
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');

    if (!this.bucketName) {
      console.log('❌ No S3 bucket configured for training. Set TRAINING_DATA_BUCKET (or UPLOAD_BUCKET/VIDEO_BUCKET) in .env');
      return false;
    }

    // Check AWS credentials
    try {
      await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucketName, MaxKeys: 1 }));
      console.log('✅ AWS credentials working');
      console.log(`✅ S3 bucket accessible: ${this.bucketName}`);
    } catch (error) {
      console.log('❌ AWS credentials or S3 access issue:', error.message);
      return false;
    }

    // Check training files exist
    const requiredFiles = [
      'aws_training_config.json',
      'launch_aws_training.py',
      'aws_train_sd.py',
      'training_prompts.json'
    ];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        console.log(`✅ Found: ${file}`);
      } else {
        console.log(`❌ Missing: ${file}`);
        return false;
      }
    }

    return true;
  }

  async updateConfig() {
    console.log('\n🔧 Updating training configuration...');

    const configPath = 'aws_training_config.json';
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    // Update bucket name to match existing bucket
    config.s3_bucket = this.bucketName;
    config.s3_data_prefix = 'training-data/images/';
    config.s3_output_prefix = 'trained-models/stable-diffusion/';

    // Optimize for cost and reliability
    config.aws.instance_type = 'g4dn.xlarge'; // Good balance of cost/performance
    config.epochs = 5; // Reduce for faster training
    config.batch_size = 1; // Safe for memory
    config.learning_rate = 1e-5; // Conservative learning rate

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ Updated aws_training_config.json');
    console.log(`   - Bucket: ${config.s3_bucket}`);
    console.log(`   - Instance: ${config.aws.instance_type}`);
    console.log(`   - Epochs: ${config.epochs}`);
  }

  async setupS3Structure() {
    console.log('\n📦 Setting up S3 structure...');

    const folders = [
      'training-data/images/',
      'training-data/prompts/',
      'trained-models/stable-diffusion/',
      'logs/training/'
    ];

    for (const folder of folders) {
      try {
        // Create folder by uploading a placeholder file
        await this.s3.send(new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${folder}.placeholder`,
          Body: 'Placeholder file for folder structure'
        }));
        console.log(`✅ Created: s3://${this.bucketName}/${folder}`);
      } catch (error) {
        console.log(`⚠️  Could not create ${folder}:`, error.message);
      }
    }
  }

  async uploadTrainingFiles() {
    console.log('\n⬆️  Uploading training scripts to S3...');

    const filesToUpload = [
      { local: 'aws_train_sd.py', s3Key: 'scripts/aws_train_sd.py' },
      { local: 'aws_training_config.json', s3Key: 'scripts/aws_training_config.json' },
      { local: 'training_prompts.json', s3Key: 'scripts/training_prompts.json' },
      { local: 'setup_aws_training.sh', s3Key: 'scripts/setup_aws_training.sh' }
    ];

    for (const file of filesToUpload) {
      try {
        if (existsSync(file.local)) {
          const content = readFileSync(file.local);
          await this.s3.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: file.s3Key,
            Body: content
          }));
          console.log(`✅ Uploaded: ${file.local} → s3://${this.bucketName}/${file.s3Key}`);
        } else {
          console.log(`⚠️  File not found: ${file.local}`);
        }
      } catch (error) {
        console.log(`❌ Failed to upload ${file.local}:`, error.message);
      }
    }
  }

  async createLaunchScript() {
    console.log('\n📝 Creating improved launch script...');

    const launchScript = `#!/usr/bin/env python3
"""
Improved Stable Diffusion Training Launcher
With better error handling and monitoring
"""

import boto3
import json
import time
import sys
from datetime import datetime

def main():
    print("🦉 HOOTNER Stable Diffusion Training Launcher")
    print("=" * 50)

    # Load config
    with open('aws_training_config.json', 'r') as f:
        config = json.load(f)

    print(f"📋 Configuration:")
    print(f"   Bucket: {config['s3_bucket']}")
    print(f"   Instance: {config['aws']['instance_type']}")
    print(f"   Epochs: {config['epochs']}")
    print(f"   Estimated cost: $1-3 for basic training")
    print()

    # Confirm launch
    response = input("🚀 Launch training instance? (y/N): ")
    if response.lower() != 'y':
        print("❌ Training cancelled")
        return

    # Launch instance
    ec2 = boto3.client('ec2', region_name=config['aws']['region'])

    user_data = f'''#!/bin/bash
# Enhanced setup script
cd /home/ubuntu
echo "🔧 Setting up training environment..." > /tmp/setup.log

# Install dependencies
apt-get update >> /tmp/setup.log 2>&1
apt-get install -y python3-pip git awscli >> /tmp/setup.log 2>&1

# Download training files
aws s3 cp s3://{config['s3_bucket']}/scripts/ . --recursive >> /tmp/setup.log 2>&1

# Install Python packages
pip3 install torch torchvision diffusers transformers accelerate >> /tmp/setup.log 2>&1

# Set permissions
chown -R ubuntu:ubuntu /home/ubuntu/
chmod +x *.sh

echo "✅ Setup complete" >> /tmp/setup.log
echo "🚀 Ready for training" >> /tmp/setup.log
'''

    try:
        response = ec2.run_instances(
            ImageId='ami-0c02fb55956c7d316',  # Ubuntu 20.04 LTS
            InstanceType=config['aws']['instance_type'],
            MinCount=1,
            MaxCount=1,
            UserData=user_data,
            TagSpecifications=[{{
                'ResourceType': 'instance',
                'Tags': [
                    {{'Key': 'Name', 'Value': f'hootner-sd-training-{{datetime.now().strftime("%Y%m%d-%H%M%S")}}'}},
                    {{'Key': 'Purpose', 'Value': 'StableDiffusion-Training'}},
                    {{'Key': 'Project', 'Value': 'HOOTNER'}}
                ]
            }}]
        )

        instance_id = response['Instances'][0]['InstanceId']
        print(f"✅ Instance launched: {{instance_id}}")
        print(f"⏳ Waiting for instance to start...")

        # Wait for running state
        waiter = ec2.get_waiter('instance_running')
        waiter.wait(InstanceIds=[instance_id])

        # Get public IP
        instances = ec2.describe_instances(InstanceIds=[instance_id])
        public_ip = instances['Reservations'][0]['Instances'][0].get('PublicIpAddress')

        print(f"✅ Instance is running!")
        print(f"🌐 Public IP: {{public_ip}}")
        print()
        print("📋 Next steps:")
        print("1. Wait 5-10 minutes for setup to complete")
        print("2. Upload your training images:")
        print(f"   aws s3 sync ./training-images/ s3://{config['s3_bucket']}/training-data/images/")
        print("3. SSH into instance and start training:")
        print(f"   ssh -i ~/.ssh/your-key.pem ubuntu@{{public_ip}}")
        print("   python3 aws_train_sd.py --config aws_training_config.json")
        print()
        print(f"💾 Instance ID: {{instance_id}} (save this!)")

    except Exception as e:
        print(f"❌ Failed to launch instance: {{e}}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`;

    writeFileSync('launch_training_improved.py', launchScript);
    console.log('✅ Created launch_training_improved.py');
  }

  async generateInstructions() {
    console.log('\n📋 Generating step-by-step instructions...');

    const instructions = `# 🦉 HOOTNER Stable Diffusion Training Guide

## Prerequisites ✅
- AWS account with GPU quota (g4dn.xlarge)
- Training images (10-100 images recommended)
- AWS CLI configured

## Step 1: Prepare Training Images
\`\`\`bash
# Create training images folder
mkdir -p training-images

# Add your images to training-images/ folder
# Supported formats: .jpg, .png, .webp
# Recommended: 512x512 pixels, 10-100 images
\`\`\`

## Step 2: Upload Images to S3
\`\`\`bash
aws s3 sync training-images/ s3://${this.bucketName}/training-data/images/
\`\`\`

## Step 3: Launch Training Instance
\`\`\`bash
python3 launch_training_improved.py
\`\`\`

## Step 4: Monitor Training
\`\`\`bash
# SSH into the instance (use IP from step 3)
ssh -i ~/.ssh/your-key.pem ubuntu@<PUBLIC_IP>

# Check setup logs
tail -f /tmp/setup.log

# Start training when setup is complete
python3 aws_train_sd.py --config aws_training_config.json
\`\`\`

## Step 5: Download Trained Model
\`\`\`bash
# After training completes, download the model
aws s3 sync s3://${this.bucketName}/trained-models/stable-diffusion/ ./trained-models/
\`\`\`

## Cost Estimate 💰
- g4dn.xlarge: ~$0.526/hour
- Training time: 2-6 hours
- Total cost: $1-3 for basic training

## Troubleshooting 🔧
- Check setup logs: \`tail -f /tmp/setup.log\`
- Monitor training: \`tail -f training.log\`
- Check GPU usage: \`nvidia-smi\`
- Instance not starting: Check AWS quotas/limits

## Alternative Options
1. **Google Colab**: Free GPU, but limited time
2. **Hugging Face Spaces**: Free tier available
3. **Local Training**: If you have a GPU (RTX 3060+ recommended)

## Support
- Check AWS CloudWatch logs
- Review S3 bucket contents
- Monitor EC2 instance status
`;

    writeFileSync('STABLE_DIFFUSION_TRAINING_GUIDE.md', instructions);
    console.log('✅ Created STABLE_DIFFUSION_TRAINING_GUIDE.md');
  }

  async run() {
    console.log('🦉 HOOTNER Stable Diffusion Training Setup\n');

    const prereqsOk = await this.checkPrerequisites();
    if (!prereqsOk) {
      console.log('\n❌ Prerequisites not met. Please fix the issues above.');
      return;
    }

    await this.updateConfig();
    await this.setupS3Structure();
    await this.uploadTrainingFiles();
    await this.createLaunchScript();
    await this.generateInstructions();

    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Read: STABLE_DIFFUSION_TRAINING_GUIDE.md');
    console.log('2. Add training images to training-images/ folder');
    console.log('3. Run: python3 launch_training_improved.py');
    console.log('\n💡 Tip: Start with 10-20 images for your first training run');
  }
}

// Add missing import
import { PutObjectCommand } from '@aws-sdk/client-s3';

const setup = new StableDiffusionSetup();
setup.run().catch(console.error);
