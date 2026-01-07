#!/bin/bash

echo "Deploying LLM Service to Kubernetes..."

# Build Docker image
echo "Building Docker image..."
docker build -f Dockerfile.llm -t hootner/llm-service:latest .

# Push to registry (optional)
# docker push hootner/llm-service:latest

# Apply Kubernetes deployment
echo "Applying Kubernetes deployment..."
kubectl apply -f k8s/llm-deployment.yaml

# Wait for deployment
echo "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=60s deployment/llm-service

# Get service info
echo "Service deployed successfully!"
kubectl get pods -l app=llm-service
kubectl get svc llm-service

echo ""
echo "LLM Service is now running in Kubernetes!"
echo "Access via: http://llm-service:3100"
