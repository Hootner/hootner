#!/usr/bin/env node
/**
 * Layer 10: Logger - Structured logging system
 * Dependencies: Layer 3 (Filesystem), Layer 5 (Message Broker)
 */

class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.transports = options.transports || [new ConsoleTransport()];
    this.metadata = options.metadata || {};
    this.levels = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
  }

  // Log message
  log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.level]) return;
    
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.metadata,
      ...meta
    };
    
    for (const transport of this.transports) {
      transport.write(entry);
    }
  }

  // Convenience methods
  error(message, meta) { this.log('error', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  debug(message, meta) { this.log('debug', message, meta); }
  trace(message, meta) { this.log('trace', message, meta); }

  // Create child logger
  child(metadata) {
    return new Logger({
      level: this.level,
      transports: this.transports,
      metadata: { ...this.metadata, ...metadata }
    });
  }

  // Add transport
  addTransport(transport) {
    this.transports.push(transport);
  }

  // Set level
  setLevel(level) {
    this.level = level;
  }
}

// Console transport
class ConsoleTransport {
  constructor(options = {}) {
    this.colorize = options.colorize !== false;
    this.colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[36m',
      debug: '\x1b[35m',
      trace: '\x1b[90m',
      reset: '\x1b[0m'
    };
  }

  write(entry) {
    const color = this.colorize ? this.colors[entry.level] : '';
    const reset = this.colorize ? this.colors.reset : '';
    
    const meta = Object.keys(entry)
      .filter(k => !['level', 'message', 'timestamp'].includes(k))
      .map(k => `${k}=${JSON.stringify(entry[k])}`)
      .join(' ');
    
    console.log(
      `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}${meta ? ' ' + meta : ''}`
    );
  }
}

// File transport
class FileTransport {
  constructor(options = {}) {
    this.filename = options.filename || 'app.log';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = options.maxFiles || 5;
    this.buffer = [];
    this.size = 0;
  }

  write(entry) {
    const line = JSON.stringify(entry) + '\n';
    this.buffer.push(line);
    this.size += line.length;
    
    // Simulate file write
    if (this.buffer.length >= 100 || this.size >= this.maxSize) {
      this.flush();
    }
  }

  flush() {
    console.log(`[FILE] Writing ${this.buffer.length} entries to ${this.filename}`);
    this.buffer = [];
    this.size = 0;
  }

  rotate() {
    console.log(`[FILE] Rotating ${this.filename}`);
    // In production, would rename files and create new one
  }
}

// JSON transport
class JSONTransport {
  constructor() {
    this.entries = [];
  }

  write(entry) {
    this.entries.push(entry);
  }

  getEntries() {
    return this.entries;
  }

  clear() {
    this.entries = [];
  }
}

// HTTP transport
class HTTPTransport {
  constructor(options = {}) {
    this.url = options.url;
    this.batch = options.batch || 10;
    this.buffer = [];
  }

  write(entry) {
    this.buffer.push(entry);
    
    if (this.buffer.length >= this.batch) {
      this.send();
    }
  }

  send() {
    console.log(`[HTTP] Sending ${this.buffer.length} entries to ${this.url}`);
    this.buffer = [];
  }
}

// Demo
if (require.main === module) {
  console.log('=== Logger Demo ===\n');
  
  // Create logger
  const logger = new Logger({
    level: 'debug',
    metadata: { service: 'api', version: '1.0.0' }
  });
  
  // Add transports
  logger.addTransport(new FileTransport({ filename: 'app.log' }));
  
  // Log messages
  logger.info('Application started');
  logger.debug('Debug information', { userId: 123 });
  logger.warn('Warning message', { code: 'WARN_001' });
  logger.error('Error occurred', { error: 'Connection failed' });
  
  console.log();
  
  // Child logger
  const requestLogger = logger.child({ requestId: 'req-123' });
  requestLogger.info('Processing request');
  requestLogger.debug('Request details', { method: 'GET', path: '/api/users' });
  
  console.log();
  
  // JSON transport
  const jsonLogger = new Logger({
    transports: [new JSONTransport()]
  });
  
  jsonLogger.info('Test message 1');
  jsonLogger.info('Test message 2');
  
  const entries = jsonLogger.transports[0].getEntries();
  console.log('JSON entries:', entries.length);
}

module.exports = { Logger, ConsoleTransport, FileTransport, JSONTransport, HTTPTransport };
