/**
 * AI Feedback Loop System
 * Continuously improves tutoring based on learner performance
 */

import { createLogger } from '../../0-core/utils/logger.js'
import { eventBus } from '../../0-core/orchestration/event-bus.js'
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js'
import crypto from 'crypto'

const logger = createLogger('intelligence', 'feedback-loops')

class FeedbackLoopEngine {
  constructor() {
    this.performanceData = new Map() // userId -> performance metrics
    this.adjustmentHistory = []
    this._setupEventListeners()
  }

  _setupEventListeners() {
    // Listen for session completions
    eventBus.subscribe(EventTypes.TUTORING_SESSION_COMPLETED, async (event) => {
      await this.processFeedback(event.payload)
    })

    // Listen for assessments
    eventBus.subscribe(EventTypes.CONCEPT_MASTERED, async (event) => {
      await this.updateMasteryModel(event.payload)
    })
  }

  /**
   * Process feedback from completed session
   */
  async processFeedback(sessionData) {
    // Input validation
    if (!sessionData || typeof sessionData !== 'object') {
      throw new Error('Invalid session data provided')
    }

    const { userId, sessionId, score, duration, conceptsCovered, struggledWith } =
      sessionData

    // Validate required fields
    if (!userId || !sessionId || typeof score !== 'number') {
      throw new Error('Missing required session data fields')
    }

    // Sanitize user input
    const sanitizedUserId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '')
    const sanitizedSessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '')

    logger.info('Processing feedback', {
      userId: sanitizedUserId,
      sessionId: sanitizedSessionId,
      score,
    })

    // Get or initialize user performance data
    if (!this.performanceData.has(sanitizedUserId)) {
      this.performanceData.set(sanitizedUserId, {
        averageScore: 0,
        totalSessions: 0,
        conceptMastery: new Map(),
        preferredPace: 'medium',
        strugglingConcepts: [],
      })
    }

    const userData = this.performanceData.get(sanitizedUserId)

    // Update running averages
    userData.averageScore =
      (userData.averageScore * userData.totalSessions + score) /
      (userData.totalSessions + 1)
    userData.totalSessions++

    // Track struggling concepts
    if (struggledWith && struggledWith.length > 0) {
      userData.strugglingConcepts.push(...struggledWith)
      // Keep only last 10 struggling concepts
      userData.strugglingConcepts = userData.strugglingConcepts.slice(-10)
    }

    // Adjust difficulty
    const adjustment = await this._calculateAdjustment(userData, sessionData)

    if (adjustment.shouldAdjust) {
      logger.info('Applying learning adjustment', {
        userId: sanitizedUserId,
        adjustment: adjustment.type,
      })

      this.adjustmentHistory.push({
        id: crypto.randomUUID(),
        userId: sanitizedUserId,
        timestamp: Date.now(),
        adjustment,
      })

      // Publish adjustment event
      const adjustmentEvent = new DomainEvent(
        EventTypes.AI_MODEL_UPDATED,
        {
          userId: sanitizedUserId,
          adjustmentType: adjustment.type,
          reason: adjustment.reason,
          newDifficulty: adjustment.newDifficulty,
          newPace: adjustment.newPace,
        },
        { correlationId: sanitizedSessionId, source: 'feedback-loop' }
      )

      await eventBus.publish(adjustmentEvent)
    }

    return adjustment
  }

  /**
   * Calculate needed adjustments based on performance
   */
  async _calculateAdjustment(userData, sessionData) {
    const { score, duration, expectedDuration } = sessionData

    const adjustment = {
      shouldAdjust: false,
      type: null,
      reason: null,
      newDifficulty: null,
      newPace: null,
    }

    // Difficulty adjustment
    if (userData.averageScore > 90 && userData.totalSessions >= 3) {
      adjustment.shouldAdjust = true
      adjustment.type = 'increase_difficulty'
      adjustment.reason = 'Consistently high performance'
      adjustment.newDifficulty = 'advanced'
    } else if (userData.averageScore < 60 && userData.totalSessions >= 3) {
      adjustment.shouldAdjust = true
      adjustment.type = 'decrease_difficulty'
      adjustment.reason = 'Struggling with current level'
      adjustment.newDifficulty = 'beginner'
    }

    // Pace adjustment
    if (duration < expectedDuration * 0.7) {
      adjustment.shouldAdjust = true
      adjustment.type = adjustment.type || 'adjust_pace'
      adjustment.reason = adjustment.reason || 'Completing sessions too quickly'
      adjustment.newPace = 'fast'
    } else if (duration > expectedDuration * 1.5) {
      adjustment.shouldAdjust = true
      adjustment.type = adjustment.type || 'adjust_pace'
      adjustment.reason = adjustment.reason || 'Taking longer than expected'
      adjustment.newPace = 'slow'
    }

    return adjustment
  }

  /**
   * Update concept mastery model
   */
  async updateMasteryModel(conceptData) {
    const { userId, conceptId, masteryLevel } = conceptData

    logger.debug('Updating concept mastery', { userId, conceptId, masteryLevel })

    const userData = this.performanceData.get(userId)
    if (userData) {
      userData.conceptMastery.set(conceptId, {
        level: masteryLevel,
        lastUpdated: Date.now(),
      })
    }
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(userId) {
    // Input validation
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID provided')
    }

    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '')
    const userData = this.performanceData.get(sanitizedUserId)

    if (!userData) {
      return { recommendations: [] }
    }

    const recommendations = []

    // Recommend review for struggling concepts
    if (userData.strugglingConcepts.length > 0) {
      recommendations.push({
        type: 'review',
        concepts: userData.strugglingConcepts.slice(-3),
        reason: 'Recent difficulty with these concepts',
      })
    }

    // Recommend advanced topics if mastering current level
    if (userData.averageScore > 85) {
      recommendations.push({
        type: 'advance',
        reason: 'Ready for more challenging material',
      })
    }

    return {
      userId,
      averageScore: userData.averageScore,
      totalSessions: userData.totalSessions,
      recommendations,
    }
  }

  /**
   * Get feedback loop metrics
   */
  getMetrics() {
    return {
      totalUsers: this.performanceData.size,
      adjustmentsMade: this.adjustmentHistory.length,
      recentAdjustments: this.adjustmentHistory.slice(-10),
    }
  }
}

export const feedbackLoopEngine = new FeedbackLoopEngine()
export default feedbackLoopEngine
