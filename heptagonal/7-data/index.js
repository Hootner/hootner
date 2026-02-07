// Layer 7 Data - Central Export
// Data warehousing, ETL, analytics, and reporting

// Warehouse Services
export { default as DataWarehouseService } from './warehouse/DataWarehouseService.js';

// ETL Services
export { default as ETLService } from './etl/ETLService.js';

// Analytics Services
export { default as BusinessIntelligenceService } from './analytics/BusinessIntelligenceService.js';

// Reporting Services
export { default as DataExportService } from './reporting/DataExportService.js';

/**
 * Layer 7 - Data
 *
 * Purpose: Data warehousing, ETL, business intelligence, and reporting
 *
 * Components:
 * - Warehouse: Star schema (fact + dimension tables), aggregates
 * - ETL: Extract, transform, load pipelines
 * - Analytics: Executive dashboards, BI reports, insights
 * - Reporting: Data exports, archival, GDPR compliance
 *
 * Layer Dependencies:
 * - Depends on: Layer 0 (Infrastructure) for logging and storage
 * - Depends on: Layer 1 (Foundation) for data models
 * - Provides: Analytics capabilities for Layer 4 (Interface) and Layer 8 (Operations)
 */
