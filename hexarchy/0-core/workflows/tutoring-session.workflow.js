/**
 * Tutoring Session Workflow
 * Cross-domain orchestration example: Intelligence → Communication → Economy → Interface
 */

import { eventBus } from '../orchestration/event-bus.js'
import { DomainEvent, EventTypes } from '../contracts/domain-events.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('core', 'tutoring-workflow')

export class TutoringSessionWorkflow {
  constructor(correlationId) {
    this.correlationId = correlationId || crypto.randomUUID()
    this.state = {
      sessionId: null,
      userId: null,
      status: 'pending',
      steps: [],
    }
  }

  /**
   * Execute complete tutoring session workflow
   */
  async execute(userId, subject, topic) {
    logger.info('Starting tutoring session workflow', {
      correlationId: this.correlationId,
      userId,
      subject,
      topic,
    })

    this.state.userId = userId

    try {
      // Step 1: Intelligence - Start tutoring session
      const sessionId = await this._startTutoringSession(userId, subject, topic)
      this.state.sessionId = sessionId
      this.state.steps.push({ step: 'session_started', timestamp: Date.now() })

      // Step 2: Communication - Notify user
      await this._notifyUser(userId, sessionId)
      this.state.steps.push({ step: 'user_notified', timestamp: Date.now() })

      // Step 3: Interface - Update UI
      await this._updateInterface(userId, sessionId)
      this.state.steps.push({ step: 'interface_updated', timestamp: Date.now() })

      // Step 4: Governance - Log session
      await this._logSession(userId, sessionId)
      this.state.steps.push({ step: 'session_logged', timestamp: Date.now() })

      this.state.status = 'completed'
      logger.info('Tutoring session workflow completed', {
        correlationId: this.correlationId,
        sessionId,
      })

      return { sessionId, status: 'success' }
    } catch (error) {
      this.state.status = 'failed'
      logger.error('Tutoring session workflow failed', {
        correlationId: this.correlationId,
        error: error.message,
      })
      throw error
    }
  }

  async _startTutoringSession(userId, subject, topic) {
    const event = new DomainEvent(
      EventTypes.TUTORING_SESSION_STARTED,
      { userId, subject, topic },
      { correlationId: this.correlationId, source: 'workflow' }
    )

    await eventBus.publish(event)

    // Simulate async response (in real system, wait for Intelligence domain response)
    return `session_${Date.now()}`
  }

  async _notifyUser(userId, sessionId) {
    const event = new DomainEvent(
      EventTypes.NOTIFICATION_TRIGGERED,
      {
        userId,
        type: 'tutoring_session_started',
        message: `Your tutoring session ${sessionId} has started`,
        sessionId,
      },
      { correlationId: this.correlationId, source: 'workflow' }
    )

    await eventBus.publish(event)
  }

  async _updateInterface(userId, sessionId) {
    const event = new DomainEvent(
      EventTypes.USER_ACTION,
      {
        userId,
        action: 'show_tutoring_interface',
        sessionId,
      },
      { correlationId: this.correlationId, source: 'workflow' }
    )

    await eventBus.publish(event)
  }

  async _logSession(userId, sessionId) {
    const event = new DomainEvent(
      EventTypes.AUDIT_LOG_CREATED,
      {
        userId,
        action: 'tutoring_session_started',
        sessionId,
        timestamp: Date.now(),
      },
      { correlationId: this.correlationId, source: 'workflow' }
    )

    await eventBus.publish(event)
  }

  /**
   * Handle session completion (called when session ends)
   */
  async complete(score, conceptsMastered) {
    logger.info('Completing tutoring session', {
      correlationId: this.correlationId,
      sessionId: this.state.sessionId,
    })

    // Economy - Award rewards
    const event = new DomainEvent(
      EventTypes.REWARD_EARNED,
      {
        userId: this.state.userId,
        sessionId: this.state.sessionId,
        rewardType: 'session_completion',
        amount: this._calculateReward(score, conceptsMastered),
        metadata: { score, conceptsMastered },
      },
      { correlationId: this.correlationId, source: 'workflow' }
    )

    await eventBus.publish(event)
  }

  _calculateReward(score, conceptsMastered) {
    return Math.floor(score * 10) + conceptsMastered.length * 5
  }

  getState() {
    return { ...this.state }
  }
}

export default TutoringSessionWorkflow
