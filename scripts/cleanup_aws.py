#!/usr/bin/env python3
"""
Complete AWS Cleanup Script - Shuts down all HOOTNER resources
"""

import boto3
import sys

def cleanup_ec2():
    """Terminate all EC2 instances"""
    print("\n🔍 Checking EC2 instances...")
    ec2 = boto3.client('ec2', region_name='us-east-1')
    
    response = ec2.describe_instances(Filters=[{'Name': 'instance-state-name', 'Values': ['running', 'stopped']}])
    instance_ids = [i['InstanceId'] for r in response['Reservations'] for i in r['Instances']]
    
    if instance_ids:
        print(f"🛑 Terminating {len(instance_ids)} instance(s): {', '.join(instance_ids)}")
        ec2.terminate_instances(InstanceIds=instance_ids)
        print("✅ EC2 instances terminated")
    else:
        print("✅ No EC2 instances to terminate")

def cleanup_s3():
    """Delete all S3 buckets and contents"""
    print("\n🔍 Checking S3 buckets...")
    s3 = boto3.client('s3', region_name='us-east-1')
    s3_resource = boto3.resource('s3')
    
    buckets = s3.list_buckets()['Buckets']
    hootner_buckets = [b['Name'] for b in buckets if 'hootner' in b['Name'].lower()]
    
    if hootner_buckets:
        for bucket_name in hootner_buckets:
            print(f"🗑️  Deleting bucket: {bucket_name}")
            bucket = s3_resource.Bucket(bucket_name)
            bucket.objects.all().delete()
            bucket.object_versions.all().delete()
            bucket.delete()
            print(f"✅ Deleted: {bucket_name}")
    else:
        print("✅ No HOOTNER S3 buckets found")

def cleanup_cloudformation():
    """Delete CloudFormation stacks"""
    print("\n🔍 Checking CloudFormation stacks...")
    cf = boto3.client('cloudformation', region_name='us-east-1')
    
    stacks = cf.list_stacks(StackStatusFilter=['CREATE_COMPLETE', 'UPDATE_COMPLETE'])['StackSummaries']
    hootner_stacks = [s['StackName'] for s in stacks if 'hootner' in s['StackName'].lower()]
    
    if hootner_stacks:
        for stack_name in hootner_stacks:
            print(f"🗑️  Deleting stack: {stack_name}")
            cf.delete_stack(StackName=stack_name)
            print(f"✅ Stack deletion initiated: {stack_name}")
    else:
        print("✅ No HOOTNER CloudFormation stacks found")

def main():
    print("🦉 HOOTNER AWS Complete Cleanup")
    print("=" * 50)
    print("⚠️  WARNING: This will DELETE ALL HOOTNER resources!")
    print("   - All EC2 instances")
    print("   - All S3 buckets and data")
    print("   - All CloudFormation stacks")
    print("=" * 50)
    
    confirm = input("\nType 'DELETE' to confirm: ")
    if confirm != 'DELETE':
        print("❌ Cleanup cancelled")
        sys.exit(0)
    
    try:
        cleanup_ec2()
        cleanup_s3()
        cleanup_cloudformation()
        
        print("\n" + "=" * 50)
        print("✅ Cleanup complete!")
        print("💰 AWS charges should stop within minutes")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Error during cleanup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
