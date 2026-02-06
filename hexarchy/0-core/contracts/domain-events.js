/**
 * Domain Events Schema
 * Standard event format for inter-domain communication
 */

export const EventTypes = {
  // Intelligence Domain Events
  LEARNING_PATH_CREATED: 'intelligence.learningPath.created',
  CONCEPT_MASTERED: 'intelligence.concept.mastered',
  TUTORING_SESSION_STARTED: 'intelligence.session.started',
  TUTORING_SESSION_COMPLETED: 'intelligence.session.completed',
  AI_MODEL_UPDATED: 'intelligence.model.updated',

  // Communication Domain Events
  MESSAGE_SENT: 'communication.message.sent',
  NOTIFICATION_TRIGGERED: 'communication.notification.triggered',
  COLLABORATION_SESSION_STARTED: 'communication.collaboration.started',
  API_CALL_COMPLETED: 'communication.api.completed',

  // Interface Domain Events
  USER_ACTION: 'interface.user.action',
  PAGE_VIEWED: 'interface.page.viewed',
  INTERACTIVE_ELEMENT_CLICKED: 'interface.element.clicked',

  // Economy Domain Events
  REWARD_EARNED: 'economy.reward.earned',
  TRANSACTION_COMPLETED: 'economy.transaction.completed',
  MARKETPLACE_LISTING_CREATED: 'economy.listing.created',
  STAKING_INITIATED: 'economy.staking.initiated',

  // Governance Domain Events
  USER_AUTHENTICATED: 'governance.user.authenticated',
  PERMISSION_CHANGED: 'governance.permission.changed',
  SECURITY_INCIDENT: 'governance.security.incident',
  AUDIT_LOG_CREATED: 'governance.audit.created',

  // Data Domain Events
  DATA_SYNCED: 'data.sync.completed',
  BACKUP_COMPLETED: 'data.backup.completed',
  MIGRATION_EXECUTED: 'data.migration.executed',

  // Foundation Domain Events
  SERVICE_STARTED: 'foundation.service.started',
  RESOURCE_THRESHOLD_EXCEEDED: 'foundation.resource.threshold',
}

/**
 * Base event structure
 */
export class DomainEvent {
  constructor(type, payload, metadata = {}) {
    this.id = crypto.randomUUID()
    this.type = type
    this.timestamp = new Date().toISOString()
    this.correlationId = metadata.correlationId || crypto.randomUUID()
    this.causationId = metadata.causationId || null
    this.source = metadata.source || 'unknown'
    this.version = metadata.version || '1.0'
    this.payload = payload
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      causationId: this.causationId,
      source: this.source,
      version: this.version,
      payload: this.payload,
    }
  }
}

export default { EventTypes, DomainEvent }
