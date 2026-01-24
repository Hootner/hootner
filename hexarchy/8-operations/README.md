# Layer 8 - Operations

DevOps automation, monitoring, infrastructure management, and disaster recovery for the Hootner video platform.

## 📁 Structure

```
8-operations/
├── deployment/                # Deployment Automation
│   └── DeploymentService.js           # Blue-green, canary, rolling
├── monitoring/                # Observability & Alerting
│   └── MonitoringService.js           # Metrics, dashboards, alerts
├── infrastructure/            # Infrastructure as Code
│   └── InfrastructureService.js       # Terraform, CloudFormation
├── backup/                    # Backup & Disaster Recovery
│   └── BackupService.js               # Backups, restore, DR plans
├── index.js                   # Central export
└── README.md                  # This file
```

## 🎯 Purpose

Layer 8 provides operational excellence and DevOps automation:
- **Deployment**: Automated deployments with 4 strategies (blue-green, canary, rolling, recreate)
- **Monitoring**: Real-time metrics, dashboards, alerting (Prometheus + Grafana)
- **Infrastructure**: Infrastructure as Code (Terraform, CloudFormation, Ansible)
- **Backup**: Automated backups, disaster recovery, point-in-time restore

## 🚀 Deployment Automation

### DeploymentService
Automated zero-downtime deployments with health checks and rollback:

**Deployment Strategies:**
- **BLUE_GREEN** - Deploy to inactive environment, switch traffic atomically
- **CANARY** - Gradual rollout (10% → 25% → 50% → 100%) with monitoring
- **ROLLING** - Update pods incrementally with configurable surge/unavailability
- **RECREATE** - Delete old, create new (downtime expected)

**Environments:**
- DEVELOPMENT - Dev environment
- STAGING - Pre-production testing
- PRODUCTION - Live environment

**Methods:**
- `deploy(deploymentConfig)` - Execute deployment
  - Config: application, version, environment, strategy, healthCheckUrl, rollbackOnFailure
  - Creates deployment record, executes strategy, performs health check
  - Auto-rollback on failure (if enabled)
- `blueGreenDeploy(deployment, config)` - Zero-downtime deployment
  - Deploy to inactive environment (blue/green)
  - Switch traffic atomically
  - Keep previous environment for rollback
- `canaryDeploy(deployment, config)` - Progressive rollout
  - Deploy canary version (10% traffic)
  - Monitor metrics for 5 minutes
  - Gradually increase traffic: 25% (3min) → 50% (3min) → 100%
  - Auto-rollback if error rate > 5% or latency > 1s
- `rollingDeploy(deployment, config)` - Incremental update
  - Update pods one-by-one or in batches
  - maxSurge: extra pods during rollout
  - maxUnavailable: max pods down during rollout
- `recreateDeploy(deployment, config)` - Complete replacement (downtime)
- `rollback(deploymentId)` - Revert to previous version
  - Finds previous successful deployment
  - Deploys previous version with rolling strategy
- `performHealthCheck(healthCheckUrl, retries)` - HTTP health check (3 retries, 5s interval)
- `monitorCanaryMetrics(application, environment, durationMinutes)` - Monitor canary health
  - Error rate threshold: 5%
  - Latency threshold: 1000ms
  - Throws error if thresholds exceeded
- `getDeploymentHistory(application, environment, limit)` - Deployment history
- `getDeploymentStatus(deploymentId)` - Current deployment status

**Deployment Flow:**
1. Create deployment record
2. Execute strategy (blue-green/canary/rolling/recreate)
3. Health check new deployment
4. Auto-rollback if health check fails
5. Mark as completed or failed

**Canary Rollout:**
```
10% → Monitor (5min) → 25% → Monitor (3min) → 50% → Monitor (3min) → 100%
```

## 📊 Monitoring & Observability

### MonitoringService
Comprehensive monitoring with Prometheus, Grafana, and AlertManager:

**Metric Types:**
- COUNTER - Monotonically increasing (requests, errors)
- GAUGE - Point-in-time value (CPU, memory)
- HISTOGRAM - Distribution (latency buckets)
- SUMMARY - Statistical summary (quantiles)

**Alert Severities:**
- CRITICAL - Immediate action required
- WARNING - Should be investigated soon
- INFO - Informational only

**Methods:**
- `recordMetric(metricData)` - Push metric to Prometheus
  - name, value, type, labels, timestamp
- `queryMetrics(query, startTime, endTime)` - PromQL queries
- `getSystemMetrics(service, timeRange)` - Comprehensive metrics
  - CPU, memory, disk, network, request metrics
