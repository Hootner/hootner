// Constants imported
import { HTTP_OK, HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_SERVER_ERROR, ONE_SECOND_MS, TWO_SECONDS_MS, DEFAULT_PORT, SECONDARY_PORT, TIMEOUT_MS, LONG_TIMEOUT_MS, VERY_LONG_TIMEOUT_MS, ONE_MINUTE_MS } from '../../constants/timeouts.js';

/**
 * App Config - Browser Compatible
 * Minimal configuration for browser environment
 */

const AppConfig = { // Editor Settings
  editor: { theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    autoSave: true },

  // Platform Integration
  platform: { baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:SECONDARY_PORT/api',
    syncInterval: UI_CONSTANTS.TIMEOUT_EXTENDED,
    autoSync: true },

  // Cloud Settings
  cloud: { provider: 'jsonbin',
    autoBackup: true,
    backupInterval: 300000 },

  // AI Settings
  ai: { model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.7,
    enabled: true },

  // Security
  security: { maxFileSize: 10 * 1024 * 1024,
    allowedExtensions: ['.js', '.ts', '.html', '.css', '.json', '.md'],
    scanInterval: UI_CONSTANTS.TIMEOUT_EXTENDED },

  // Performance
  performance: { memoryThreshold: 100 * 1024 * 1024,
    gcInterval: UI_CONSTANTS.TIMEOUT_MAX,
    lazyLoadDelay: 100 },

  // Features
  features: { collaboration: true,
    analytics: true,
    plugins: true,
    cloudSync: true,
    aiAssistant: true } };

// Global config
window.AppConfig = AppConfig;

if (typeof module !== 'undefined' && module.exports) { module.exports = AppConfig; }