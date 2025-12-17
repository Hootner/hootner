# 🐳 Docker Commands Reference

## 🚀 Quick Start

```bash
# Development environment
npm run docker:up
# or
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose -f docker-compose.prod.yml up

# Stop all containers
npm run docker:down
# or
docker-compose down
```

## 🏗️ Build Commands

```bash
# Build all images
npm run docker:build
docker-compose -f docker-compose.dev.yml build

# Build specific services
docker-compose build web-hootner-app
docker-compose build frontend
docker-compose build auth-service

# Build with no cache
docker-compose build --no-cache

# Build individual Dockerfiles
docker build -t hootner-frontend -f Dockerfile.frontend .
docker build -t hootner-server -f Dockerfile .
docker build -t hootner-worker -f Dockerfile.worker .
```

## 🔄 Service Management

```bash
# Start specific services
docker-compose up web-hootner-app mongodb redis
docker-compose up frontend auth-service

# Start in detached mode
docker-compose up -d

# Restart services
docker-compose restart web-hootner-app
docker-compose restart frontend

# Stop specific services
docker-compose stop web-hootner-app
docker-compose stop frontend

# Remove containers
docker-compose rm web-hootner-app
docker-compose rm -f  # Force remove
```

## 📊 Monitoring & Logs

```bash
# View logs
docker-compose logs web-hootner-app
docker-compose logs -f frontend  # Follow logs
docker-compose logs --tail=100 mongodb

# View all logs
docker-compose logs

# Service status
docker-compose ps
docker-compose top

# Resource usage
docker stats
docker system df
```

## 🔍 Development & Debugging

```bash
# Execute commands in containers
docker-compose exec web-hootner-app bash
docker-compose exec mongodb mongosh
docker-compose exec redis redis-cli

# Run one-off commands
docker-compose run web-hootner-app npm test
docker-compose run frontend npm run lint

# Debug mode
docker-compose -f docker-compose.dev.yml up --build
```

## 🌐 Environment Configurations

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up
```

### Monitoring Stack
```bash
docker-compose -f docker-compose.monitoring.yml up
```

### Blue-Green Deployment
```bash
docker-compose -f docker-compose.blue-green.yml up
```

### Chaos Testing
```bash
docker-compose -f docker-compose.chaos.yml up
```

## 🔧 Maintenance Commands

```bash
# Clean up
docker system prune
docker volume prune
docker network prune
docker image prune

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove specific volumes
docker volume rm hootner_mongodb_data
docker volume rm hootner_redis_data

# Backup volumes
docker run --rm -v hootner_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .
```

## 📦 Registry Operations

```bash
# Tag images
docker tag hootner-frontend your-registry/hootner-frontend:latest
docker tag hootner-server your-registry/hootner-server:latest

# Push to registry
docker push your-registry/hootner-frontend:latest
docker push your-registry/hootner-server:latest

# Pull from registry
docker pull your-registry/hootner-frontend:latest
docker pull your-registry/hootner-server:latest
```

## 🏥 Health Checks

```bash
# Check container health
docker-compose ps
docker inspect --format='{{.State.Health.Status}}' container_name

# Manual health check
docker-compose exec web-hootner-app node healthcheck.js
docker-compose exec mongodb mongosh --eval 'db.adminCommand("ping")'
docker-compose exec redis redis-cli ping
```

## 🔒 Security Commands

```bash
# Scan images for vulnerabilities
docker scan hootner-frontend
docker scan hootner-server

# Run security audit
docker-compose exec web-hootner-app npm audit
docker-compose exec frontend npm audit

# Check for secrets
docker history hootner-frontend --no-trunc
docker history hootner-server --no-trunc
```

## 📋 Service Ports Reference

| Service | Port | Description |
|---------|------|-------------|
| web-hootner-app | 5000 | Main application |
| frontend | 3000 | Frontend dev server |
| auth-service | 3001 | Authentication |
| video-service | 3002 | Video processing |
| analytics-service | 3003 | Analytics |
| audit-service | 3004 | Audit logging |
| content-moderation | 3005 | Content moderation |
| event-service | 3006 | Event processing |
| marketplace-service | 3007 | Marketplace |
| profile-service | 3008 | User profiles |
| search-service | 3009 | Search functionality |
| security-service | 3010 | Security monitoring |
| subscription-service | 3011 | Subscriptions |
| notification-service | 3012 | Notifications |
| backup-service | 3013 | Backup management |
| backup-monitoring | 3014 | Backup monitoring |
| compliance-reporter | 3015 | Compliance reporting |
| mongodb | 27017 | Database |
| redis | 6380 | Cache (TLS) |
| localstack | 4566 | AWS services mock |
| prometheus | 9090 | Metrics |
| grafana | 3013 | Monitoring dashboard |

## 🔗 Useful Docker Compose Commands

```bash
# Scale services
docker-compose up --scale worker-agent=3
docker-compose up --scale auth-service=2

# Override files
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# Environment variables
docker-compose --env-file .env.production up

# Validate configuration
docker-compose config
docker-compose config --services
docker-compose config --volumes
```