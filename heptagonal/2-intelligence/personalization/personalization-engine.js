/**
 * Personalization Engine
 * Creates individualized learning experiences
 */

import { createLogger } from '../../0-core/utils/logger.js'
import { cacheLayer } from '../../7-data/caching/cache-layer.js'

const logger = createLogger('intelligence', 'personalization')

class PersonalizationEngine {
  constructor() {
    this.userProfiles = new Map()
    this.learningStyles = ['visual', 'auditory', 'kinesthetic', 'reading']
  }

  /**
   * Initialize or get user profile
   */
  async getUserProfile(userId) {
    // Try cache first
    const cached = await cacheLayer.get(`profile:${userId}`)
    if (cached) return cached

    // Check memory
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)
    }

    // Create new profile
    const profile = this._createDefaultProfile(userId)
    this.userProfiles.set(userId, profile)
    await cacheLayer.set(`profile:${userId}`, profile, 600000) // 10 min cache

    return profile
  }

  _createDefaultProfile(userId) {
    return {
      userId,
      learningStyle: null, // To be detected
      preferences: {
        sessionDuration: 30, // minutes
        difficulty: 'intermediate',
        pace: 'medium',
        contentTypes: ['text', 'video', 'interactive'],
      },
      strengths: [],
      weaknesses: [],
      interests: [],
      goals: [],
      schedule: {
        preferredTimes: [],
        availability: {},
      },
      adaptations: {
        fontSize: 'medium',
        contrast: 'normal',
        captions: false,
        audioDescription: false,
      },
      history: {
        totalSessions: 0,
        totalHours: 0,
        lastActive: Date.now(),
        streak: 0,
      },
    }
  }

  /**
   * Detect learning style based on behavior
   */
  async detectLearningStyle(userId, behaviorData) {
    const { videoWatchTime, textReadTime, interactiveTime, audioListenTime } =
      behaviorData

    const total = videoWatchTime + textReadTime + interactiveTime + audioListenTime

    const scores = {
      visual: (videoWatchTime + interactiveTime) / total,
      reading: textReadTime / total,
      auditory: audioListenTime / total,
      kinesthetic: interactiveTime / total,
    }

    const detectedStyle = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]

    logger.info('Detected learning style', {
      userId,
      style: detectedStyle,
      scores,
    })

    const profile = await this.getUserProfile(userId)
    profile.learningStyle = detectedStyle

    await cacheLayer.set(`profile:${userId}`, profile)

    return detectedStyle
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(userId, goal) {
    logger.info('Generating personalized learning path', { userId, goal })

    const profile = await this.getUserProfile(userId)

    const path = {
      pathId: `path_${userId}_${Date.now()}`,
      userId,
      goal,
      steps: [],
      estimatedDuration: 0,
      personalizationFactors: {
        learningStyle: profile.learningStyle,
        currentLevel: profile.preferences.difficulty,
        pace: profile.preferences.pace,
      },
    }

    // Generate steps based on profile
    const steps = await this._generateSteps(profile, goal)
    path.steps = steps
    path.estimatedDuration = steps.reduce((sum, step) => sum + step.estimatedMinutes, 0)

    return path
  }

  async _generateSteps(profile, goal) {
    // Placeholder - would use AI to generate actual steps
    const baseSteps = [
      { title: 'Introduction', estimatedMinutes: 15 },
      { title: 'Core Concepts', estimatedMinutes: 30 },
      { title: 'Practice', estimatedMinutes: 45 },
      { title: 'Assessment', estimatedMinutes: 20 },
    ]

    // Adapt steps based on learning style
    return baseSteps.map((step) => ({
      ...step,
      contentType: this._getPreferredContentType(profile.learningStyle),
      difficulty: profile.preferences.difficulty,
      adaptations: profile.adaptations,
    }))
  }

  _getPreferredContentType(learningStyle) {
    const mapping = {
      visual: 'video',
      auditory: 'audio',
      kinesthetic: 'interactive',
      reading: 'text',
    }
    return mapping[learningStyle] || 'mixed'
  }

  /**
   * Update profile based on session completion
   */
  async updateProfile(userId, sessionData) {
    const profile = await this.getUserProfile(userId)

    profile.history.totalSessions++
    profile.history.totalHours += sessionData.durationMinutes / 60
    profile.history.lastActive = Date.now()

    // Update streak
    const daysSinceLastActive =
      (Date.now() - profile.history.lastActive) / (1000 * 60 * 60 * 24)
    if (daysSinceLastActive <= 1) {
      profile.history.streak++
    } else if (daysSinceLastActive > 1) {
      profile.history.streak = 1
    }

    // Update strengths/weaknesses
    if (sessionData.conceptsMastered) {
      profile.strengths.push(...sessionData.conceptsMastered)
      profile.strengths = [...new Set(profile.strengths)].slice(-20)
    }

    if (sessionData.struggledWith) {
      profile.weaknesses.push(...sessionData.struggledWith)
      profile.weaknesses = [...new Set(profile.weaknesses)].slice(-10)
    }

    await cacheLayer.set(`profile:${userId}`, profile)
    this.userProfiles.set(userId, profile)

    logger.info('Profile updated', {
      userId,
      totalSessions: profile.history.totalSessions,
      streak: profile.history.streak,
    })

    return profile
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId) {
    const profile = await this.getUserProfile(userId)

    const recommendations = {
      nextTopics: [],
      contentSuggestions: [],
      scheduleOptimization: {},
    }

    // Recommend topics based on strengths
    if (profile.strengths.length > 0) {
      recommendations.nextTopics.push({
        type: 'build-on-strength',
        topics: profile.strengths.slice(0, 3),
      })
    }

    // Recommend review for weaknesses
    if (profile.weaknesses.length > 0) {
      recommendations.nextTopics.push({
        type: 'improve-weakness',
        topics: profile.weaknesses,
      })
    }

    // Content suggestions based on learning style
    recommendations.contentSuggestions = [
      this._getPreferredContentType(profile.learningStyle),
    ]

    return recommendations
  }
}

export const personalizationEngine = new PersonalizationEngine()
export default personalizationEngine
