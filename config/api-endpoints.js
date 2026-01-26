/**
 * Central API Endpoints Configuration
 * 
 * This module provides a centralized configuration system for all API endpoints
 * in the HOOTNER application. It supports multiple environments (development, 
 * staging, production) through environment variables.
 * 
 * Usage in Browser (ES Module):
 *   import { API_ENDPOINTS } from '/config/api-endpoints.js';
 *   fetch(`${API_ENDPOINTS.API_BASE}/users`);
 * 
 * Usage in Node.js (CommonJS):
 *   const { API_ENDPOINTS } = require('./config/api-endpoints.js');
 *   console.log(API_ENDPOINTS.API_BASE);
 */

// Helper to get environment variable (works in both browser and Node.js)
function getEnvVar(key, defaultValue) {
  // Browser environment (Vite injects import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // Fallback to default
  return defaultValue;
}

/**
 * API Endpoints Configuration Object
 * All endpoints can be overridden via environment variables with VITE_ prefix
 */
export const API_ENDPOINTS = {
  // Main REST API
  API_BASE: getEnvVar('VITE_API_BASE', 'http://localhost:4000'),
  
  // Main WebSocket
  WS_URL: getEnvVar('VITE_WS_URL', 'ws://localhost:3005'),
  
  // Dashboard URL (for redirects after login)
  DASHBOARD_URL: getEnvVar('VITE_DASHBOARD_URL', 'http://localhost:3005'),
  
  // GraphQL API
  GRAPHQL_API: getEnvVar('VITE_GRAPHQL_API', 'http://localhost:4000/graphql'),
  
  // GraphQL WebSocket (subscriptions)
  GRAPHQL_WS: getEnvVar('VITE_GRAPHQL_WS', 'ws://localhost:4000/graphql'),
  
  // Video Generation API
  VIDEO_API: getEnvVar('VITE_VIDEO_API', 'http://localhost:5003'),
  
  // Video Player API
  VIDEO_PLAYER_API: getEnvVar('VITE_VIDEO_PLAYER_API', 'http://localhost:3000'),
  
  // Analytics API
  ANALYTICS_API: getEnvVar('VITE_ANALYTICS_API', 'http://localhost:5003/api/analytics'),
  
  // Watch Party WebSocket
  WATCH_PARTY_WS: getEnvVar('VITE_WATCH_PARTY_WS', 'ws://localhost:5004'),
  
  // Language Server Protocol (LSP) Endpoints
  LSP_JAVASCRIPT: getEnvVar('VITE_LSP_JAVASCRIPT', 'ws://localhost:3001/lsp/javascript'),
  LSP_TYPESCRIPT: getEnvVar('VITE_LSP_TYPESCRIPT', 'ws://localhost:3001/lsp/typescript'),
  LSP_PYTHON: getEnvVar('VITE_LSP_PYTHON', 'ws://localhost:3001/lsp/python'),
  LSP_JAVA: getEnvVar('VITE_LSP_JAVA', 'ws://localhost:3001/lsp/java'),
  LSP_CPP: getEnvVar('VITE_LSP_CPP', 'ws://localhost:3001/lsp/cpp'),
  
  // Specific API Endpoints
  MESSAGES_API: getEnvVar('VITE_MESSAGES_API', 'http://localhost:4000/api/messages'),
  MARKETPLACE_API: getEnvVar('VITE_MARKETPLACE_API', 'http://localhost:4000/api/marketplace'),
  CONTACT_API: getEnvVar('VITE_CONTACT_API', 'http://localhost:4000/api/contact'),
  
  // Deployment Configuration (Node.js only)
  CLOUDFRONT_DIST_ID: getEnvVar('CLOUDFRONT_DIST_ID', ''),
  CLOUDFRONT_URL: getEnvVar('CLOUDFRONT_URL', ''),
  AWS_S3_BUCKET: getEnvVar('AWS_S3_BUCKET', 'hootner-frontend'),
  AWS_REGION: getEnvVar('AWS_REGION', 'us-east-1'),
};

/**
 * Validate that required endpoints are configured
 * Call this in your application initialization
 * 
 * @param {string[]} requiredEndpoints - Array of required endpoint keys
 * @returns {boolean} True if all required endpoints are set
 */
export function validateEndpoints(requiredEndpoints = ['API_BASE', 'WS_URL']) {
  const missing = [];
  
  for (const endpoint of requiredEndpoints) {
    if (!API_ENDPOINTS[endpoint] || API_ENDPOINTS[endpoint] === '') {
      missing.push(endpoint);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required API endpoints:', missing);
    return false;
  }
  
  console.log('✅ API endpoints configured:', 
    Object.fromEntries(
      requiredEndpoints.map(key => [key, API_ENDPOINTS[key]])
    )
  );
  return true;
}

/**
 * Get environment name
 * @returns {string} Current environment (development, staging, production)
 */
export function getEnvironment() {
  return getEnvVar('NODE_ENV', 'development');
}

/**
 * Check if running in production
 * @returns {boolean} True if in production environment
 */
export function isProduction() {
  return getEnvironment() === 'production';
}

/**
 * Check if running in development
 * @returns {boolean} True if in development environment
 */
export function isDevelopment() {
  return getEnvironment() === 'development';
}

// CommonJS export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_ENDPOINTS,
    validateEndpoints,
    getEnvironment,
    isProduction,
    isDevelopment,
  };
}
