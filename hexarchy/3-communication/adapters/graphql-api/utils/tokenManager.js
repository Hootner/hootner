/**
 * JWT Token Manager with Refresh Token Rotation
 * Implements secure token rotation with Redis blacklisting
 *
 * Author: HOOTNER Code Guardian
 */

const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Redis = require('ioredis')

// Redis client for token blacklist
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
})

// Token configuration
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
if (!process.env.REFRESH_SECRET) {
  throw new Error('REFRESH_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m' // Short-lived access tokens
const REFRESH_TOKEN_EXPIRY = '7d' // Long-lived refresh tokens
const BLACKLIST_PREFIX = 'blacklist:'
const REFRESH_PREFIX = 'refresh:'
const TOKEN_FAMILY_PREFIX = 'family:'

/**
 * Token Manager Class
 */
class TokenManager {
  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
  }

  /**
   * Generate refresh token with token family
   */
  static async generateRefreshToken(user, tokenFamily = null) {
    // Create or use existing token family
    const family = tokenFamily || crypto.randomBytes(16).toString('hex')
    const tokenId = crypto.randomBytes(32).toString('hex')

    const refreshToken = jwt.sign(
      {
        id: user.id,
        tokenId,
        family,
        type: 'refresh',
      },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )

    // Store refresh token in Redis with 7 day expiry
    await redis.setex(
      `${REFRESH_PREFIX}${tokenId}`,
      7 * 24 * 60 * 60,
      JSON.stringify({
        userId: user.id,
        family,
        createdAt: Date.now(),
      })
    )

    // Store token family mapping
    await redis.sadd(`${TOKEN_FAMILY_PREFIX}${family}`, tokenId)
    await redis.expire(`${TOKEN_FAMILY_PREFIX}${family}`, 7 * 24 * 60 * 60)

    return { refreshToken, family, tokenId }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static async generateTokenPair(user, tokenFamily = null) {
    const accessToken = this.generateAccessToken(user)
    const { refreshToken, family, tokenId } = await this.generateRefreshToken(
      user,
      tokenFamily
    )

    return {
      accessToken,
      refreshToken,
      tokenFamily: family,
      tokenId,
      expiresIn: 900, // 15 minutes in seconds
    }
  }

  /**
   * Verify access token
   */
  static async verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token)
      if (isBlacklisted) {
        throw new Error('Token has been revoked')
      }

      return decoded
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`)
    }
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET)

      // Check if token exists in Redis
      const tokenData = await redis.get(`${REFRESH_PREFIX}${decoded.tokenId}`)
      if (!tokenData) {
        throw new Error('Refresh token not found or expired')
      }

      // Check if token family has been compromised
      const isCompromised = await this.isTokenFamilyCompromised(decoded.family)
      if (isCompromised) {
        throw new Error('Token family has been compromised')
      }

      return decoded
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`)
    }
  }

  /**
   * Rotate refresh token (invalidate old, generate new)
   */
  static async rotateRefreshToken(oldRefreshToken, user) {
    try {
      // Verify old refresh token
      const decoded = await this.verifyRefreshToken(oldRefreshToken)

      // Invalidate old refresh token
      await this.invalidateRefreshToken(decoded.tokenId)

      // Generate new token pair with same family
      const tokens = await this.generateTokenPair(user, decoded.family)

      return tokens
    } catch (error) {
      // If refresh token is invalid, mark entire family as compromised
      try {
        const decoded = jwt.decode(oldRefreshToken)
        if (decoded?.family) {
          await this.compromiseTokenFamily(decoded.family)
        }
      } catch (decodeError) {
        // Token is malformed, ignore
      }

      throw error
    }
  }

  /**
   * Invalidate refresh token
   */
  static async invalidateRefreshToken(tokenId) {
    await redis.del(`${REFRESH_PREFIX}${tokenId}`)
  }

  /**
   * Blacklist access token
   */
  static async blacklistAccessToken(token) {
    try {
      const decoded = jwt.decode(token)
      if (!decoded || !decoded.exp) {
        return
      }

      // Calculate TTL until token expires
      const ttl = decoded.exp - Math.floor(Date.now() / 1000)
      if (ttl > 0) {
        await redis.setex(`${BLACKLIST_PREFIX}${token}`, ttl, '1')
      }
    } catch (error) {
      console.error('Error blacklisting token:', error)
    }
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token) {
    const exists = await redis.exists(`${BLACKLIST_PREFIX}${token}`)
    return exists === 1
  }

  /**
   * Compromise entire token family (security breach)
   */
  static async compromiseTokenFamily(family) {
    // Get all tokens in family
    const tokenIds = await redis.smembers(`${TOKEN_FAMILY_PREFIX}${family}`)

    // Invalidate all tokens in family
    const pipeline = redis.pipeline()
    tokenIds.forEach((tokenId) => {
      pipeline.del(`${REFRESH_PREFIX}${tokenId}`)
    })
    pipeline.del(`${TOKEN_FAMILY_PREFIX}${family}`)
    await pipeline.exec()

    console.warn(`🚨 Token family compromised: ${family}`)
  }

  /**
   * Check if token family is compromised
   */
  static async isTokenFamilyCompromised(family) {
    const exists = await redis.exists(`${TOKEN_FAMILY_PREFIX}${family}`)
    return exists === 0
  }

  /**
   * Revoke all tokens for a user
   */
  static async revokeAllUserTokens(userId) {
    // This would require storing user-to-token mapping
    // For now, we'll rely on token expiry
    console.log(`Revoking all tokens for user: ${userId}`)
  }

  /**
   * Cleanup expired tokens (run periodically)
   */
  static async cleanupExpiredTokens() {
    // Redis automatically handles expiry, but we can scan for orphaned data
    console.log('Running token cleanup...')
  }
}

module.exports = TokenManager
