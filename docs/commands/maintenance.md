# 🔧 Maintenance Commands Reference

## 🗄️ Backup Commands

```bash
# Unified backup manager
npm run backup
node scripts/backup-manager.js

# Legacy backup (deprecated)
./scripts/backup-all.sh

# Point-in-time recovery backup
./scripts/pitr-backup.sh

# Multi-region sync
./scripts/multi-region-sync.sh

# Backup specific services
node scripts/backup-manager.js --service mongodb
node scripts/backup-manager.js --service redis
node scripts/backup-manager.js --service files
```

## 📊 Monitoring & Health Checks

```bash
# Application health check
node healthcheck.js

# Service health monitoring
node services/watcher-service.js

# Backup monitoring
node services/backup-monitoring-service.js

# Security monitoring
node services/security-service.js

# Performance monitoring
node services/monitoring-service.js
```

## 🔄 Database Maintenance

```bash
# MongoDB maintenance
docker-compose exec mongodb mongosh
db.runCommand({compact: "collection_name"})
db.stats()
db.collection.getIndexes()

# Redis maintenance
docker-compose exec redis redis-cli
FLUSHDB  # Clear current database
FLUSHALL # Clear all databases
INFO memory
CONFIG GET maxmemory
```

## 🧹 Cleanup Commands

```bash
# Docker cleanup
docker system prune -a
docker volume prune
docker network prune
docker image prune

# Log cleanup
find logs/ -name "*.log" -mtime +30 -delete
truncate -s 0 logs/app.log

# Temporary files cleanup
rm -rf tmp/*
rm -rf uploads/temp/*
```

## 📈 Performance Optimization

```bash
# Analyze bundle size
npm run analyze:bundle

# Memory profiling
node --inspect lib/memory-profiler.js

# Performance monitoring
node lib/performance-monitor.js

# Database performance
node scripts/db-performance-check.js
```

## 🔄 Service Management

```bash
# Restart services
docker-compose restart web-hootner-app
docker-compose restart mongodb
docker-compose restart redis

# Graceful shutdown
node lib/graceful-shutdown.js

# Service status check
docker-compose ps
kubectl get pods
```

## 📊 Log Management

```bash
# View logs
docker-compose logs -f web-hootner-app
docker-compose logs --tail=100 mongodb
kubectl logs -f deployment/hootner-app

# Log rotation
logrotate /etc/logrotate.d/hootner

# Log analysis
grep "ERROR" logs/app.log
tail -f logs/security.log
```

## 🔧 Configuration Updates

```bash
# Update environment variables
cp .env.example .env.new
# Edit .env.new then:
mv .env .env.backup
mv .env.new .env

# Reload configuration
docker-compose restart web-hootner-app
kubectl rollout restart deployment/hootner-app
```

## 📦 Dependency Management

```bash
# Update dependencies
npm update
npm audit fix

# Security updates
npm audit fix --force
npx npm-check-updates -u

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🔒 Security Maintenance

```bash
# Regular security audit
npm run security:audit
node scripts/security-audit.js

# Update security patches
npm audit fix
docker pull node:18-alpine  # Update base images

# Certificate renewal
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

## 💾 Data Management

```bash
# Database backup verification
node scripts/verify-backup.js

# Data migration
node scripts/migrate-data.js

# Data cleanup
node scripts/cleanup-old-data.js

# Data integrity check
node scripts/data-integrity-check.js
```

## 🔄 Scheduled Maintenance

```bash
# Setup cron jobs
crontab -e

# Daily backup (example cron)
0 2 * * * /path/to/hootner/scripts/backup-manager.js

# Weekly cleanup
0 3 * * 0 /path/to/hootner/scripts/weekly-cleanup.sh

# Monthly security audit
0 4 1 * * /path/to/hootner/scripts/security-audit.js
```

## 📊 Monitoring Dashboards

```bash
# Access Grafana
http://localhost:3013
# Default: admin/admin (change in production)

# Access Prometheus
http://localhost:9090

# Custom monitoring
node services/monitoring-service.js
```

## 🔧 System Maintenance

```bash
# Check disk space
df -h
du -sh logs/
du -sh node_modules/

# Memory usage
free -h
ps aux --sort=-%mem | head

# CPU usage
top
htop
```

## 🗄️ Backup Verification

```bash
# Verify backup integrity
node scripts/verify-backup.js

# Test backup restoration
node scripts/test-restore.js

# Backup status report
node services/backup-monitoring-service.js --report
```

## 🔄 Service Recovery

```bash
# Restart failed services
docker-compose restart <service-name>
kubectl delete pod <pod-name>  # Kubernetes will recreate

# Emergency recovery
node scripts/emergency-recovery.js

# Disaster recovery
node scripts/disaster-recovery.js
```

## 📈 Capacity Planning

```bash
# Resource usage analysis
node scripts/resource-analysis.js

# Growth projection
node scripts/capacity-planning.js

# Performance baseline
node scripts/performance-baseline.js
```

## 🔧 Maintenance Scripts

```bash
# Daily maintenance
node scripts/daily-maintenance.js

# Weekly maintenance
node scripts/weekly-maintenance.js

# Monthly maintenance
node scripts/monthly-maintenance.js

# Emergency maintenance
node scripts/emergency-maintenance.js
```

## 📊 Compliance & Reporting

```bash
# Generate compliance report
node services/compliance-reporter.js

# Audit trail report
node scripts/audit-report.js

# Performance report
node scripts/performance-report.js

# Security report
node scripts/security-report.js
```

## 🔄 Update Procedures

```bash
# Application updates
git pull origin main
npm install
npm run build
docker-compose up -d --build

# Database schema updates
node scripts/migrate-schema.js

# Configuration updates
node scripts/update-config.js
```

## 🧪 Maintenance Testing

```bash
# Test backup/restore
node tests/backup-restore-test.js

# Test failover
node tests/failover-test.js

# Test monitoring
node tests/monitoring-test.js

# Test recovery procedures
node tests/recovery-test.js
```

## 📋 Maintenance Checklist

### Daily

- [ ] Check service health
- [ ] Review error logs
- [ ] Verify backup completion
- [ ] Monitor resource usage

### Weekly

- [ ] Security audit
- [ ] Performance review
- [ ] Dependency updates
- [ ] Log cleanup

### Monthly

- [ ] Capacity planning review
- [ ] Disaster recovery test
- [ ] Security patch updates
- [ ] Compliance report generation

### Quarterly

- [ ] Full system backup test
- [ ] Performance optimization
- [ ] Security assessment
- [ ] Documentation updates
