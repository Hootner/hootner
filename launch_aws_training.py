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

class EC2TrainingLauncher:
    def __init__(self, config_file):
        with open(config_file, 'r') as f:
            self.config = json.load(f)

        self.ec2 = boto3.client('ec2', region_name=self.config['aws']['region'])
        self.s3 = boto3.client('s3')

    def get_user_data_script(self):
        """Generate user data script for EC2 instance"""
        return f"""#!/bin/bash
# Auto-setup script for SD training
cd /home/ubuntu
git clone https://github.com/Hootner/hootner.git
cd hootner
chmod +x setup_aws_training.sh
./setup_aws_training.sh

# Download training files
aws s3 cp s3://{self.config['s3_bucket']}/aws_train_sd.py .
aws s3 cp s3://{self.config['s3_bucket']}/aws_training_config.json .
aws s3 cp s3://{self.config['s3_bucket']}/training_prompts.json .

# Set permissions
chown -R ubuntu:ubuntu /home/ubuntu/
        """

    def upload_training_files(self):
        """Upload training scripts to S3"""
        files_to_upload = [
            ('aws_train_sd.py', 'aws_train_sd.py'),
            ('aws_training_config.json', 'aws_training_config.json'),
            ('training_prompts.json', 'training_prompts.json'),
            ('setup_aws_training.sh', 'setup_aws_training.sh')
        ]

        for local_file, s3_key in files_to_upload:
            try:
                self.s3.upload_file(local_file, self.config['s3_bucket'], s3_key)
                print(f"✅ Uploaded {local_file} to S3")
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
            print("3. Upload your training images: aws s3 sync ./images/ s3://hootner-uploads-504165876439/training-data/images/")
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
