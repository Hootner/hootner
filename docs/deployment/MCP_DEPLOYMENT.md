# 🚀 HOOTNER MCP Server Deployment Guide

## Quick Deployment Options

### Local Development

```bash
# Start local MCP server
npm run mcp:start

# Start HTTP wrapper
npm run mcp:http
```

### Docker Deployment

```bash
# Build and run locally
npm run docker:build
npm run docker:run

# Or use Docker Compose
docker-compose -f docker-compose.mcp.yml up -d
```

### AWS Production Deployment

```bash
# Deploy to AWS ECS
npm run deploy:aws
```

## Architecture

### Local (stdio transport)

```
Amazon Q ←→ MCP Server (stdio) ←→ HOOTNER Services
```

### Remote (HTTP transport)

```
Amazon Q ←→ HTTPS/SSE ←→ Load Balancer ←→ MCP Server ←→ HOOTNER Services
```

## Configuration

### Local Configuration

```json
{
  "mcpServers": {
    "hootner-local": {
      "transport": "stdio",
      "command": "node",
      "args": ["mcp-server.js"]
    }
  }
}
```

### Remote Configuration

```json
{
  "mcpServers": {
    "hootner-remote": {
      "transport": "http",
      "url": "https://your-mcp.hootner.com/v1/sse",
      "headers": {
        "Authorization": "Bearer ${HOOTNER_MCP_TOKEN}"
      }
    }
  }
}
```

## AWS ECS Deployment

### Prerequisites

- AWS CLI configured
- Docker installed
- ECR repository access

### Deployment Steps

1. **Build & Push Image**

   ```bash
   docker build -f Dockerfile.mcp -t hootner-mcp .
   docker tag hootner-mcp:latest 123456789.dkr.ecr.us-east-2.amazonaws.com/hootner-mcp:latest
   docker push 123456789.dkr.ecr.us-east-2.amazonaws.com/hootner-mcp:latest
   ```

2. **Create ECS Resources**

   ```bash
   # Create cluster
   aws ecs create-cluster --cluster-name hootner-cluster

   # Register task definition
   aws ecs register-task-definition --cli-input-json file://task-definition.json

   # Create service
   aws ecs create-service --cluster hootner-cluster --service-name hootner-mcp-service
   ```

3. **Configure Load Balancer**
   - Create Application Load Balancer
   - Configure HTTPS listener
   - Set up target group for ECS service

## Security Configuration

### IAM Roles

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ecs:*", "ecr:*", "logs:*"],
      "Resource": "*"
    }
  ]
}
```

### Environment Variables

```bash
# Production
HOOTNER_ENV=production
NODE_ENV=production
HOOTNER_MCP_TOKEN=your-secure-token

# Development
HOOTNER_ENV=development
NODE_ENV=development
```

## Testing Deployment

### Health Check

```bash
curl https://your-mcp.hootner.com/health
```

### Tool Testing

```bash
# List tools
curl -X POST https://your-mcp.hootner.com/v1/tools/list

# Call tool
curl -X POST https://your-mcp.hootner.com/v1/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name":"system_health","arguments":{"component":"all"}}'
```

### Amazon Q Integration

```
"Deploy frontend to production using remote MCP"
"Check system health via remote server"
```

## Monitoring & Logging

### CloudWatch Logs

- Log group: `/ecs/hootner-mcp`
- Stream prefix: `ecs`

### Metrics

- Container CPU/Memory usage
- Request count and latency
- Tool execution success/failure rates

### Alerts

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name "MCP-High-Error-Rate" \
  --alarm-description "MCP server error rate > 5%" \
  --metric-name ErrorRate \
  --threshold 5.0
```

## Scaling Configuration

### Auto Scaling

```json
{
  "serviceName": "hootner-mcp-service",
  "minCapacity": 1,
  "maxCapacity": 10,
  "targetValue": 70.0,
  "scaleOutCooldown": 300,
  "scaleInCooldown": 300
}
```

### Load Balancer Settings

- Health check: `/health`
- Timeout: 30 seconds
- Interval: 30 seconds
- Healthy threshold: 2

## Troubleshooting

### Common Issues

**Container Won't Start**

```bash
# Check logs
aws logs get-log-events --log-group-name /ecs/hootner-mcp

# Check task definition
aws ecs describe-task-definition --task-definition hootner-mcp-task
```

**SSL/TLS Issues**

```bash
# Verify certificate
openssl s_client -connect your-mcp.hootner.com:443

# Check Nginx config
docker exec nginx nginx -t
```

**Tool Execution Failures**

```bash
# Check MCP server logs
docker logs hootner-mcp

# Test tools directly
curl -X POST localhost:3000/v1/tools/call -d '{"name":"system_health"}'
```

## Best Practices

1. **Security**
   - Use HTTPS only
   - Implement proper authentication
   - Rotate tokens regularly

2. **Performance**
   - Enable connection pooling
   - Use CDN for static assets
   - Monitor response times

3. **Reliability**
   - Implement health checks
   - Use auto-scaling
   - Set up monitoring alerts

4. **Cost Optimization**
   - Use Fargate Spot for non-critical workloads
   - Right-size containers
   - Monitor usage patterns

---

**Made with 🦉 by the HOOTNER Team**
