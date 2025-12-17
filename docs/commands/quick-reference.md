# ⚡ Quick Reference - Most Used Commands

## 🚀 Essential Commands (Daily Use)

```bash
# Start development
npm run dev

# Start video player
cd apps/frontend/html-pages && node video-player-server.js

# Run tests
npm test

# Security audit
npm run security:audit

# Docker development
npm run docker:up
```

## 🏗️ Development Workflow

```bash
# 1. Setup
npm install
cp .env.example .env

# 2. Start development
npm run dev

# 3. Test changes
npm test
npm run lint:fix

# 4. Build for production
npm run build
```

## 🐳 Docker Quick Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web-hootner-app

# Restart service
docker-compose restart web-hootner-app

# Stop all
docker-compose down
```

## 🧪 Testing Quick Commands

```bash
# All tests
npm test

# Specific tests
npm run test:frontend
npm run test:chaos
npm run test:smoke

# Load testing
npm run test:load
```

## 🔒 Security Quick Commands

```bash
# Security audit
npm run security:audit

# Scan for secrets
npm run security:scan

# Generate secrets
npm run generate:secrets

# Validate environment
npm run security:validate-env
```

## 🚀 Deployment Quick Commands

```bash
# Blue-green deployment
npm run deploy:blue-green

# Kubernetes deployment
npm run k8s:deploy

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Maintenance Quick Commands

```bash
# Backup
npm run backup

# Health check
node healthcheck.js

# Clean Docker
docker system prune -a

# Update dependencies
npm update && npm audit fix
```

## 🤖 AI Services Quick Commands

```bash
# Setup AI
npm run ai:setup

# Start video generation
npm run video:start

# Start all AI services
npm run services:start

# Test AI
npm run video:example
```

## 📊 Monitoring Quick Commands

```bash
# View Grafana
http://localhost:3013

# View Prometheus
http://localhost:9090

# Service status
docker-compose ps
kubectl get pods
```

## 🔍 Debugging Quick Commands

```bash
# View logs
docker-compose logs -f <service>
kubectl logs -f deployment/<app>

# Execute in container
docker-compose exec web-hootner-app bash
kubectl exec -it <pod> -- bash

# Debug Node.js
node --inspect server.js
```

## 📦 Package Management Quick Commands

```bash
# Install dependencies
npm install

# Update packages
npm update

# Security fixes
npm audit fix

# Clean install
rm -rf node_modules && npm install
```

## 🌐 Frontend Quick Commands

```bash
# Start frontend dev server
cd apps/frontend && npm run dev

# Build frontend
cd apps/frontend && npm run build

# Lint frontend
cd apps/frontend && npm run lint:fix
```

## 🖥️ Server Quick Commands

```bash
# Start server with auto-reload
cd apps/server && npm run dev

# Start production server
cd apps/server && npm start

# Server health check
curl http://localhost:5000/health
```

## 🔄 Git Workflow Quick Commands

```bash
# Standard workflow
git add .
git commit -m "feat: add new feature"
git push origin main

# Create feature branch
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## 📋 Environment Quick Setup

```bash
# Copy environment files
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env

# Generate secrets
npm run generate:secrets

# Validate setup
npm run security:validate-env
```

## 🎯 Performance Quick Commands

```bash
# Performance test
npm run test:load

# Bundle analysis
npm run analyze:bundle

# Memory profiling
node --inspect lib/memory-profiler.js
```

## 🔧 Troubleshooting Quick Commands

```bash
# Check service health
curl http://localhost:5000/health
docker-compose ps

# View error logs
grep "ERROR" logs/app.log
docker-compose logs --tail=50 web-hootner-app

# Restart services
docker-compose restart
kubectl rollout restart deployment/hootner-app
```

## 📱 Mobile/PWA Quick Commands

```bash
# Start HTTPS server (for PWA)
cd apps/frontend && npm run dev:secure

# Test PWA features
open https://localhost:3000/video-player.html

# Install PWA
# Use browser's install prompt
```

## 🎬 Video Player Quick Commands

```bash
# Start video player server
cd apps/frontend/html-pages
node video-player-server.js

# Access player
open http://localhost:3000/video-player.html

# Test offline mode
# Click download button in player
```

## 🔗 Useful URLs (Development)

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main frontend |
| API | http://localhost:5000 | Main API |
| Video Player | http://localhost:3000/video-player.html | Video player |
| Grafana | http://localhost:3013 | Monitoring |
| Prometheus | http://localhost:9090 | Metrics |
| Documentation | http://localhost:8080 | Generated docs |

## 🆘 Emergency Commands

```bash
# Emergency stop
docker-compose down
kubectl delete deployment --all

# Emergency backup
npm run backup

# Emergency security lockdown
node scripts/emergency-lockdown.js

# Emergency recovery
node scripts/emergency-recovery.js
```

## 📞 Quick Help

```bash
# Get help for npm scripts
npm run

# Docker help
docker-compose --help

# Kubernetes help
kubectl --help

# View package.json scripts
cat package.json | grep -A 50 "scripts"
```