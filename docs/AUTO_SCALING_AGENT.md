# 🚀 Auto-Scaling Agent - Quick Start Guide

## 📋 Overview

The Auto-Scaling Agent automatically monitors system resources and scales your application up or down based on CPU and memory usage.

## 🎯 Scaling Modes

### 1. Simulation Mode (Default)
```bash
node run-autoscaling-agent.js
```
- Shows what commands WOULD execute
- Safe for testing
- No actual scaling happens

### 2. Docker Compose Mode
```bash
# Enable real Docker scaling
set SCALING_MODE=docker
node run-autoscaling-agent.js

# Linux/Mac
SCALING_MODE=docker node run-autoscaling-agent.js
```
**Executes:** `docker-compose up -d --scale app=N`

### 3. Kubernetes Mode
```bash
# Enable real Kubernetes scaling
set SCALING_MODE=kubernetes
node run-autoscaling-agent.js

# Linux/Mac
SCALING_MODE=kubernetes node run-autoscaling-agent.js
```
**Executes:** `kubectl scale deployment hootner --replicas=N`

### 4. AWS ECS/EKS Mode
```bash
set SCALING_MODE=aws
node run-autoscaling-agent.js
```
**Executes:** `aws ecs update-service --cluster hootner-cluster --service hootner-service --desired-count N`

## ⚙️ Configuration

### Environment Variables

```bash
# Scaling platform (docker, kubernetes, aws, or simulate)
SCALING_MODE=docker

# Dry run mode (shows commands but doesn't execute)
DRY_RUN=true

# Current number of instances
CURRENT_INSTANCES=1
```

### Full Configuration Example

```bash
set SCALING_MODE=docker
set DRY_RUN=false
set CURRENT_INSTANCES=2
node run-autoscaling-agent.js
```

## 📊 Scaling Rules

### Scale UP
- CPU > 75% → Add 1 instance
- Memory > 80% → Add 1 instance
- CPU > 90% or Memory > 90% → Add 2 instances

### Scale DOWN
- CPU < 20% AND Memory < 30% → Remove 1 instance
- Minimum: Always keep at least 1 instance

### Maintain
- Normal resource usage (20-75% CPU, 30-80% memory)

## 🐳 Docker Compose Setup

Your `docker-compose.yml` should have:

```yaml
version: '3.8'
services:
  app:
    image: hootner-app
    deploy:
      replicas: 1  # Starting replicas
    ports:
      - "3000-3010:3000"  # Range for multiple instances
```

Scale manually:
```bash
docker-compose up -d --scale app=3
```

## ☸️ Kubernetes Setup

Your deployment should exist:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hootner
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hootner
  template:
    metadata:
      labels:
        app: hootner
    spec:
      containers:
      - name: hootner
        image: hootner-app:latest
```

Scale manually:
```bash
kubectl scale deployment hootner --replicas=3
```

Check status:
```bash
kubectl get deployments
kubectl get pods
```

## 📈 Real-Time Output Example

```
======================================================================
🚀 AUTO-SCALING AGENT - PRODUCTION MODE
======================================================================

📊 RESOURCE MONITORING
──────────────────────────────────────────────────────────────────────
⏰ Time: 10:30:45 AM
💻 CPU Usage: 85.23%
🧠 Memory Heap Used: 850.5 MB / 1024.0 MB
📈 Memory Usage: 83.02%
⏱️  Uptime: 60 seconds

🚨 SCALING ACTION REQUIRED
──────────────────────────────────────────────────────────────────────
⚡ Action: SCALE UP
📊 Reason: High resource usage detected
🎯 Target Instances: 2
📝 Details: CPU: 85.23%, Memory: 83.02%

🔧 EXECUTING SCALING OPERATION
──────────────────────────────────────────────────────────────────────
📈 Scaling UP from 1 to 2 instances
🔄 Executing Docker Compose scaling...
   Command: docker-compose up -d --scale app=2
   ✅ Output: Scaling app to 2... done
✅ Scaling operation completed successfully
──────────────────────────────────────────────────────────────────────
```

## 🛠️ Testing

### Test with Simulated Load

```bash
# In one terminal - run the agent
node run-autoscaling-agent.js

# In another terminal - simulate load
node -e "setInterval(() => { const x = []; for(let i=0; i<1000000; i++) x.push(i); }, 100)"
```

### Test with Dry Run

```bash
set SCALING_MODE=docker
set DRY_RUN=true
node run-autoscaling-agent.js
```

This shows what WOULD happen without actually scaling.

## 🔍 Monitoring

### View Current Status
The agent outputs status every 10 seconds showing:
- Current CPU usage
- Memory consumption
- Uptime
- Number of checks performed
- Scaling decisions made

### Stop the Agent
Press `Ctrl+C` for graceful shutdown with final statistics.

## 🚨 Troubleshooting

### "kubectl not available"
```bash
# Install kubectl
# Windows (with Chocolatey)
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/
```

### "Docker Compose not available"
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

### "AWS CLI not available"
```bash
# Install AWS CLI
pip install awscli
aws configure
```

### Agent not scaling
1. Check `SCALING_MODE` is set correctly
2. Verify `DRY_RUN` is not set to `true`
3. Ensure Docker/Kubernetes is running
4. Check deployment/service names match

## 💡 Production Best Practices

### 1. Use with Monitoring
Integrate with Prometheus/Grafana for alerts:
```javascript
// Export metrics
app.get('/metrics', (req, res) => {
  res.send(`
    autoscaler_cpu_usage ${cpuUsage}
    autoscaler_memory_usage ${memoryUsage}
    autoscaler_replicas ${currentReplicas}
  `);
});
```

### 2. Set Resource Limits
```yaml
resources:
  limits:
    cpu: "1"
    memory: "512Mi"
  requests:
    cpu: "500m"
    memory: "256Mi"
```

### 3. Configure Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
```

### 4. Use Horizontal Pod Autoscaler (HPA)
For Kubernetes, consider using HPA alongside:
```bash
kubectl autoscale deployment hootner --cpu-percent=70 --min=1 --max=10
```

## 🔗 Integration with Agent Hub Manager

The Auto-Scaling Agent is part of the larger Agent Hub system:

```bash
# Start full agent hub (includes auto-scaling)
node agent-hub-manager.js

# Access dashboard
http://localhost:9001
```

## 📚 Related Documentation

- [Agent Hub Manager](./docs/AGENT_HUB_MANAGER.md)
- [Production Agent Implementations](./frameworks/ai/agents/production-agent-implementations.js)
- [Enhanced Agent Hub](./enhanced-agent-hub.js)

---

**Made with 🚀 by the HOOTNER Team**
