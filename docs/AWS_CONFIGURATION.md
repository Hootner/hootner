# AWS Configuration Guide for HOOTNER

## Overview

This document outlines AWS setup for development, CI/CD, and production environments.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI v2 installed and configured
- AWS credentials (access key + secret, or SSO)

## AWS Credentials Setup

### Option 1: Using AWS Access Keys (Development)

```bash
# Configure AWS CLI interactively
aws configure

# Enter:
# AWS Access Key ID: [your-key-id]
# AWS Secret Access Key: [your-secret-key]
# Default region: us-east-1
# Default output format: json
```

This creates `~/.aws/credentials` and `~/.aws/config`.

### Option 2: Using AWS SSO (Recommended for Teams)

```bash
# Configure SSO profile
aws configure sso --profile Mastrian

# Enter:
# SSO session name: Mastrian
# SSO start URL: https://your-sso-portal.awsapps.com/start
# SSO region: us-east-1
# Account ID: [your-account-id]
# Role name: [your-role-name]
# Region: us-east-1

# Login to SSO
aws sso login --profile Mastrian

# Verify
aws sts get-caller-identity --profile Mastrian
```

## Repository AWS Configuration

The repo uses AWS for:

1. **S3 Storage** — video assets, uploads
2. **Lambda + SQS** — serverless video generation
3. **ECS** — container orchestration
4. **CloudFormation** — infrastructure as code
5. **Amazon Q** — AI code assistance

### Environment Variables

Copy `.env.example` and configure AWS keys:

```bash
cp .env.example .env

# Edit .env and add:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## AWS Services Configuration

### S3 Buckets

```bash
# Create bucket for video assets
aws s3 mb s3://hootner-videos-${AWS_ACCOUNT_ID} --region us-east-1

# Create bucket for uploads
aws s3 mb s3://hootner-uploads-${AWS_ACCOUNT_ID} --region us-east-1
```

### Lambda + SQS Setup

```bash
# Deploy SAM application (if using AWS Serverless Application Model)
cd frameworks/aws/sam-app
sam deploy --guided

# Configure environment
sam deploy --parameter-overrides BucketName=hootner-videos-${AWS_ACCOUNT_ID}
```

### ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name hootner-cluster --region us-east-1

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

## CI/CD Configuration

### GitHub Actions AWS Integration

Add GitHub secrets for CI/CD:

```bash
# In GitHub repo settings → Secrets and variables → Actions:

AWS_ACCESS_KEY_ID=<your-ci-key-id>
AWS_SECRET_ACCESS_KEY=<your-ci-secret-key>
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=<your-account-id>
```

The `.github/workflows/aws-compliance.yaml` workflow will use these secrets to run AWS compliance checks.

### Local CI/CD Testing

```bash
# Simulate GitHub Actions locally
act -s AWS_ACCESS_KEY_ID=<your-key> -s AWS_SECRET_ACCESS_KEY=<your-secret>
```

## Amazon Q Integration

Amazon Q uses AWS credentials to:

- Search your codebase
- Provide AWS API recommendations
- Run security scans

### Enable Amazon Q for VS Code

1. Install extension: `AmazonWebServices.amazon-q-vscode`
2. Press `Ctrl+Q` in VS Code
3. Follow SSO or credential login
4. Amazon Q will auto-detect your AWS profile

**Recommended:** Use SSO for team environments.

## Security Best Practices

### ✅ DO

- Use AWS IAM roles for services (not long-lived keys)
- Rotate credentials every 90 days
- Use separate credentials for dev/staging/prod
- Store secrets in AWS Secrets Manager or Parameter Store
- Enable MFA for AWS console access
- Use least-privilege IAM policies

### ❌ DON'T

- Commit `.aws/credentials` to version control (already in `.gitignore`)
- Share credentials via email or Slack
- Use root account credentials
- Use overly permissive IAM policies (e.g., `*`)
- Hardcode credentials in code or `.env`

## Troubleshooting

### AWS CLI not found

```bash
# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify
aws --version
```

### SSO login expired

```bash
# Re-authenticate
aws sso login --profile Mastrian

# Verify
aws sts get-caller-identity --profile Mastrian
```

### Access denied errors

```bash
# Check credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user

# List resources you can access
aws s3 ls
aws ec2 describe-instances --region us-east-1
```

### Amazon Q not connecting

- Verify AWS credentials: `aws sts get-caller-identity`
- Check Amazon Q has permission in your AWS account
- Restart VS Code
- Check VS Code output panel for errors

## Next Steps

1. **Configure AWS CLI** — run `aws configure` or `aws configure sso`
2. **Test credentials** — run `aws sts get-caller-identity`
3. **Create S3 buckets** — for video and upload storage
4. **Deploy SAM app** — for serverless video generation
5. **Enable Amazon Q** — in VS Code
6. **Add GitHub secrets** — for CI/CD workflows

## References

- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [AWS SSO Documentation](https://docs.aws.amazon.com/singlesignon/)
- [Amazon Q Documentation](https://aws.amazon.com/q/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
