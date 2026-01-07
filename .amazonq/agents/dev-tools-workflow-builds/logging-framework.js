// Minimal Logging Framework
class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
  }

  log(level, msg) {
    if (this.levels[level] >= this.levels[this.level]) {
      console.log(`[${level.toUpperCase()}] ${new Date().toISOString()} ${msg}`);
    }
  }

  debug(msg) { this.log('debug', msg); }
  info(msg) { this.log('info', msg); }
  warn(msg) { this.log('warn', msg); }
  error(msg) { this.log('error', msg); }
}

const logger = new Logger('info');
logger.debug('Debug msg');
logger.info('Info msg');
logger.warn('Warning msg');

export default Logger;
