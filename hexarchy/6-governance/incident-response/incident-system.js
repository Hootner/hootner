/**
 * Incident Response System
 * Automated incident detection and response
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('governance', 'incident-response');

class IncidentResponseSystem {
  constructor() {
    this.incidents = new Map();
    this.severityLevels = ['low', 'medium', 'high', 'critical'];
    this.responseTeam = [];
    this._setupEventListeners();
  }

  _setupEventListeners() {
    eventBus.subscribe(EventTypes.SECURITY_INCIDENT, async (event) => {
      await this.handleIncident(event.payload);
    });
  }

  /**
   * Handle a security incident
   */
  async handleIncident(incidentData) {
    const incidentId = `INC-${Date.now()}`;
    
    const incident = {
      id: incidentId,
      ...incidentData,
      status: 'detected',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      timeline: [
        { timestamp: Date.now(), event: 'incident_detected', details: incidentData }
      ]
    };

    this.incidents.set(incidentId, incident);

    logger.warn('Security incident detected', {
      incidentId,
      type: incidentData.type,
      severity: incidentData.severity
    });

    // Auto-response based on severity
    await this._executeAutoResponse(incident);

    // Notify response team if critical
    if (incidentData.severity === 'critical') {
      await this._notifyResponseTeam(incident);
    }

    return incidentId;
  }

  async _executeAutoResponse(incident) {
    const actions = [];

    switch (incident.type) {
      case 'fraud_detected':
        actions.push(this._blockUser(incident.userId));
        actions.push(this._freezeTransactions(incident.userId));
        break;

      case 'brute_force_attack':
        actions.push(this._rateLimit(incident.ipAddress));
        actions.push(this._temporaryBan(incident.ipAddress));
        break;

      case 'data_breach':
        actions.push(this._isolateAffectedSystems(incident.systems));
        actions.push(this._backupData());
        break;

      case 'ddos_attack':
        actions.push(this._enableDDosProtection());
        break;
    }

    const results = await Promise.allSettled(actions);
    
    incident.timeline.push({
      timestamp: Date.now(),
      event: 'auto_response_executed',
      details: { actionsAttempted: actions.length, actionsSucceeded: results.filter(r => r.status === 'fulfilled').length }
    });

    incident.updatedAt = Date.now();
    incident.status = 'responding';
  }

  async _blockUser(userId) {
    logger.info('Auto-response: Blocking user', { userId });
    // Would actually block the user
    return { action: 'block_user', userId, status: 'completed' };
  }

  async _freezeTransactions(userId) {
    logger.info('Auto-response: Freezing transactions', { userId });
    return { action: 'freeze_transactions', userId, status: 'completed' };
  }

  async _rateLimit(ipAddress) {
    logger.info('Auto-response: Applying rate limit', { ipAddress });
    return { action: 'rate_limit', ipAddress, status: 'completed' };
  }

  async _temporaryBan(ipAddress) {
    logger.info('Auto-response: Temporary IP ban', { ipAddress });
    return { action: 'temporary_ban', ipAddress, duration: '1h', status: 'completed' };
  }

  async _isolateAffectedSystems(systems) {
    logger.error('Auto-response: Isolating systems', { systems });
    return { action: 'isolate_systems', systems, status: 'completed' };
  }

  async _backupData() {
    logger.info('Auto-response: Initiating data backup');
    return { action: 'backup_data', status: 'completed' };
  }

  async _enableDDosProtection() {
    logger.info('Auto-response: Enabling DDoS protection');
    return { action: 'enable_ddos_protection', status: 'completed' };
  }

  async _notifyResponseTeam(incident) {
    logger.error('Notifying incident response team', { incidentId: incident.id });
    
    // Would send notifications to response team
    const notification = new DomainEvent(
      EventTypes.NOTIFICATION_TRIGGERED,
      {
        type: 'critical_incident',
        title: `Critical Incident: ${incident.type}`,
        message: `Incident ${incident.id} requires immediate attention`,
        priority: 'urgent',
        incidentId: incident.id
      },
      { source: 'incident-response' }
    );

    await eventBus.publish(notification);
  }

  /**
   * Update incident status
   */
  updateIncident(incidentId, update) {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.timeline.push({
      timestamp: Date.now(),
      event: 'incident_updated',
      details: update
    });

    Object.assign(incident, update);
    incident.updatedAt = Date.now();

    logger.info('Incident updated', { incidentId, status: incident.status });

    return incident;
  }

  /**
   * Resolve incident
   */
  resolveIncident(incidentId, resolution) {
    const incident = this.updateIncident(incidentId, {
      status: 'resolved',
      resolution,
      resolvedAt: Date.now()
    });

    logger.info('Incident resolved', { incidentId });

    return incident;
  }

  /**
   * Get active incidents
   */
  getActiveIncidents() {
    return Array.from(this.incidents.values())
      .filter(i => i.status !== 'resolved')
      .sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }

  /**
   * Get incident statistics
   */
  getStats(timeRange = 86400000) { // Default: last 24h
    const since = Date.now() - timeRange;
    const recentIncidents = Array.from(this.incidents.values())
      .filter(i => i.createdAt >= since);

    return {
      total: recentIncidents.length,
      active: recentIncidents.filter(i => i.status !== 'resolved').length,
      resolved: recentIncidents.filter(i => i.status === 'resolved').length,
      bySeverity: {
        critical: recentIncidents.filter(i => i.severity === 'critical').length,
        high: recentIncidents.filter(i => i.severity === 'high').length,
        medium: recentIncidents.filter(i => i.severity === 'medium').length,
        low: recentIncidents.filter(i => i.severity === 'low').length
      },
      averageResolutionTime: this._calculateAverageResolutionTime(recentIncidents)
    };
  }

  _calculateAverageResolutionTime(incidents) {
    const resolved = incidents.filter(i => i.resolvedAt);
    if (resolved.length === 0) return 0;

    const totalTime = resolved.reduce((sum, i) => sum + (i.resolvedAt - i.createdAt), 0);
    return Math.round(totalTime / resolved.length / 1000 / 60); // In minutes
  }
}

export const incidentResponseSystem = new IncidentResponseSystem();
export default incidentResponseSystem;
