#!/usr/bin/env python3
"""
AWS Batch Job Definition for HOOTNER Render Jobs
Creates batch job definitions for GPU rendering and training
"""

import boto3
import json

def create_render_batch_job():
    """Create AWS Batch job definition for render jobs"""
    batch_client = boto3.client('batch')

    job_definition = {
        'jobDefinitionName': 'hootner-gpu-render-job',
        'type': 'container',
        'containerProperties': {
            'image': 'nvidia/cuda:12.1-devel-ubuntu22.04',
            'vcpus': 8,
            'memory': 30720,  # 30GB
            'resourceRequirements': [
                {
                    'type': 'GPU',
                    'value': '1'
                }
            ],
            'jobRoleArn': 'arn:aws:iam::504165876439:role/BatchExecutionRole',
            'environment': [
                {'name': 'S3_BUCKET', 'value': 'hootner-frontend-504165876439'},
                {'name': 'S3_SCRIPTS_PREFIX', 'value': 'scripts/'},
                {'name': 'AWS_DEFAULT_REGION', 'value': 'us-east-1'},
                {'name': 'RENDER_OUTPUT_PREFIX', 'value': 'training-data/offline-render/frames/'},
                {'name': 'RENDER_METADATA_PREFIX', 'value': 'training-data/offline-render/metadata/'},
                {'name': 'NVIDIA_VISIBLE_DEVICES', 'value': 'all'},
                {'name': 'CUDA_VISIBLE_DEVICES', 'value': '0'}
            ],
            'command': [
                '/bin/bash',
                '-c',
                '''
                # Setup script for HOOTNER render job
                set -e

                echo "🚀 HOOTNER GPU Render Job Starting..."

                # Install dependencies
                apt-get update -y
                apt-get install -y python3-pip awscli wget unzip

                # Download Unreal Engine (mock - replace with actual UE installation)
                echo "📦 Setting up Unreal Engine..."
                # wget -O UnrealEngine.zip "https://unrealengine.com/download"
                # unzip UnrealEngine.zip

                # Download scripts from S3
                echo "📥 Downloading render scripts..."
                aws s3 cp s3://$S3_BUCKET/$S3_SCRIPTS_PREFIX ./ --recursive

                # Install Python dependencies
                pip3 install boto3 requests Pillow

                # Execute render job
                echo "🎬 Starting render job..."
                python3 aws_render_job.py

                echo "✅ Render job completed successfully!"
                '''
            ],
            'mountPoints': [],
            'volumes': [],
            'ulimits': [],
            'linuxParameters': {
                'devices': [
                    {
                        'hostPath': '/dev/nvidia0',
                        'containerPath': '/dev/nvidia0',
                        'permissions': ['read', 'write']
                    }
                ],
                'initProcessEnabled': True
            }
        },
        'retryStrategy': {
            'attempts': 2
        },
        'timeout': {
            'attemptDurationSeconds': 7200  # 2 hours
        },
        'tags': {
            'Project': 'HOOTNER',
            'Service': 'Render',
            'Environment': 'production'
        }
    }

    try:
        response = batch_client.register_job_definition(**job_definition)
        print(f"✅ Created batch job definition: {response['jobDefinitionArn']}")
        return response
    except Exception as e:
        print(f"❌ Failed to create job definition: {e}")
        return None

def create_compute_environment():
    """Create AWS Batch compute environment with GPU instances"""
    batch_client = boto3.client('batch')

    compute_env = {
        'computeEnvironmentName': 'hootner-gpu-compute-env',
        'type': 'MANAGED',
        'state': 'ENABLED',
        'computeResources': {
            'type': 'EC2',
            'minvCpus': 0,
            'maxvCpus': 32,
            'desiredvCpus': 0,
            'instanceTypes': ['g5.xlarge', 'g5.2xlarge'],
            'imageId': 'ami-0c02fb55956c7d316',  # Amazon Linux 2 with GPU support
            'subnets': [],  # Will be populated from VPC
            'securityGroupIds': [],  # Will be populated
            'instanceRole': 'arn:aws:iam::504165876439:instance-profile/ecsInstanceRole',
            'tags': {
                'Name': 'HOOTNER-Batch-Instance',
                'Project': 'HOOTNER',
                'Service': 'Render'
            },
            'bidPercentage': 50,  # Use spot instances for cost savings
            'ec2Configuration': [
                {
                    'imageType': 'ECS_AL2_NVIDIA'
                }
            ]
        },
        'serviceRole': 'arn:aws:iam::504165876439:role/AWSBatchServiceRole',
        'tags': {
            'Project': 'HOOTNER',
            'Service': 'Render'
        }
    }

    try:
        response = batch_client.create_compute_environment(**compute_env)
        print(f"✅ Created compute environment: {response['computeEnvironmentArn']}")
        return response
    except Exception as e:
        print(f"❌ Failed to create compute environment: {e}")
        return None

def create_job_queue():
    """Create AWS Batch job queue"""
    batch_client = boto3.client('batch')

    job_queue = {
        'jobQueueName': 'hootner-render-queue',
        'state': 'ENABLED',
        'priority': 1,
        'computeEnvironmentOrder': [
            {
                'order': 1,
                'computeEnvironment': 'hootner-gpu-compute-env'
            }
        ],
        'tags': {
            'Project': 'HOOTNER',
            'Service': 'Render'
        }
    }

    try:
        response = batch_client.create_job_queue(**job_queue)
        print(f"✅ Created job queue: {response['jobQueueArn']}")
        return response
    except Exception as e:
        print(f"❌ Failed to create job queue: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Creating AWS Batch infrastructure for HOOTNER render jobs...")

    # Create resources
    create_compute_environment()
    create_job_queue()
    create_render_batch_job()

    print("✅ AWS Batch setup complete! Ready to submit render jobs.")