- `getCPUUsage(service, timeRange)` - CPU utilization
  - Current, average, max, timeline
  - Query: `avg(rate(container_cpu_usage_seconds_total{service="X"}[5m]))`
- `getMemoryUsage(service, timeRange)` - Memory usage
  - Query: `avg(container_memory_usage_bytes{service="X"})`
- `getDiskUsage(service, timeRange)` - Disk space
- `getNetworkMetrics(service, timeRange)` - Network I/O (bytes in/out)
- `getRequestMetrics(service, timeRange)` - HTTP metrics
  - Request rate, error rate, P95 latency
  - Queries: `rate(http_requests_total)`, `histogram_quantile(0.95, ...)`
- `createAlertRule(ruleConfig)` - Create alert
  - name, query, condition, duration, severity, annotations
  - Example: CPU > 80% for 5 minutes
- `getActiveAlerts(filters)` - List active alerts
- `acknowledgeAlert(alertId, acknowledgedBy)` - Acknowledge alert
- `resolveAlert(alertId, resolvedBy, resolution)` - Close alert
- `createDashboard(dashboardConfig)` - Create Grafana dashboard
  - title, description, panels (graphs, stats, tables)
- `createServiceHealthDashboard(service)` - Auto-generate service dashboard
  - Panels: CPU, memory, request rate, error rate, P95 latency
- `getServiceHealthStatus(service)` - Health check
  - Checks: CPU < 80%, memory < 85%, error rate < 5%, latency < 1s
  - Status: healthy, degraded, unhealthy
- `getPlatformOverview()` - Platform-wide health
  - All services status
  - Active alerts summary
  - Healthy/degraded/unhealthy counts

**Health Thresholds:**
- CPU: 80%
- Memory: 85%
- Error Rate: 5%
- P95 Latency: 1000ms

**Key Metrics:**
```
# CPU Usage
avg(rate(container_cpu_usage_seconds_total{service="api"}[5m]))

# Memory Usage
avg(container_memory_usage_bytes{service="api"})

# Request Rate
rate(http_requests_total{service="api"}[5m])

# Error Rate
rate(http_requests_total{service="api", status=~"5.."}[5m])

# P95 Latency
histogram_quantile(0.95, http_request_duration_seconds{service="api"})
```

## 🏗️ Infrastructure as Code

### InfrastructureService
Multi-cloud infrastructure provisioning with Terraform, CloudFormation, Ansible:

**Providers:**
- TERRAFORM - HashiCorp Terraform (AWS, GCP, Azure)
- CLOUDFORMATION - AWS CloudFormation
- ANSIBLE - Ansible automation

**Resource Types:**
- COMPUTE - EC2 instances, containers
- STORAGE - S3 buckets, EBS volumes
- NETWORK - VPCs, subnets, load balancers
- DATABASE - RDS, DynamoDB
- CACHE - ElastiCache, Redis
- QUEUE - SQS, Kafka
- CDN - CloudFront, Fastly

**Methods:**
- `provisionInfrastructure(config)` - Provision resources
  - provider, environment, resources, variables
  - Generates provider-specific config
  - Applies infrastructure changes
- `terraformProvision(environment, resources, variables)` - Terraform workflow
  - terraform init → plan → apply
  - State stored in S3 backend
- `cloudFormationProvision(environment, resources, variables)` - CloudFormation
  - Create or update stack
  - Wait for completion
- `ansibleProvision(environment, resources, variables)` - Ansible playbooks
  - Generate playbook, execute tasks
- `generateTerraformConfig(environment, resources, variables)` - HCL generation
- `generateTerraformResource(resource, environment, variables)` - Resource blocks
  - aws_instance, aws_db_instance, aws_s3_bucket
- `generateCloudFormationTemplate(environment, resources, variables)` - CFN JSON
- `generateAnsiblePlaybook(environment, resources, variables)` - YAML playbook
- `destroyInfrastructure(config)` - Teardown infrastructure
- `getInfrastructureState(provider)` - Current state
- `validateInfrastructure(config)` - Validate config before apply
- `scaleInfrastructure(resourceName, desiredCount)` - Scale resources

**Terraform Example:**
```hcl
resource "aws_instance" "api_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  tags = {
    Name = "api-server-production"
    Environment = "production"
  }
}

resource "aws_db_instance" "postgres" {
  engine            = "postgres"
  engine_version    = "13"
  instance_class    = "db.t3.medium"
  allocated_storage = 100
}

resource "aws_s3_bucket" "media" {
  bucket = "hootner-media-production"
  acl    = "private"
  versioning {
    enabled = true
  }
}
```

