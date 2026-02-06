const logger = require('../lib/logger');

class AuditService {
  constructor() {
    this.retentionDays = 90;
  }

  logUserAction(userId, action, details = {}) {
    logger.audit('User action logged', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  logSystemEvent(event, severity = 'info', details = {}) {
    if (severity === 'error' || severity === 'critical') {
      logger.error('System event error', {
        event,
        severity,
        details
      });
    } else {
      logger.audit('System event logged', {
        event,
        severity,
        details
      });
    }
  }

  logDataAccess(userId, resource, operation) {
    logger.audit('Data access logged', {
      userId,
      resource,
      operation,
      timestamp: new Date().toISOString()
    });
  }

  generateComplianceReport() {
    logger.audit('Compliance report generated', {
      reportType: 'compliance',
      retentionDays: this.retentionDays,
      timestamp: new Date().toISOString()
    });
    
    return {
      status: 'generated',
      retention: `${this.retentionDays} days`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AuditService();