#!/bin/bash
# HOOTNER AWS Batch Quick Deploy Script
# Sets up GPU render infrastructure quickly

set -e

echo "🚀 HOOTNER AWS Batch Quick Deploy"
echo "=================================="

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
aws sts get-caller-identity || {
    echo "❌ AWS credentials not configured"
    exit 1
}

# Set variables
STACK_NAME="${1:-hootner-platform}"
REGION="${2:-us-east-1}"
BUCKET="hootner-frontend-504165876439"

echo "📊 Configuration:"
echo "   Stack: $STACK_NAME"
echo "   Region: $REGION"
echo "   Bucket: $BUCKET"

# Create/update CloudFormation stack with Batch resources
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file template.yaml \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION" \
    --parameter-overrides Environment=prod

if [ $? -eq 0 ]; then
    echo "✅ Stack deployed successfully"
else
    echo "❌ Stack deployment failed"
    exit 1
fi

# Get stack outputs
echo "📋 Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`BatchRenderJobArn` || OutputKey==`BatchComputeEnvironmentArn` || OutputKey==`RenderTriggerFunctionArn`]' \
    --output table

# Test Lambda function
echo "🧪 Testing render trigger function..."
FUNCTION_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`RenderTriggerFunctionArn`].OutputValue' \
    --output text | sed 's/.*://')

aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --payload '{"source":"test","bucket":"'$BUCKET'"}' \
    /tmp/lambda-response.json

echo "📝 Lambda response:"
cat /tmp/lambda-response.json | jq .

echo ""
echo "🎉 AWS Batch deployment complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Submit render job: python scripts/batch_job_manager.py submit"
echo "   2. Check job status: python scripts/batch_job_manager.py list"
echo "   3. Trigger via API: curl -X POST https://your-api/render/trigger"
echo ""