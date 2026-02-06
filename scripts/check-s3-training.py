#!/usr/bin/env python3
import boto3

s3 = boto3.client('s3')
bucket = 'hootner-frontend-504165876439'

print("Checking S3 training data...")

# Check frames
try:
    frames = s3.list_objects_v2(Bucket=bucket, Prefix='training-data/offline-render/frames/')
    frame_count = frames.get('KeyCount', 0)
    print(f"Frames: {frame_count} objects")
    if frame_count > 0:
        for obj in frames.get('Contents', [])[:3]:
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
except Exception as e:
    print(f"Frames check failed: {e}")

# Check metadata
try:
    metadata = s3.list_objects_v2(Bucket=bucket, Prefix='training-data/offline-render/metadata/')
    meta_count = metadata.get('KeyCount', 0)
    print(f"Metadata: {meta_count} objects")
    if meta_count > 0:
        for obj in metadata.get('Contents', [])[:3]:
            print(f"  - {obj['Key']} ({obj['Size']} bytes)")
except Exception as e:
    print(f"Metadata check failed: {e}")

# Check prompts file
try:
    prompts = s3.list_objects_v2(Bucket=bucket, Prefix='training_prompts.json')
    if prompts.get('KeyCount', 0) > 0:
        print(f"Prompts file found")
    else:
        print(f"No prompts file")
except Exception as e:
    print(f"Prompts check failed: {e}")