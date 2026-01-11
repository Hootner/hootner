# GitHub Secrets Configuration

Add these secrets to your GitHub repository:

## Required Secrets
- `JWT_SECRET`: JWT signing secret
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection URL

## Optional Secrets
- `ENCRYPTION_KEY`: Data encryption key
- `SESSION_SECRET`: Session signing secret

## Setup Instructions
1. Go to GitHub repository Settings
2. Navigate to Secrets and variables > Actions
3. Add each secret with the corresponding value