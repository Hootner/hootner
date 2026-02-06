#!/bin/bash

# CloudShell Full Access Script
# Copy and paste this entire script into AWS CloudShell

set -e

echo "🔥 FULL ACCESS SETUP"
echo "===================="

# Get current identity
echo "Current identity:"
aws sts get-caller-identity

# Create backup admin user with timestamp
BACKUP_USER="admin-$(date +%m%d%H%M)"
echo ""
echo "Creating backup admin: $BACKUP_USER"

# Create user
aws iam create-user --user-name "$BACKUP_USER" || echo "User may already exist"

# Attach admin policies
aws iam attach-user-policy --user-name "$BACKUP_USER" --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
aws iam attach-user-policy --user-name "$BACKUP_USER" --policy-arn arn:aws:iam::aws:policy/IAMUserChangePassword

# Clean old keys and create new one
aws iam list-access-keys --user-name "$BACKUP_USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text | while read key; do
    [ ! -z "$key" ] && aws iam delete-access-key --user-name "$BACKUP_USER" --access-key-id "$key"
done

# Create fresh access key
NEW_KEY=$(aws iam create-access-key --user-name "$BACKUP_USER" --output json)
ACCESS_KEY_ID=$(echo "$NEW_KEY" | jq -r '.AccessKey.AccessKeyId')
SECRET_KEY=$(echo "$NEW_KEY" | jq -r '.AccessKey.SecretAccessKey')

# Configure profile
aws configure set aws_access_key_id "$ACCESS_KEY_ID" --profile backup-admin
aws configure set aws_secret_access_key "$SECRET_KEY" --profile backup-admin
aws configure set region us-east-1 --profile backup-admin
aws configure set output json --profile backup-admin

# Set for this session
export AWS_PROFILE=backup-admin

echo ""
echo "✅ FULL ACCESS GRANTED"
echo "======================"
echo "User: $BACKUP_USER"
echo "Profile: backup-admin"
echo "Region: us-east-1"
echo ""

# Test access
echo "Testing access:"
aws sts get-caller-identity --profile backup-admin

echo ""
echo "🚀 READY TO USE"
echo "==============="
echo "AWS_PROFILE=backup-admin"
echo ""
echo "Commands:"
echo "aws s3 ls --profile backup-admin"
echo "aws ec2 describe-instances --profile backup-admin"
echo "aws iam list-users --profile backup-admin"
echo ""
echo "Credentials saved to ~/.aws/credentials [backup-admin]"