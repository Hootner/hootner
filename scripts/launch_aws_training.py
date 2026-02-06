#!/usr/bin/env python3
"""
AWS EC2 Training Instance Launcher
Automatically provisions GPU instances for Stable Diffusion training
"""

import boto3
import json
import time
import argparse
import base64
from datetime import datetime
from pathlib import Path

class EC2TrainingLauncher:
    def __init__(self, config_file):
        self.config_path = config_file
        self.repo_root = Path(__file__).resolve().parents[1]
        with open(config_file, 'r') as f:
            self.config = json.load(f)

        self.ec2 = boto3.client('ec2', region_name=self.config['aws']['region'])
        self.s3 = boto3.client('s3')

    def get_user_data_script(self):
        """Generate user data script for EC2 instance"""
        bucket = self.config['s3_bucket']
        scripts_prefix = self.config.get('s3_scripts_prefix', 'scripts/')
        if scripts_prefix and not scripts_prefix.endswith('/'):
            scripts_prefix += '/'
        prompts_key = self.config.get('prompts_s3_key', 'training_prompts.json')
        return f"""#!/bin/bash
# Auto-setup script for SD training
cd /home/ubuntu

set -e

echo "🔧 Installing base dependencies..."
apt-get update -y
apt-get install -y python3-pip git awscli

git clone https://github.com/Hootner/hootner.git
cd hootner
chmod +x scripts/setup_aws_training.sh
chmod +x scripts/octane_unreal_render.sh

# Make setup script use the same bucket/prefix conventions
export HOOTNER_TRAINING_S3_BUCKET="{bucket}"
export HOOTNER_TRAINING_S3_SCRIPTS_PREFIX="{scripts_prefix}"

./scripts/setup_aws_training.sh

# Download training config + prompts (prefer scripts/ prefix, fallback to bucket root)
echo "⬇️  Downloading training config..."
aws s3 cp s3://{bucket}/{scripts_prefix}aws_training_config.json config/aws_training_config.json || \
    aws s3 cp s3://{bucket}/aws_training_config.json config/aws_training_config.json

echo "⬇️  Downloading prompts..."
aws s3 cp s3://{bucket}/{prompts_key} training_prompts.json || \
    aws s3 cp s3://{bucket}/{scripts_prefix}training_prompts.json training_prompts.json

# Ensure config points at the prompts filename we just downloaded
python3 - <<'PY'
import json
from pathlib import Path
cfg_path = Path('config/aws_training_config.json')
if cfg_path.exists():
    cfg = json.loads(cfg_path.read_text(encoding='utf-8'))
    cfg['prompts_file'] = './training_prompts.json'
    cfg_path.write_text(json.dumps(cfg, indent=2), encoding='utf-8')
PY

# Run render job stage (if enabled)
echo "🎬 Running render stage (if enabled)..."
source /home/ubuntu/sd_training_env/bin/activate
python3 scripts/aws_render_job.py --config config/aws_training_config.json | tee /home/ubuntu/sd_render.log

# Start training automatically in the venv
echo "🚀 Starting training..."
python3 scripts/aws_train_sd.py --config config/aws_training_config.json | tee /home/ubuntu/sd_training.log

# Set permissions
chown -R ubuntu:ubuntu /home/ubuntu/
        """

    def upload_training_files(self):
        """Upload training scripts to S3"""
        # Keep scripts under a stable prefix so user-data can download them.
        scripts_prefix = self.config.get('s3_scripts_prefix', 'scripts/')
        files_to_upload = [
            (str(self.repo_root / 'scripts' / 'aws_train_sd.py'), f'{scripts_prefix}aws_train_sd.py'),
            (str(self.repo_root / 'scripts' / 'aws_render_job.py'), f'{scripts_prefix}aws_render_job.py'),
            (str(Path(self.config_path).resolve()), f'{scripts_prefix}aws_training_config.json'),
            (str(self.repo_root / 'scripts' / 'setup_aws_training.sh'), f'{scripts_prefix}setup_aws_training.sh'),
        ]

        for local_file, s3_key in files_to_upload:
            try:
                if not Path(local_file).exists():
                    print(f"⚠️  Skipping missing file: {local_file}")
                    continue
                self.s3.upload_file(local_file, self.config['s3_bucket'], s3_key)
                print(f"✅ Uploaded {local_file} → s3://{self.config['s3_bucket']}/{s3_key}")
            except Exception as e:
                print(f"❌ Failed to upload {local_file}: {e}")

    def launch_instance(self):
        """Launch EC2 GPU training instance"""
        print("🚀 Launching EC2 training instance...")

        # Upload files first
        self.upload_training_files()

        # User data script
        user_data = self.get_user_data_script()
        user_data_encoded = base64.b64encode(user_data.encode('utf-8')).decode('utf-8')

        # Instance configuration
        instance_config = {
            'ImageId': 'ami-0c02fb55956c7d316',  # Ubuntu 20.04 LTS
            'InstanceType': self.config['aws']['instance_type'],
            'KeyName': self.config['aws'].get('key_name', 'default'),
            'SecurityGroupIds': [self.config['aws'].get('security_group', 'default')],
            'UserData': user_data_encoded,
            'MinCount': 1,
            'MaxCount': 1,
            'IamInstanceProfile': {
                'Name': 'EC2-S3-Access'  # IAM role with S3 access
            },
            'TagSpecifications': [
                {
                    'ResourceType': 'instance',
                    'Tags': [
                        {'Key': 'Name', 'Value': f'hootner-sd-training-{datetime.now().strftime("%Y%m%d-%H%M%S")}'},
                        {'Key': 'Purpose', 'Value': 'StableDiffusion-Training'},
                        {'Key': 'Project', 'Value': 'HOOTNER'}
                    ]
                }
            ]
        }

        try:
            response = self.ec2.run_instances(**instance_config)
            instance_id = response['Instances'][0]['InstanceId']

            print(f"✅ Instance launched: {instance_id}")
            print(f"🔗 Instance type: {self.config['aws']['instance_type']}")

            # Wait for instance to be running
            print("⏳ Waiting for instance to start...")
            waiter = self.ec2.get_waiter('instance_running')
            waiter.wait(InstanceIds=[instance_id])

            # Get public IP
            instances = self.ec2.describe_instances(InstanceIds=[instance_id])
            public_ip = instances['Reservations'][0]['Instances'][0].get('PublicIpAddress')

            print(f"✅ Instance is running!")
            print(f"🌐 Public IP: {public_ip}")
            print(f"🔑 SSH command: ssh -i ~/.ssh/{self.config['aws'].get('key_name', 'default')}.pem ubuntu@{public_ip}")
            print("")
            print("📋 Next steps:")
            print("1. SSH into the instance")
            print("2. Wait for setup script to complete (~10 minutes)")
            print(f"3. Upload your training images: aws s3 sync ./images/ s3://{self.config['s3_bucket']}/{self.config.get('s3_data_prefix', 'training-data/images/')}")
            print("4. Start training: python aws_train_sd.py --config aws_training_config.json")

            return instance_id, public_ip

        except Exception as e:
            print(f"❌ Failed to launch instance: {e}")
            return None, None

    def monitor_training(self, instance_id):
        """Monitor training progress"""
        print(f"📊 Monitoring training on instance: {instance_id}")

        # Check CloudWatch logs
        logs_client = boto3.client('logs', region_name=self.config['aws']['region'])

        try:
            response = logs_client.describe_log_streams(
                logGroupName=f'/aws/ec2/{instance_id}',
                orderBy='LastEventTime',
                descending=True
            )

            if response['logStreams']:
                latest_stream = response['logStreams'][0]['logStreamName']

                events = logs_client.get_log_events(
                    logGroupName=f'/aws/ec2/{instance_id}',
                    logStreamName=latest_stream,
                    startFromHead=False,
                    limit=50
                )

                print("📋 Recent logs:")
                for event in events['events'][-10:]:
                    print(f"  {event['message']}")

        except Exception as e:
            print(f"⚠️  Could not fetch logs: {e}")

    def terminate_instance(self, instance_id):
        """Terminate training instance"""
        print(f"🛑 Terminating instance: {instance_id}")

        try:
            self.ec2.terminate_instances(InstanceIds=[instance_id])
            print("✅ Instance termination initiated")
        except Exception as e:
            print(f"❌ Failed to terminate instance: {e}")

def main():
    parser = argparse.ArgumentParser(description="AWS EC2 Stable Diffusion Training Launcher")
    parser.add_argument("--config", default="aws_training_config.json", help="Config file")
    parser.add_argument("--action", choices=['launch', 'monitor', 'terminate'], default='launch')
    parser.add_argument("--instance-id", help="Instance ID for monitor/terminate actions")

    args = parser.parse_args()

    launcher = EC2TrainingLauncher(args.config)

    if args.action == 'launch':
        instance_id, public_ip = launcher.launch_instance()
        if instance_id:
            print(f"\n💾 Save this instance ID: {instance_id}")

    elif args.action == 'monitor':
        if not args.instance_id:
            print("❌ --instance-id required for monitoring")
            return
        launcher.monitor_training(args.instance_id)

    elif args.action == 'terminate':
        if not args.instance_id:
            print("❌ --instance-id required for termination")
            return
        launcher.terminate_instance(args.instance_id)

if __name__ == "__main__":
    main()
