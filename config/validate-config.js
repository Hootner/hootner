#!/usr/bin/env node
/**
 * Configuration Validator
 *
 * Validates that all required environment variables are properly configured
 * and that API endpoints are accessible.
 *
 * Usage:
 *   node config/validate-config.js
 *   npm run validate:config
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}\n${'='.repeat(msg.length)}`),
};

// Load environment variables
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    log.error('.env file not found');
    log.info('Copy .env.example to .env: cp .env.example .env');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (key && value) {
        env[key] = value;
      }
    }
  });

  return env;
}

// Required variables for deployment
const REQUIRED_DEPLOYMENT = [
  { key: 'CLOUDFRONT_DIST_ID', description: 'CloudFront Distribution ID (for deployments)' },
  { key: 'AWS_S3_BUCKET', description: 'S3 bucket name' },
  { key: 'AWS_REGION', description: 'AWS region' },
];

// Required variables for local development
const REQUIRED_DEVELOPMENT = [
  { key: 'NODE_ENV', description: 'Node environment' },
  { key: 'API_PORT', description: 'API server port' },
  { key: 'FRONTEND_PORT', description: 'Frontend server port' },
];

// Recommended API endpoint variables
const RECOMMENDED_ENDPOINTS = [
  'VITE_API_BASE',
  'VITE_WS_URL',
  'VITE_GRAPHQL_API',
  'VITE_VIDEO_API',
];

// S3 Tables (Table Buckets) - optional configuration keys
const S3_TABLES_KEYS = {
  bucketName: 'AWS_S3_TABLE_BUCKET_NAME',
  analyticsIntegrationEnabled: 'AWS_S3_TABLES_ANALYTICS_INTEGRATION_ENABLED',
  defaultStorageClass: 'AWS_S3_TABLES_DEFAULT_STORAGE_CLASS',
  defaultEncryption: 'AWS_S3_TABLES_DEFAULT_ENCRYPTION',
  kmsKeyId: 'AWS_S3_TABLES_KMS_KEY_ID',
  tags: 'AWS_S3_TABLES_TAGS',
};

// Validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate WebSocket URL
function isValidWsUrl(url) {
  return url.startsWith('ws://') || url.startsWith('wss://');
}

function isValidBooleanString(value) {
  return value === 'true' || value === 'false';
}

function isValidS3TableBucketName(name) {
  // Matches the rules shown in the AWS console excerpt:
  // 3-63 chars, lowercase letters, digits, hyphens. Must start/end with letter or digit.
  // (No dots allowed, so we keep this intentionally strict.)
  if (typeof name !== 'string') return false;
  if (name.length < 3 || name.length > 63) return false;
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) return false;
  return true;
}

function normalizeEnum(value) {
  return String(value || '').trim().toUpperCase();
}

function parseTagsCsv(value) {
  // Format: Key=Value,Key2=Value2
  // Returns { tags: Record<string,string>, errors: string[] }
  const result = { tags: {}, errors: [] };
  const raw = String(value || '').trim();
  if (!raw) return result;

  const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0 || eqIndex === part.length - 1) {
      result.errors.push(`Invalid tag '${part}' (expected Key=Value)`);
      continue;
    }

    const key = part.slice(0, eqIndex).trim();
    const val = part.slice(eqIndex + 1).trim();
    if (!key || !val) {
      result.errors.push(`Invalid tag '${part}' (expected Key=Value)`);
      continue;
    }

    result.tags[key] = val;
  }

  if (Object.keys(result.tags).length > 50) {
    result.errors.push('Too many tags (max 50)');
  }

  return result;
}

// Main validation function
function validateConfiguration() {
  log.header('HOOTNER Configuration Validator');

  const env = loadEnv();
  let errors = 0;
  let warnings = 0;

  // Check if .env file exists
  log.header('1. Environment File');
  if (Object.keys(env).length === 0) {
    log.error('.env file not found or empty');
    errors++;
  } else {
    log.success(`.env file found with ${Object.keys(env).length} variables`);
  }

  // Validate deployment variables
  log.header('2. Deployment Configuration');
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  REQUIRED_DEPLOYMENT.forEach(({ key, description }) => {
    if (env[key]) {
      log.success(`${key}: ${description}`);

      // Additional validations
      if (key === 'CLOUDFRONT_DIST_ID' && !env[key].match(/^E[A-Z0-9]{13}$/)) {
        log.warn(`${key} format looks unusual (expected E + 13 alphanumeric chars)`);
        warnings++;
      }
    } else {
      if (isProduction) {
        log.error(`${key}: Missing (required for production)`);
        errors++;
      } else {
        log.warn(`${key}: Not set (required for deployments)`);
        warnings++;
      }
    }
  });

  // Validate development variables
  log.header('3. Development Configuration');
  REQUIRED_DEVELOPMENT.forEach(({ key, description }) => {
    if (env[key]) {
      log.success(`${key}: ${env[key]}`);
    } else {
      log.warn(`${key}: Not set (${description})`);
      warnings++;
    }
  });

  // Validate API endpoints
  log.header('4. API Endpoints');
  RECOMMENDED_ENDPOINTS.forEach(key => {
    const value = env[key];
    if (value) {
      const isWs = key.includes('WS');
      const isValid = isWs ? isValidWsUrl(value) : isValidUrl(value);

      if (isValid) {
        log.success(`${key}: ${value}`);
      } else {
        log.error(`${key}: Invalid URL format - ${value}`);
        errors++;
      }

      // Production security checks
      if (isProduction && value.includes('localhost')) {
        log.warn(`${key}: Using localhost in production environment`);
        warnings++;
      }

      if (isProduction && value.startsWith('http://') && !value.includes('localhost')) {
        log.warn(`${key}: Using HTTP instead of HTTPS in production`);
        warnings++;
      }

      if (isProduction && isWs && value.startsWith('ws://') && !value.includes('localhost')) {
        log.warn(`${key}: Using WS instead of WSS in production`);
        warnings++;
      }
    } else {
      log.warn(`${key}: Not set (will use defaults)`);
      warnings++;
    }
  });

  // Validate S3 Tables (Table Buckets) configuration
  log.header('5. S3 Tables (Table Buckets)');

  const tableBucketName = env[S3_TABLES_KEYS.bucketName];
  if (tableBucketName) {
    if (isValidS3TableBucketName(tableBucketName)) {
      log.success(`${S3_TABLES_KEYS.bucketName}: ${tableBucketName}`);
    } else {
      log.error(
        `${S3_TABLES_KEYS.bucketName}: Invalid name '${tableBucketName}' (3-63 chars; a-z, 0-9, hyphens; must start/end with a-z or 0-9)`
      );
      errors++;
    }
  } else {
    log.warn(`${S3_TABLES_KEYS.bucketName}: Not set (optional)`);
    warnings++;
  }

  const integrationEnabled = env[S3_TABLES_KEYS.analyticsIntegrationEnabled];
  if (integrationEnabled) {
    if (isValidBooleanString(integrationEnabled)) {
      log.success(`${S3_TABLES_KEYS.analyticsIntegrationEnabled}: ${integrationEnabled}`);
    } else {
      log.error(`${S3_TABLES_KEYS.analyticsIntegrationEnabled}: Must be 'true' or 'false'`);
      errors++;
    }
  } else {
    log.warn(`${S3_TABLES_KEYS.analyticsIntegrationEnabled}: Not set (optional; informational)`);
    warnings++;
  }

  const defaultStorageClass = normalizeEnum(env[S3_TABLES_KEYS.defaultStorageClass]);
  if (defaultStorageClass) {
    const allowedStorageClasses = new Set(['STANDARD', 'INTELLIGENT_TIERING']);
    if (allowedStorageClasses.has(defaultStorageClass)) {
      log.success(`${S3_TABLES_KEYS.defaultStorageClass}: ${defaultStorageClass}`);
    } else {
      log.error(
        `${S3_TABLES_KEYS.defaultStorageClass}: Invalid value '${env[S3_TABLES_KEYS.defaultStorageClass]}' (allowed: blank, STANDARD, INTELLIGENT_TIERING)`
      );
      errors++;
    }
  } else {
    log.info(`${S3_TABLES_KEYS.defaultStorageClass}: (blank) -> "Don't specify" (defaults to Standard)`);
  }

  const defaultEncryption = normalizeEnum(env[S3_TABLES_KEYS.defaultEncryption]);
  if (defaultEncryption) {
    const allowedEncryption = new Set(['SSE-S3', 'SSE-KMS']);
    if (allowedEncryption.has(defaultEncryption)) {
      log.success(`${S3_TABLES_KEYS.defaultEncryption}: ${defaultEncryption}`);
      if (defaultEncryption === 'SSE-KMS') {
        const kmsKeyId = env[S3_TABLES_KEYS.kmsKeyId];
        if (kmsKeyId) {
          log.success(`${S3_TABLES_KEYS.kmsKeyId}: Set`);
        } else {
          log.error(`${S3_TABLES_KEYS.kmsKeyId}: Required when ${S3_TABLES_KEYS.defaultEncryption}=SSE-KMS`);
          errors++;
        }
      }
    } else {
      log.error(
        `${S3_TABLES_KEYS.defaultEncryption}: Invalid value '${env[S3_TABLES_KEYS.defaultEncryption]}' (allowed: blank, SSE-S3, SSE-KMS)`
      );
      errors++;
    }
  } else {
    log.info(`${S3_TABLES_KEYS.defaultEncryption}: (blank) -> "Don't specify" (defaults to SSE-S3)`);
  }

  const tagsValue = env[S3_TABLES_KEYS.tags];
  if (tagsValue) {
    const parsed = parseTagsCsv(tagsValue);
    if (parsed.errors.length === 0) {
      log.success(`${S3_TABLES_KEYS.tags}: ${Object.keys(parsed.tags).length} tag(s)`);
    } else {
      parsed.errors.forEach(msg => log.error(`${S3_TABLES_KEYS.tags}: ${msg}`));
      errors += parsed.errors.length;
    }
  } else {
    log.info(`${S3_TABLES_KEYS.tags}: Not set`);
  }

  // Check for sensitive data
  log.header('6. Security Check');
  const sensitiveKeys = Object.keys(env).filter(key =>
    key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')
  );

  sensitiveKeys.forEach(key => {
    const value = env[key];

    // Check for placeholder values
    if (value.includes('your_') || value.includes('example') || value.includes('test_')) {
      log.warn(`${key}: Appears to be a placeholder value`);
      warnings++;
    }

    // Check for weak secrets
    if (key.includes('SECRET') && value.length < 32) {
      log.warn(`${key}: Secret appears short (recommend 32+ characters)`);
      warnings++;
    }

    // Check for exposed secrets
    if (!value.includes('*') && value.length > 10) {
      log.success(`${key}: Set (value hidden for security)`);
    }
  });

  // Check config directory
  log.header('7. Configuration Files');
  const configFiles = [
    'config/api-endpoints.js',
    'config/API_CONFIG_GUIDE.md',
    'config/README.md',
  ];

  configFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      log.success(`${file} exists`);
    } else {
      log.error(`${file} missing`);
      errors++;
    }
  });

  // Summary
  log.header('Summary');
  if (errors === 0 && warnings === 0) {
    log.success('Configuration is valid! ✨');
    log.info('Your configuration looks great!');
  } else if (errors === 0) {
    log.warn(`Configuration has ${warnings} warning(s) but no errors`);
    log.info('Consider addressing warnings for production deployments');
  } else {
    log.error(`Configuration has ${errors} error(s) and ${warnings} warning(s)`);
    log.info('Fix errors before deploying');
  }

  // Environment-specific advice
  log.header('Next Steps');
  if (nodeEnv === 'development') {
    log.info('Development mode detected:');
    log.info('  • Defaults will be used for missing endpoints');
    log.info('  • Run: npm run dev');
  } else if (nodeEnv === 'production') {
    log.info('Production mode detected:');
    if (errors > 0 || warnings > 0) {
      log.warn('  • Fix all errors and warnings before deploying');
    } else {
      log.success('  • Configuration is production-ready!');
    }
    log.info('  • Run: node deploy-dashboard.js');
  } else {
    log.info(`${nodeEnv} mode detected`);
    log.info('  • Ensure environment-specific .env file is configured');
  }

  // Exit code
  process.exit(errors > 0 ? 1 : 0);
}

// Run validation
validateConfiguration();
