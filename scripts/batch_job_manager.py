#!/usr/bin/env python3
"""
Manual Batch Job Trigger for HOOTNER Render Pipeline
Submits render jobs directly to AWS Batch
"""

import boto3
import json
import uuid
import argparse
from datetime import datetime

def submit_render_job(bucket_name=None, job_queue=None, job_definition=None):
    """Submit a render job to AWS Batch"""

    # Default values
    bucket_name = bucket_name or "hootner-frontend-504165876439"
    job_queue = job_queue or "hootner-render-queue"
    job_definition = job_definition or "hootner-gpu-render-job"

    batch_client = boto3.client('batch')
    s3_client = boto3.client('s3')

    # Generate unique job name
    job_name = f"hootner-render-manual-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now().isoformat()

    print(f"🚀 Submitting render job: {job_name}")
    print(f"   Bucket: {bucket_name}")
    print(f"   Queue: {job_queue}")
    print(f"   Job Definition: {job_definition}")

    try:
        # Check if training prompts exist
        s3_response = s3_client.head_object(
            Bucket=bucket_name,
            Key='training_prompts.json'
        )
        print(f"✅ Found training prompts: {s3_response['ContentLength']} bytes")

        # Submit the job
        response = batch_client.submit_job(
            jobName=job_name,
            jobQueue=job_queue,
            jobDefinition=job_definition,
            parameters={
                'triggerType': 'manual',
                'timestamp': timestamp,
                'submittedBy': 'manual-script'
            },
            containerOverrides={
                'environment': [
                    {
                        'name': 'JOB_NAME',
                        'value': job_name
                    },
                    {
                        'name': 'SUBMISSION_TIME',
                        'value': timestamp
                    },
                    {
                        'name': 'S3_BUCKET',
                        'value': bucket_name
                    }
                ]
            },
            retryStrategy={
                'attempts': 2
            },
            timeout={
                'attemptDurationSeconds': 7200  # 2 hours
            },
            tags={
                'Project': 'HOOTNER',
                'JobType': 'Render',
                'TriggerType': 'Manual',
                'SubmittedBy': 'CLI'
            }
        )

        job_id = response['jobId']
        job_arn = response['jobArn']

        print(f"✅ Job submitted successfully!")
        print(f"   Job ID: {job_id}")
        print(f"   Job ARN: {job_arn}")
        print(f"   Job Name: {job_name}")

        return {
            'success': True,
            'jobId': job_id,
            'jobArn': job_arn,
            'jobName': job_name
        }

    except s3_client.exceptions.NoSuchKey:
        print(f"❌ Training prompts not found in s3://{bucket_name}/training_prompts.json")
        print("   Upload prompts first: aws s3 cp offline_renders/prompts.json s3://{bucket_name}/training_prompts.json")
        return {'success': False, 'error': 'Missing training prompts'}

    except s3_client.exceptions.NoSuchBucket:
        print(f"❌ S3 bucket not found: {bucket_name}")
        print(f"   Create bucket first: aws s3 mb s3://{bucket_name}")
        return {'success': False, 'error': 'Missing S3 bucket'}

    except Exception as e:
        print(f"❌ Failed to submit job: {e}")
        return {'success': False, 'error': str(e)}

def get_job_status(job_id):
    """Get status of a batch job"""
    batch_client = boto3.client('batch')

    try:
        response = batch_client.describe_jobs(jobs=[job_id])

        if response['jobs']:
            job = response['jobs'][0]

            print(f"📊 Job Status: {job['jobName']} ({job_id})")
            print(f"   Status: {job['status']}")
            print(f"   Created: {job['createdAt']}")

            if 'startedAt' in job:
                print(f"   Started: {job['startedAt']}")
            if 'stoppedAt' in job:
                print(f"   Stopped: {job['stoppedAt']}")
            if 'statusReason' in job:
                print(f"   Reason: {job['statusReason']}")

            if job['status'] == 'FAILED' and 'attempts' in job:
                for i, attempt in enumerate(job['attempts']):
                    if 'exitCode' in attempt:
                        print(f"   Attempt {i+1} Exit Code: {attempt['exitCode']}")

            return job
        else:
            print(f"❌ Job not found: {job_id}")
            return None

    except Exception as e:
        print(f"❌ Failed to get job status: {e}")
        return None

def list_recent_jobs(limit=10):
    """List recent batch jobs"""
    batch_client = boto3.client('batch')

    try:
        # List jobs in different states
        states = ['SUBMITTED', 'PENDING', 'RUNNABLE', 'STARTING', 'RUNNING', 'SUCCEEDED', 'FAILED']

        all_jobs = []
        for state in states:
            response = batch_client.list_jobs(
                jobQueue='hootner-render-queue',
                jobStatus=state,
                maxResults=limit
            )
            all_jobs.extend(response.get('jobList', []))

        # Sort by creation time
        all_jobs.sort(key=lambda x: x['createdAt'], reverse=True)

        print(f"📋 Recent Jobs (last {limit}):")
        for job in all_jobs[:limit]:
            status_emoji = {
                'SUBMITTED': '📝',
                'PENDING': '⏳',
                'RUNNABLE': '🚀',
                'STARTING': '▶️',
                'RUNNING': '🔄',
                'SUCCEEDED': '✅',
                'FAILED': '❌'
            }.get(job['status'], '❓')

            print(f"   {status_emoji} {job['jobName']} - {job['status']} ({job['jobId'][:8]}...)")

        return all_jobs

    except Exception as e:
        print(f"❌ Failed to list jobs: {e}")
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='HOOTNER Batch Job Manager')
    parser.add_argument('action', choices=['submit', 'status', 'list'], help='Action to perform')
    parser.add_argument('--job-id', help='Job ID for status check')
    parser.add_argument('--bucket', help='S3 bucket name', default='hootner-frontend-504165876439')
    parser.add_argument('--queue', help='Batch job queue', default='hootner-render-queue')
    parser.add_argument('--definition', help='Batch job definition', default='hootner-gpu-render-job')
    parser.add_argument('--limit', type=int, default=10, help='Limit for list command')

    args = parser.parse_args()

    if args.action == 'submit':
        result = submit_render_job(args.bucket, args.queue, args.definition)
        exit(0 if result['success'] else 1)

    elif args.action == 'status':
        if not args.job_id:
            print("❌ --job-id required for status check")
            exit(1)
        result = get_job_status(args.job_id)
        exit(0 if result else 1)

    elif args.action == 'list':
        jobs = list_recent_jobs(args.limit)
        exit(0)
