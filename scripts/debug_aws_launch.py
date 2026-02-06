#!/usr/bin/env python3
"""
Simple AWS EC2 Instance Launcher with Error Handling
"""

import boto3
import json
import sys

def check_aws_setup():
    """Check if AWS is properly configured"""
    try:
        # Test AWS connection
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"✅ AWS connected as: {identity.get('Arn')}")

        # Test EC2 permissions
        ec2 = boto3.client('ec2', region_name='us-east-1')
        ec2.describe_instances()
        print(f"✅ EC2 access confirmed")

        # Test S3 permissions
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.list_buckets()
        print(f"✅ S3 access confirmed")

        return True

    except Exception as e:
        print(f"❌ AWS setup error: {e}")
        return False

def _extract_instance_info(instance):
    """Extract instance information from AWS response"""
    name = 'No Name'
    if 'Tags' in instance:
        for tag in instance['Tags']:
            if tag['Key'] == 'Name':
                name = tag['Value']
                break
    return {
        'id': instance['InstanceId'],
        'type': instance['InstanceType'],
        'state': instance['State']['Name'],
        'name': name
    }

def list_existing_instances():
    """List any existing EC2 instances"""
    try:
        ec2 = boto3.client('ec2', region_name='us-east-1')
        response = ec2.describe_instances()

        instances = [
            _extract_instance_info(instance)
            for reservation in response['Reservations']
            for instance in reservation['Instances']
            if instance['State']['Name'] != 'terminated'
        ]

        if instances:
            print("\n📋 Existing EC2 Instances:")
            for inst in instances:
                print(f"   {inst['id']} | {inst['state']} | {inst['type']} | {inst['name']}")
        else:
            print("\n📋 No existing EC2 instances found")

        return instances

    except Exception as e:
        print(f"❌ Error listing instances: {e}")
        return []

def simple_launch():
    """Launch a c5.2xlarge instance for CPU training"""
    print("🚀 Attempting to launch c5.2xlarge training instance...")

    try:
        ec2 = boto3.client('ec2', region_name='us-east-1')

        # Check for existing key pairs
        key_pairs = ec2.describe_key_pairs()
        key_name = key_pairs['KeyPairs'][0]['KeyName'] if key_pairs['KeyPairs'] else None

        if not key_name:
            print("⚠️  No SSH key pair found. Instance will launch without SSH access.")

        # CPU training instance configuration
        launch_params = {
            'ImageId': 'ami-0c02fb55956c7d316',
            'InstanceType': 'c5.2xlarge',
            'MinCount': 1,
            'MaxCount': 1,
            'TagSpecifications': [{
                'ResourceType': 'instance',
                'Tags': [
                    {'Key': 'Name', 'Value': 'hootner-cpu-training'},
                    {'Key': 'Purpose', 'Value': 'StableDiffusion-CPU'}
                ]
            }]
        }

        if key_name:
            launch_params['KeyName'] = key_name
            print(f"🔑 Using key pair: {key_name}")

        response = ec2.run_instances(**launch_params)

        instance_id = response['Instances'][0]['InstanceId']
        print(f"✅ Instance launched: {instance_id}")
        print(f"⏳ Instance starting up...")

        return instance_id

    except Exception as e:
        print(f"❌ Launch failed: {e}")
        print("\nPossible issues:")
        print("- No EC2 key pair configured")
        print("- Missing IAM permissions")
        print("- Region/availability zone issues")
        print("- AWS service limits reached")
        return None

def main():
    print("🦉 HOOTNER AWS Training - Debug Mode")
    print("=" * 40)

    # Check AWS setup
    if not check_aws_setup():
        print("\n❌ Please fix AWS configuration first:")
        print("   aws configure")
        sys.exit(1)

    # List existing instances
    instances = list_existing_instances()

    # If we have training instances, show them
    training_instances = [i for i in instances if 'training' in i['name'].lower() or 'hootner' in i['name'].lower()]

    if training_instances:
        print(f"\n✅ Found {len(training_instances)} training instance(s)!")
        for inst in training_instances:
            print(f"\nInstance: {inst['id']}")
            print(f"Status: {inst['state']}")
            print(f"To monitor: python debug_aws_launch.py --action monitor --instance-id {inst['id']}")
            print(f"To terminate: python debug_aws_launch.py --action terminate --instance-id {inst['id']}")
    else:
        print("\n🚀 No training instances found. Launching new one...")
        instance_id = simple_launch()
        if instance_id:
            print(f"\n✅ Training instance ready: {instance_id}")
            print(f"Monitor with: python debug_aws_launch.py --action monitor --instance-id {instance_id}")

if __name__ == "__main__":
    main()
