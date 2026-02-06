#!/usr/bin/env python3
import boto3

ec2 = boto3.client('ec2')

print("Checking EC2 training instances...")

try:
    response = ec2.describe_instances(
        Filters=[
            {'Name': 'tag:Name', 'Values': ['hootner-sd-training-*']},
            {'Name': 'instance-state-name', 'Values': ['pending', 'running', 'stopping', 'stopped']}
        ]
    )
    
    instances = []
    for reservation in response['Reservations']:
        instances.extend(reservation['Instances'])
    
    if not instances:
        print("No training instances found")
    else:
        print(f"Found {len(instances)} training instance(s):")
        for instance in instances:
            name = next((tag['Value'] for tag in instance.get('Tags', []) if tag['Key'] == 'Name'), 'Unknown')
            state = instance['State']['Name']
            instance_type = instance['InstanceType']
            launch_time = instance.get('LaunchTime', 'Unknown')
            print(f"  - {name} ({instance['InstanceId']})")
            print(f"    State: {state} | Type: {instance_type}")
            print(f"    Launched: {launch_time}")

except Exception as e:
    print(f"EC2 check failed: {e}")