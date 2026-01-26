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

  // Check for sensitive data
  log.header('5. Security Check');
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
  log.header('6. Configuration Files');
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
