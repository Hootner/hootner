/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures between domains
 */

import { globalConfig } from '../configs/global.config.js'
import { createLogger } from './logger.js'

const logger = createLogger('core', 'circuit-breaker')

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name
    this.failureThreshold = options.threshold || globalConfig.circuitBreaker.threshold
    this.timeout = options.timeout || globalConfig.circuitBreaker.timeout
    this.resetTimeout = options.resetTimeout || globalConfig.circuitBreaker.resetTimeout

    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0
    this.lastFailureTime = null
    this.successCount = 0
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        logger.info(`Circuit ${this.name} transitioning to HALF_OPEN`)
        this.state = 'HALF_OPEN'
        this.successCount = 0
      } else {
        throw new Error(`Circuit ${this.name} is OPEN. Failing fast.`)
      }
    }

    try {
      const result = await this._executeWithTimeout(operation)
      this._onSuccess()
      return result
    } catch (error) {
      this._onFailure()
      throw error
    }
  }

  async _executeWithTimeout(operation) {
    return Promise.race([
      operation(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), this.timeout)
      ),
    ])
  }

  _onSuccess() {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      if (this.successCount >= 2) {
        logger.info(`Circuit ${this.name} transitioning to CLOSED`)
        this.state = 'CLOSED'
        this.successCount = 0
      }
    }
  }

  _onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.failureThreshold) {
      logger.warn(`Circuit ${this.name} transitioning to OPEN`, {
        failureCount: this.failureCount,
        threshold: this.failureThreshold,
      })
      this.state = 'OPEN'
    }
  }

  getState() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

export default CircuitBreaker
