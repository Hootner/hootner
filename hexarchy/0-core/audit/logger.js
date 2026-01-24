// Audit Logging for Compliance
import { docClient } from '../database/dynamodb/config.js';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { logger } from '../logging/logger.js';

const AUDIT_TABLE = process.env.AUDIT_TABLE || 'AuditLogs';

export const AUDIT_EVENTS = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  PASSWORD_CHANGED: 'user.password_changed',
  VIDEO_UPLOADED: 'video.uploaded',
  VIDEO_DELETED: 'video.deleted',
  PAYMENT_PROCESSED: 'payment.processed',
  PERMISSION_CHANGED: 'permission.changed',
  DATA_ACCESSED: 'data.accessed',
  DATA_EXPORTED: 'data.exported',
  SETTINGS_CHANGED: 'settings.changed'
};

export const auditLog = async ({
  event,
  userId,
  resourceType,
  resourceId,
  action,
  metadata = {},
  ipAddress,
  userAgent
}) => {
  const timestamp = Date.now();
  const logEntry = {
    id: `${timestamp}-${userId || 'anonymous'}`,
    timestamp,
    event,
    userId: userId || 'anonymous',
    resourceType,
    resourceId,
    action,
    ipAddress,
    userAgent,
    metadata,
    createdAt: new Date().toISOString()
  };

  try {
    await docClient.send(new PutCommand({
      TableName: AUDIT_TABLE,
      Item: logEntry
    }));

    logger.info('Audit log created', { event, userId, action });
  } catch (error) {
    logger.error('Audit logging failed:', error);
    // Don't throw - audit failures shouldn't break app
  }
};

// Audit middleware
export const auditMiddleware = (event, action) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        await auditLog({
          event,
          userId: req.user?.id,
          resourceType: req.params.resourceType,
          resourceId: req.params.id,
          action,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode
          }
        });
      }
    });
    next();
  };
};

// Query audit logs
export const getAuditLogs = async (userId, limit = 100) => {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: AUDIT_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false // Newest first
    }));

    return result.Items || [];
  } catch (error) {
    logger.error('Failed to retrieve audit logs:', error);
    return [];
  }
};

export default { AUDIT_EVENTS, auditLog, auditMiddleware, getAuditLogs };
