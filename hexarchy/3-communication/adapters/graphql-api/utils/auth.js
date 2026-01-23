/**
 * Authentication Utility
 * JWT validation and user context management
 *
 * Author: HOOTNER Code Guardian
 */

const jwt = require('jsonwebtoken')
const { AuthenticationError, ForbiddenError } = require('apollo-server-express')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRATION = '24h'

/**
 * Generate JWT token for user
 * @param {object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  )
}

/**
 * Generate refresh token
 * @param {object} user - User object
 * @returns {string} Refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 * @throws {AuthenticationError} If token is invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token')
  }
}

/**
 * Extract token from request headers
 * @param {object} req - Express request object
 * @returns {string|null} JWT token or null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization || ''

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Get user from request context
 * @param {object} req - Express request object
 * @returns {object|null} User object or null
 */
async function getUserFromRequest(req) {
  try {
    const token = extractToken(req)

    if (!token) {
      return null
    }

    const decoded = verifyToken(token)

    // TODO: Fetch full user from database
    // For now, return decoded token data
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'USER',
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Validate authentication in resolvers
 * @param {object} context - GraphQL context
 * @throws {AuthenticationError} If user is not authenticated
 */
function validateAuth(context) {
  if (!context.user) {
    throw new AuthenticationError('Authentication required')
  }
}

/**
 * Validate user role
 * @param {object} context - GraphQL context
 * @param {string[]} allowedRoles - Array of allowed roles
 * @throws {ForbiddenError} If user doesn't have required role
 */
function validateRole(context, allowedRoles) {
  validateAuth(context)

  if (!allowedRoles.includes(context.user.role)) {
    throw new ForbiddenError('Insufficient permissions')
  }
}

/**
 * Validate resource ownership
 * @param {object} context - GraphQL context
 * @param {string} resourceUserId - User ID of resource owner
 * @throws {ForbiddenError} If user doesn't own the resource
 */
function validateOwnership(context, resourceUserId) {
  validateAuth(context)

  if (context.user.id !== resourceUserId && context.user.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to access this resource')
  }
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  extractToken,
  getUserFromRequest,
  validateAuth,
  validateRole,
  validateOwnership,
  JWT_SECRET,
  JWT_EXPIRATION,
}
