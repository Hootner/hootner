// Layer 8 Operations - Central Export
// DevOps, monitoring, infrastructure automation

// Deployment Services
export { default as DeploymentService } from './deployment/DeploymentService.js';

// Monitoring Services
export { default as MonitoringService } from './monitoring/MonitoringService.js';

// Infrastructure Services
export { default as InfrastructureService } from './infrastructure/InfrastructureService.js';

// Backup Services
export { default as BackupService } from './backup/BackupService.js';

/**
 * Layer 8 - Operations
 *
 * Purpose: DevOps automation, monitoring, infrastructure management
 *
 * Components:
 * - Deployment: Blue-green, canary, rolling deployments with auto-rollback
 * - Monitoring: Prometheus metrics, Grafana dashboards, alerting
 * - Infrastructure: Terraform/CloudFormation IaC, resource provisioning
 * - Backup: Automated backups, disaster recovery, point-in-time restore
 *
 * Layer Dependencies:
 * - Depends on: Layer 0 (Infrastructure) for logging and storage
 * - Provides: Operational capabilities for all layers
 * - Integrates with: CI/CD pipelines, cloud providers, monitoring tools
 */
