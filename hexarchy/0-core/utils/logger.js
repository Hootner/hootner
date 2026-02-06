/**
 * Centralized Logger for Hexarchy System
 * Supports structured logging with correlation IDs
 */

import { globalConfig } from '../configs/global.config.js'

class Logger {
  constructor(domain, component) {
    this.domain = domain
    this.component = component
    this.level = globalConfig.observability.logging.level
  }

  _log(level, message, context = {}) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      domain: this.domain,
      component: this.component,
      message,
      correlationId: context.correlationId || null,
      ...context,
    }

    if (this._shouldLog(level)) {
      if (globalConfig.observability.logging.format === 'json') {
        console.log(JSON.stringify(logEntry))
      } else {
        console.log(
          `[${timestamp}] [${level}] [${this.domain}/${this.component}] ${message}`,
          context
        )
      }
    }
  }

  _shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevel = levels.indexOf(this.level)
    const targetLevel = levels.indexOf(level)
    return targetLevel >= currentLevel
  }

  debug(message, context) {
    this._log('debug', message, context)
  }

  info(message, context) {
    this._log('info', message, context)
  }

  warn(message, context) {
    this._log('warn', message, context)
  }

  error(message, context) {
    this._log('error', message, context)
  }
}

export function createLogger(domain, component) {
  return new Logger(domain, component)
}

export default Logger
