# 🚀 Deployment Commands Reference

## 🚀 Quick Deployment

```bash
# Blue-green deployment
npm run deploy:blue-green
./scripts/blue-green-deploy.sh

# Kubernetes deployment
npm run k8s:deploy
kubectl apply -f k8s/

# Docker production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🏗️ Build & Package

```bash
# Build all components
npm run build

# Build individual components
npm run build:frontend
npm run build:api

# Package Electron app
npm run package

# Create installers
npm run make

# Docker builds
npm run docker:build
docker-compose build
```

## ☸️ Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/
npm run k8s:deploy

# Deploy specific components
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Blue-green deployment
kubectl apply -f k8s/blue-green-deployment.yaml

# Rolling update
kubectl set image deployment/hootner-app app=hootner:v2.0.0
kubectl rollout status deployment/hootner-app

# Rollback deployment
kubectl rollout undo deployment/hootner-app
kubectl rollout history deployment/hootner-app
```

## 🔄 Blue-Green Deployment

```bash
# Automated blue-green deployment
./scripts/blue-green-deploy.sh

# Manual blue-green steps
docker-compose -f docker-compose.blue-green.yml up -d blue
# Test blue environment
docker-compose -f docker-compose.blue-green.yml stop green
docker-compose -f docker-compose.blue-green.yml up -d green

# Switch traffic
kubectl patch service hootner-service -p '{"spec":{"selector":{"version":"blue"}}}'
kubectl patch service hootner-service -p '{"spec":{"selector":{"version":"green"}}}'
```

## 🐳 Docker Production Deployment

```bash
# Production environment
docker-compose -f docker-compose.prod.yml up -d

# With monitoring
docker-compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale worker-agent=3

# Update services
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🌐 Environment-Specific Deployments

### Staging

```bash
docker-compose -f docker-compose.staging.yml up -d
kubectl apply -f k8s/staging/
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
kubectl apply -f k8s/production/
```

### Development

```bash
docker-compose -f docker-compose.dev.yml up -d
kubectl apply -f k8s/development/
```

## 📦 Registry & Image Management

```bash
# Tag images for deployment
docker tag hootner-frontend:latest registry.example.com/hootner-frontend:v1.0.0
docker tag hootner-server:latest registry.example.com/hootner-server:v1.0.0

# Push to registry
docker push registry.example.com/hootner-frontend:v1.0.0
docker push registry.example.com/hootner-server:v1.0.0

# Pull for deployment
docker pull registry.example.com/hootner-frontend:v1.0.0
docker pull registry.example.com/hootner-server:v1.0.0
```

## 🔧 Service Mesh (Istio)

```bash
# Install Istio
cd k8s/istio
./install.sh      # Linux/Mac
./install.bat     # Windows

# Deploy with Istio
kubectl apply -f k8s/istio/

# Traffic management
kubectl apply -f k8s/istio/virtual-service.yaml
kubectl apply -f k8s/istio/destination-rule.yaml

# Security policies
kubectl apply -f k8s/istio/authorization-policy.yaml
kubectl apply -f k8s/istio/peer-authentication.yaml
```

## 📊 Monitoring Deployment

```bash
# Deploy monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Kubernetes monitoring
kubectl apply -f k8s/monitoring/

# Prometheus & Grafana
kubectl apply -f k8s/prometheus/
kubectl apply -f k8s/grafana/

# Access monitoring
# Grafana: http://localhost:3013
# Prometheus: http://localhost:9090
```

## 🔒 Security in Deployment

```bash
# Deploy with security scanning
docker scan hootner-frontend:latest
docker scan hootner-server:latest

# Security policies
kubectl apply -f k8s/security/network-policy.yaml
kubectl apply -f k8s/security/pod-security-policy.yaml

# Secrets management
kubectl create secret generic hootner-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=db-password=$DB_PASSWORD
```

## 🔄 CI/CD Pipeline Commands

```bash
# GitHub Actions (automated)
# Triggered on push to main branch

# Manual workflow dispatch
gh workflow run deploy.yml

# Check workflow status
gh run list
gh run view <run-id>

# Local CI/CD simulation
act  # Using act to run GitHub Actions locally
```

## 📋 Pre-Deployment Checks

```bash
# Health checks
node healthcheck.js

# Security audit
npm run security:audit

# Performance tests
npm run test:load

# Smoke tests
npm run test:smoke

# Lint and format
npm run lint:fix
npm run format
```

## 🔧 Database Migration & Setup

```bash
# Database migrations
node scripts/migrate-db.js

# Seed production data
node scripts/seed-production.js

# Backup before deployment
npm run backup
node scripts/backup-manager.js

# Database health check
node scripts/db-health-check.js
```

## 🌍 Multi-Region Deployment

```bash
# Sync across regions
./scripts/multi-region-sync.sh

# Deploy to multiple regions
kubectl config use-context us-east-2
kubectl apply -f k8s/
kubectl config use-context eu-west-1
kubectl apply -f k8s/

# Cross-region backup
node scripts/cross-region-backup.js
```

## 📈 Scaling Commands

```bash
# Horizontal scaling
kubectl scale deployment hootner-app --replicas=5

# Auto-scaling
kubectl apply -f k8s/hpa.yaml  # Horizontal Pod Autoscaler

# Docker Compose scaling
docker-compose -f docker-compose.prod.yml up -d --scale web-hootner-app=3
```

## 🔄 Rolling Updates

```bash
# Kubernetes rolling update
kubectl set image deployment/hootner-app app=hootner:v2.0.0
kubectl rollout status deployment/hootner-app

# Docker Compose rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps --force-recreate web-hootner-app
```

## 🚨 Rollback Procedures

```bash
# Kubernetes rollback
kubectl rollout undo deployment/hootner-app
kubectl rollout undo deployment/hootner-app --to-revision=2

# Docker rollback
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Blue-green rollback
kubectl patch service hootner-service -p '{"spec":{"selector":{"version":"previous"}}}'
```

## 📊 Post-Deployment Verification

```bash
# Health checks
curl http://your-domain.com/health
kubectl get pods -l app=hootner

# Performance verification
npm run test:smoke
node tests/post-deploy-verification.js

# Monitoring checks
curl http://your-domain.com/metrics
kubectl top pods
```

## 🔧 Deployment Troubleshooting

```bash
# Check deployment status
kubectl get deployments
kubectl describe deployment hootner-app

# View logs
kubectl logs -f deployment/hootner-app
docker-compose logs -f web-hootner-app

# Debug pods
kubectl exec -it <pod-name> -- bash
kubectl describe pod <pod-name>

# Network debugging
kubectl exec -it <pod-name> -- nslookup kubernetes.default
kubectl get svc
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Run security audit
- [ ] Execute all tests
- [ ] Backup databases
- [ ] Update documentation
- [ ] Verify environment variables

### During Deployment

- [ ] Monitor deployment progress
- [ ] Check service health
- [ ] Verify database connections
- [ ] Test critical paths

### Post-Deployment

- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup systems
- [ ] Update monitoring dashboards