## 💾 Backup & Disaster Recovery

### BackupService
Automated backups with compression, encryption, and disaster recovery:

**Backup Types:**
- FULL - Complete backup
- INCREMENTAL - Changes since last backup
- DIFFERENTIAL - Changes since last full backup
- SNAPSHOT - Point-in-time snapshot

**Backup Frequencies:**
- HOURLY - Every hour
- DAILY - Once per day
- WEEKLY - Once per week
- MONTHLY - Once per month

**Retention Policies:**
- HOURLY: 7 days
- DAILY: 30 days
- WEEKLY: 90 days
- MONTHLY: 365 days

**Methods:**
- `createBackup(backupConfig)` - Create backup
  - resource (database:name, storage:bucket, config:name)
  - type (full/incremental/differential/snapshot)
  - compression, encryption
  - Returns: backup ID, path, size, expiration date
- `backupDatabase(databaseName, type)` - Database backup
  - Full backup, incremental, or snapshot
- `backupStorage(bucketName, type)` - S3 bucket backup
  - Download all objects, package as JSON
- `backupConfiguration(configName)` - Config export
- `restoreBackup(backupId, restoreOptions)` - Restore from backup
  - targetResource, pointInTime, verifyIntegrity
  - Decrypt → Decompress → Verify → Restore
- `restoreDatabase(databaseName, backupData)` - Database restore
- `restoreStorage(bucketName, backupData)` - Storage restore
- `restoreConfiguration(configName, backupData)` - Config import
- `compressBackup(data)` - Gzip compression
- `decompressBackup(data)` - Decompress
- `encryptBackup(data)` - AES-256 encryption
- `decryptBackup(data)` - Decrypt
- `storeBackup(backupId, data)` - Upload to S3
- `retrieveBackup(backupPath)` - Download from S3
- `verifyBackupIntegrity(backupData, backup)` - Checksum validation
- `listBackups(filters)` - List backups (resource, type, date range)
- `deleteBackup(backupId)` - Delete backup and metadata
- `cleanupExpiredBackups()` - Remove expired backups (daily job)
- `testRestore(backupId)` - Test restore to verify integrity
  - Restore to test environment, verify, cleanup
- `createDisasterRecoveryPlan(planConfig)` - DR plan
  - resources, RTO, RPO, backup frequency, replication

**Backup Flow:**
1. Determine backup method (database/storage/config)
2. Create backup data
3. Compress (gzip)
4. Encrypt (AES-256)
5. Upload to S3 (`s3://hootner-backups/backups/{backupId}.bak`)
6. Save metadata (size, path, expiration)
7. Apply retention policy

**Restore Flow:**
1. Retrieve backup from S3
2. Decrypt (if encrypted)
3. Decompress (if compressed)
4. Verify integrity (checksums)
5. Restore to target resource
6. Validate restore

## 🏗️ Layer Dependencies

**Depends on:**
- Layer 0 (Infrastructure) - Logging, storage, cloud clients

**Provides:**
- Deployment automation for all services
- Monitoring and alerting for platform health
- Infrastructure provisioning for all environments
- Backup and disaster recovery for all data

**Integrates with:**
- Kubernetes (K8s) - Container orchestration
- Prometheus - Metrics collection
- Grafana - Dashboards and visualization
- AlertManager - Alert routing and notification
- Terraform - Infrastructure provisioning
- AWS CloudFormation - AWS resource management
- Ansible - Configuration management
- GitHub Actions - CI/CD pipelines

## 📚 Usage Examples

### Deployment Automation
```javascript
import { DeploymentService } from './hexarchy/8-operations/index.js';

const deployer = new DeploymentService(k8sClient, helmClient, gitClient);

// Blue-green deployment
await deployer.deploy({
  application: 'api-server',
  version: '2.0.0',
  environment: 'production',
  strategy: 'blue_green',
  healthCheckUrl: 'https://api.hootner.com/health',
  rollbackOnFailure: true
});

// Canary deployment with gradual rollout
await deployer.deploy({
  application: 'frontend',
  version: '1.5.0',
  environment: 'production',
  strategy: 'canary',
  canaryPercentage: 10,
  healthCheckUrl: 'https://hootner.com/health',
  rollbackOnFailure: true
});

// Rolling deployment
await deployer.deploy({
  application: 'video-processor',
  version: '3.1.0',
  environment: 'production',
  strategy: 'rolling',
  maxSurge: 2,
  maxUnavailable: 0
});

// Rollback to previous version
await deployer.rollback('deploy_1234567890');

// Get deployment history
const history = await deployer.getDeploymentHistory('api-server', 'production', 10);
```

