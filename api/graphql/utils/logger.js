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
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
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

        // Write to file
        const logFile = path.join(this.logsDir, `${level}.log`);
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
