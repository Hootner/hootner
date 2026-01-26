/**
 * Centralized API Endpoint Configuration
 *
 * This module provides a single source of truth for all API endpoints
 * across the HOOTNER platform. It supports multiple environments
 * (development, staging, production) through environment variables.
 *
 * Usage:
 * ```javascript
 * import { API_ENDPOINTS } from './config/api-endpoints.js';
 *
 * fetch(`${API_ENDPOINTS.API_BASE}/users`)
 *   .then(res => res.json());
 *
 * const socket = io(API_ENDPOINTS.WS_URL);
 * ```
 */

// Helper to detect environment
const isDevelopment = () => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV === 'development';
  }
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }
  return true; // Default to development
};

// Helper to get environment variable (works in both Node.js and browser)
const getEnv = (key, defaultValue = '') => {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }

  // Vite/Webpack browser environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }

  // Browser fallback - check window.__ENV__ (can be set by build scripts)
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__[key] || defaultValue;
  }

  return defaultValue;
};

// Get base URL for APIs
const getApiBase = () => {
  const envUrl = getEnv('VITE_API_BASE') || getEnv('API_BASE');
  if (envUrl) return envUrl;

  // Auto-detect in browser
  if (typeof window !== 'undefined' && !isDevelopment()) {
    return window.location.origin;
  }

  return 'http://localhost:4000';
};

// Get WebSocket URL
const getWsUrl = () => {
  const envUrl = getEnv('VITE_WS_URL') || getEnv('WS_URL');
  if (envUrl) return envUrl;

  // Auto-detect in browser
  if (typeof window !== 'undefined' && !isDevelopment()) {
    return window.location.origin.replace(/^http/, 'ws');
  }

  return 'ws://localhost:3005';
};

/**
 * API Endpoint Configuration
 * All endpoints can be overridden via environment variables
 */
export const API_ENDPOINTS = {
  // Main REST API
  API_BASE: getEnv('VITE_API_BASE', getApiBase()),

  // WebSocket connections
  WS_URL: getEnv('VITE_WS_URL', getWsUrl()),

  // GraphQL API
  GRAPHQL_API: getEnv('VITE_GRAPHQL_API', `${getApiBase()}/graphql`),
  GRAPHQL_WS: getEnv('VITE_GRAPHQL_WS', `${getWsUrl()}/graphql`),

  // Video Services
  VIDEO_API: getEnv('VITE_VIDEO_API', 'http://localhost:5003'),
  VIDEO_PLAYER_API: getEnv('VITE_VIDEO_PLAYER_API', 'http://localhost:3000'),

  // Analytics
  ANALYTICS_API: getEnv('VITE_ANALYTICS_API', 'http://localhost:5003/api/analytics'),

  // Real-time features
  WATCH_PARTY_WS: getEnv('VITE_WATCH_PARTY_WS', 'ws://localhost:5004'),

  // Code Editor / LSP Services
  LSP_JAVASCRIPT: getEnv('VITE_LSP_JAVASCRIPT', 'ws://localhost:3001/lsp/javascript'),
  LSP_TYPESCRIPT: getEnv('VITE_LSP_TYPESCRIPT', 'ws://localhost:3001/lsp/typescript'),
  LSP_PYTHON: getEnv('VITE_LSP_PYTHON', 'ws://localhost:3001/lsp/python'),
  LSP_JAVA: getEnv('VITE_LSP_JAVA', 'ws://localhost:3001/lsp/java'),
  LSP_CPP: getEnv('VITE_LSP_CPP', 'ws://localhost:3001/lsp/cpp'),

  // Messaging
  MESSAGES_API: getEnv('VITE_MESSAGES_API', `${getApiBase()}/api/messages`),

  // Marketplace
  MARKETPLACE_API: getEnv('VITE_MARKETPLACE_API', `${getApiBase()}/api/marketplace`),

  // Contact
  CONTACT_API: getEnv('VITE_CONTACT_API', `${getApiBase()}/api/contact`),
};

/**
 * Port Configuration
 * Default ports for local development
 */
export const PORTS = {
  FRONTEND: parseInt(getEnv('FRONTEND_PORT', '3000'), 10),
  API: parseInt(getEnv('API_PORT', '4000'), 10),
  VIDEO_GEN: parseInt(getEnv('VIDEO_GEN_PORT', '5003'), 10),
  WATCH_PARTY: parseInt(getEnv('WATCH_PARTY_PORT', '5004'), 10),
  LSP: parseInt(getEnv('LSP_PORT', '3001'), 10),
  DASHBOARD: parseInt(getEnv('DASHBOARD_PORT', '3005'), 10),
};

/**
 * Environment helpers
 */
export const ENV = {
  isDevelopment: isDevelopment(),
  isProduction: !isDevelopment(),
  nodeEnv: getEnv('NODE_ENV', 'development'),
};

/**
 * Validate required endpoints are configured
 * Call this on app initialization to catch configuration errors early
 */
export const validateEndpoints = () => {
  const required = ['API_BASE', 'WS_URL', 'GRAPHQL_API'];
  const missing = required.filter(key => !API_ENDPOINTS[key]);

  if (missing.length > 0) {
    const error = `Missing required API endpoints: ${missing.join(', ')}`;
    console.error('❌ Configuration Error:', error);

    if (!isDevelopment()) {
      throw new Error(error);
    }
  }

  console.log('✅ API endpoints configured:', {
    API_BASE: API_ENDPOINTS.API_BASE,
    WS_URL: API_ENDPOINTS.WS_URL,
    GRAPHQL_API: API_ENDPOINTS.GRAPHQL_API,
  });
};

// Auto-validate in development
if (isDevelopment() && typeof window !== 'undefined') {
  validateEndpoints();
}

// For CommonJS compatibility (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_ENDPOINTS, PORTS, ENV, validateEndpoints };
}

// Default export for convenience
export default API_ENDPOINTS;
