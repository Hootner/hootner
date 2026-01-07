// Server Logger Setup - Add to each server
import { createLogger } from '../lib/logger.js';

// Collab Server
export const collabLogger = createLogger('collab-server', 'servers');

// Electron Code Editor Server
export const electronLogger = createLogger('electron-code-editor', 'servers');

// HOOTNER MCP Server
export const mcpLogger = createLogger('hootner-mcp', 'servers');

// HTML Pages Server
export const htmlPagesLogger = createLogger('html-pages', 'servers');

// Hub App
export const hubLogger = createLogger('hub-app', 'servers');

// MCP Server
export const mcpServerLogger = createLogger('mcp-server', 'servers');

// Secure Server
export const secureLogger = createLogger('secure-server', 'servers');

// Video Player Server
export const videoPlayerLogger = createLogger('video-player', 'servers');

// Usage example:
// import { collabLogger } from './lib/server-loggers.js';
// collabLogger.info('Collaboration server started', { port: 3000 });
// collabLogger.error('WebSocket connection failed', { error: err.message });