### Monitoring & Alerting
```javascript
import { MonitoringService } from './hexarchy/8-operations/index.js';

const monitoring = new MonitoringService(prometheusClient, grafanaClient, alertManager);

// Record custom metric
await monitoring.recordMetric({
  name: 'video_processing_duration',
  value: 45.2,
  type: 'histogram',
  labels: { service: 'video-processor', quality: '1080p' }
});

// Get system metrics
const metrics = await monitoring.getSystemMetrics('api-server', '1h');
console.log('CPU Usage:', metrics.cpu.current);
console.log('Memory Usage:', metrics.memory.current);
console.log('Request Rate:', metrics.requests.requestRate);
console.log('Error Rate:', metrics.requests.errorRate);
console.log('P95 Latency:', metrics.requests.p95Latency);

// Create alert rule
await monitoring.createAlertRule({
  name: 'HighErrorRate',
  query: 'rate(http_requests_total{status=~"5..", service="api"}[5m])',
  condition: '> 0.05',
  duration: '5m',
  severity: 'critical',
  annotations: {
    summary: 'High error rate detected',
    description: 'Error rate is above 5% for 5 minutes'
  }
});

// Get service health
const health = await monitoring.getServiceHealthStatus('api-server');
console.log('Status:', health.status); // healthy, degraded, unhealthy
console.log('Checks:', health.checks);

// Create service dashboard
const dashboard = await monitoring.createServiceHealthDashboard('api-server');

// Get platform overview
const overview = await monitoring.getPlatformOverview();
console.log('Healthy Services:', overview.summary.healthyServices);
console.log('Active Alerts:', overview.alerts.length);
```

### Infrastructure as Code
```javascript
import { InfrastructureService } from './hexarchy/8-operations/index.js';

const infra = new InfrastructureService(terraformClient, cloudFormationClient, ansibleClient);

// Provision infrastructure with Terraform
await infra.provisionInfrastructure({
  provider: 'terraform',
  environment: 'production',
  resources: [
    {
      type: 'compute',
      name: 'api-server',
      config: {
        instanceType: 't3.large',
        ami: 'ami-0c55b159cbfafe1f0'
      }
    },
    {
      type: 'database',
      name: 'postgres-main',
      config: {
        engine: 'postgres',
        version: '14',
        instanceClass: 'db.t3.large',
        storage: 200
      }
    },
    {
      type: 'storage',
      name: 'media-bucket',
      config: {
        acl: 'private',
        versioning: true
      }
    }
  ],
  variables: {
    region: 'us-east-1'
  }
});

// Provision with CloudFormation
await infra.provisionInfrastructure({
  provider: 'cloudformation',
  environment: 'staging',
  resources: [
    { type: 'compute', name: 'app-server', config: { instanceType: 't3.medium' } }
  ]
});

// Validate before provisioning
const validation = await infra.validateInfrastructure({
  provider: 'terraform',
  environment: 'production',
  resources: [...]
});

console.log('Valid:', validation.valid);

// Get current state
const state = await infra.getInfrastructureState('terraform');

// Scale infrastructure
await infra.scaleInfrastructure('api-autoscaling-group', 10);

// Destroy infrastructure
await infra.destroyInfrastructure({
  provider: 'terraform',
  environment: 'development'
});
```

### Backup & Disaster Recovery
```javascript
import { BackupService } from './hexarchy/8-operations/index.js';

const backup = new BackupService(storageClient, databaseClient);

// Create database backup
const dbBackup = await backup.createBackup({
  resource: 'database:postgres-main',
  type: 'full',
  compression: true,
  encryption: true
});

console.log('Backup ID:', dbBackup.id);
console.log('Size:', dbBackup.size);
console.log('Path:', dbBackup.path);

// Create storage backup
const storageBackup = await backup.createBackup({
  resource: 'storage:media-bucket',
  type: 'snapshot'
});

// Restore from backup
await backup.restoreBackup(dbBackup.id, {
  targetResource: 'database:postgres-main',
  verifyIntegrity: true
});

// Point-in-time restore
await backup.restoreBackup(dbBackup.id, {
  targetResource: 'database:postgres-restored',
  pointInTime: '2026-01-23T10:00:00Z'
});

// List backups
const backups = await backup.listBackups({
  resource: 'database:postgres-main',
  type: 'full',
  startDate: '2026-01-01',
  endDate: '2026-01-31'
});

// Test restore
const testResult = await backup.testRestore(dbBackup.id);
console.log('Restore test:', testResult.verified ? 'PASSED' : 'FAILED');

// Cleanup expired backups (scheduled daily)
await backup.cleanupExpiredBackups();

// Create disaster recovery plan
const drPlan = await backup.createDisasterRecoveryPlan({
  resources: ['database:postgres-main', 'storage:media-bucket'],
  rto: 1,  // 1 hour Recovery Time Objective
  rpo: 0.25,  // 15 minutes Recovery Point Objective
  backupFrequency: 'hourly',
  replicationEnabled: true
});
```

