@echo off
echo Deploying LLM Service to Kubernetes...

echo Building Docker image...
docker build -f Dockerfile.llm -t hootner/llm-service:latest .

echo Applying Kubernetes deployment...
kubectl apply -f k8s/llm-deployment.yaml

echo Waiting for deployment...
kubectl wait --for=condition=available --timeout=60s deployment/llm-service

echo Service deployed successfully!
kubectl get pods -l app=llm-service
kubectl get svc llm-service

echo.
echo LLM Service is now running in Kubernetes!
echo Access via: http://llm-service:3100
