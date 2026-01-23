/**
 * Logger Utility
 * Structured logging with different levels
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const safeLogsDir = path.resolve(this.logsDir);
    if (!fs.existsSync(safeLogsDir)) {
      fs.mkdirSync(safeLogsDir, { recursive: true });
    }
  }

  formatMessage(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata,
    });
  }

  writeLog(level, message, metadata) {
    const formattedMessage = this.formatMessage(level, message, metadata);
    console.log(formattedMessage);

    // Write to file with safe path
    const safeLevel = level.replace(/[^a-zA-Z0-9_-]/g, '_');
    const logFile = path.join(this.logsDir, `${safeLevel}.log`);
    fs.appendFileSync(logFile, formattedMessage + '\n');
  }

  info(message, metadata) {
    this.writeLog('info', message, metadata);
  }

  warn(message, metadata) {
    this.writeLog('warn', message, metadata);
  }

  error(message, metadata) {
    this.writeLog('error', message, metadata);
  }

  debug(message, metadata) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', message, metadata);
    }
  }
}

module.exports = { logger: new Logger() };
