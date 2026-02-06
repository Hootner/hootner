/**
 * GDPR Compliance Module
 * Handles data subject rights, consent management, and data protection
 */

export class GDPRCompliance {
  constructor(db) {
    this.db = db;
    this.auditLog = [];
  }

  // Right to Access (Article 15)
  async exportUserData(userId) {
    const userData = await this.db.collection('users').findOne({ _id: userId });
    const videos = await this.db.collection('videos').find({ userId }).toArray();
    const activity = await this.db.collection('activity_logs').find({ userId }).toArray();
    
    this.logAudit('DATA_EXPORT', userId);
    
    return {
      personal_data: userData,
      content: videos,
      activity_history: activity,
      exported_at: new Date().toISOString()
    };
  }

  // Right to Erasure (Article 17)
  async deleteUserData(userId, reason = 'user_request') {
    await this.db.collection('users').updateOne(
      { _id: userId },
      { $set: { deleted: true, deletedAt: new Date(), deletionReason: reason } }
    );
    
    await this.db.collection('videos').updateMany(
      { userId },
      { $set: { deleted: true, deletedAt: new Date() } }
    );
    
    this.logAudit('DATA_DELETION', userId, { reason });
    
    return { success: true, deletedAt: new Date() };
  }

  // Right to Rectification (Article 16)
  async updateUserData(userId, updates) {
    const result = await this.db.collection('users').updateOne(
      { _id: userId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    
    this.logAudit('DATA_UPDATE', userId, { fields: Object.keys(updates) });
    
    return result;
  }

  // Consent Management
  async recordConsent(userId, consentType, granted) {
    await this.db.collection('consents').insertOne({
      userId,
      type: consentType,
      granted,
      timestamp: new Date(),
      ipAddress: null, // Set from request
      userAgent: null  // Set from request
    });
    
    this.logAudit('CONSENT_RECORDED', userId, { type: consentType, granted });
  }

  // Data Breach Notification (Article 33)
  async reportDataBreach(breach) {
    const breachRecord = {
      ...breach,
      reportedAt: new Date(),
      status: 'reported',
      affectedUsers: breach.affectedUsers || []
    };
    
    await this.db.collection('data_breaches').insertOne(breachRecord);
    
    // Alert compliance team
    console.error('DATA BREACH REPORTED:', breachRecord);
    
    return breachRecord;
  }

  // Audit logging
  logAudit(action, userId, metadata = {}) {
    const entry = {
      action,
      userId,
      timestamp: new Date(),
      metadata
    };
    
    this.auditLog.push(entry);
    this.db.collection('audit_logs').insertOne(entry);
  }

  // Data retention policy (90 days as per README)
  async enforceRetentionPolicy() {
    const retentionDays = 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const result = await this.db.collection('audit_logs').deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    console.log(`Deleted ${result.deletedCount} audit logs older than ${retentionDays} days`);
    
    return result;
  }
}
