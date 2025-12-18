#!/bin/bash

# Deploy HOOTNER MCP Server to AWS ECS
set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPO="hootner-mcp"
CLUSTER_NAME="hootner-cluster"
SERVICE_NAME="hootner-mcp-service"
TASK_FAMILY="hootner-mcp-task"

echo "🚀 Deploying HOOTNER MCP Server to AWS..."

# 1. Create ECR repository
echo "Creating ECR repository..."
aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION || true

# 2. Get ECR login
echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# 3. Build and push Docker image
echo "Building Docker image..."
docker build -f Dockerfile.mcp -t $ECR_REPO .

ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker tag $ECR_REPO:latest $ECR_URI

echo "Pushing to ECR..."
docker push $ECR_URI

# 4. Create ECS cluster
echo "Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --capacity-providers FARGATE || true

# 5. Register task definition
echo "Registering task definition..."
aws ecs register-task-definition \
  --family $TASK_FAMILY \
  --network-mode awsvpc \
  --requires-compatibilities FARGATE \
  --cpu 256 \
  --memory 512 \
  --execution-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole \
  --container-definitions "[
    {
      \"name\": \"hootner-mcp\",
      \"image\": \"$ECR_URI\",
      \"portMappings\": [
        {
          \"containerPort\": 3000,
          \"protocol\": \"tcp\"
        }
      ],
      \"essential\": true,
      \"logConfiguration\": {
        \"logDriver\": \"awslogs\",
        \"options\": {
          \"awslogs-group\": \"/ecs/hootner-mcp\",
          \"awslogs-region\": \"$AWS_REGION\",
          \"awslogs-stream-prefix\": \"ecs\"
        }
      }
    }
  ]"

# 6. Create service
echo "Creating ECS service..."
aws ecs create-service \
  --cluster $CLUSTER_NAME \
  --service-name $SERVICE_NAME \
  --task-definition $TASK_FAMILY \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" || true

echo "✅ Deployment complete!"
echo "MCP Server URL: https://your-alb-url.amazonaws.com/v1/sse"