## 🔧 Operational Workflows

### Complete Deployment Workflow
```javascript
// 1. Validate infrastructure
const validation = await infra.validateInfrastructure(config);

// 2. Create pre-deployment backup
const backup = await backupService.createBackup({
  resource: 'database:main',
  type: 'full',
  compression: true,
  encryption: true
});

// 3. Deploy with canary strategy
const deployment = await deployer.deploy({
  application: 'api',
  version: '2.0.0',
  environment: 'production',
  strategy: 'canary',
  rollbackOnFailure: true
});

// 4. Monitor deployment health
const health = await monitoring.getServiceHealthStatus('api');

// 5. If deployment fails, restore from backup
if (deployment.status === 'failed') {
  await backupService.restoreBackup(backup.id);
}
```

### Automated Backup Schedule
```javascript
import cron from 'node-cron';

// Hourly backups
cron.schedule('0 * * * *', async () => {
  await backupService.createBackup({
    resource: 'database:main',
    type: 'incremental',
    compression: true,
    encryption: true
  });
});

// Daily full backups
cron.schedule('0 2 * * *', async () => {
  await backupService.createBackup({
    resource: 'database:main',
    type: 'full',
    compression: true,
    encryption: true
  });
});

// Weekly cleanup
cron.schedule('0 3 * * 0', async () => {
  await backupService.cleanupExpiredBackups();
});
```

### Real-time Monitoring Dashboard
```javascript
// Create comprehensive dashboard
const dashboard = await monitoring.createDashboard({
  title: 'Hootner Platform Overview',
  description: 'Real-time platform metrics',
  panels: [
    {
      title: 'Active Users',
      type: 'stat',
      query: 'count(active_sessions)'
    },
    {
      title: 'Request Rate',
      type: 'graph',
      query: 'sum(rate(http_requests_total[5m]))'
    },
    {
      title: 'Error Rate',
      type: 'graph',
      query: 'sum(rate(http_requests_total{status=~"5.."}[5m]))'
    },
    {
      title: 'Platform Health',
      type: 'heatmap',
      query: 'service_health_score'
    }
  ],
  refresh: '10s'
});
```

## ✅ Complete

Layer 8 (Operations) is **100% complete** with:
- ✅ 1 deployment service (4 strategies: blue-green, canary, rolling, recreate)
- ✅ 1 monitoring service (Prometheus, Grafana, AlertManager)
- ✅ 1 infrastructure service (Terraform, CloudFormation, Ansible)
- ✅ 1 backup service (4 types, encryption, DR plans)
- ✅ Central export file

**Total: 6 files** providing comprehensive operational excellence and DevOps automation.

**Key Features:**
- Zero-downtime deployments with auto-rollback
- Real-time monitoring with customizable alerts
- Multi-cloud infrastructure provisioning
- Automated backups with encryption and compression
- Disaster recovery with RTO/RPO compliance
- Canary deployments with automatic metric monitoring
- Blue-green deployments with traffic switching
- Service health checks with auto-remediation
- Infrastructure validation before provisioning
- Point-in-time restore capabilities

---

**🎉 ALL 8 LAYERS COMPLETE! 🎉**

The Hootner video platform now has a complete hexagonal architecture from infrastructure to operations:
- Layer 0: Infrastructure (70+ files)
- Layer 1: Foundation (47 files)
- Layer 2: Intelligence (8 files)
- Layer 3: Communication (31 files)
- Layer 4: Interface (22 files)
- Layer 5: Economy (8 files)
- Layer 6: Governance (8 files)
- Layer 7: Data (6 files)
- Layer 8: Operations (6 files)

**Total: 206+ files across 8 architectural layers!**
