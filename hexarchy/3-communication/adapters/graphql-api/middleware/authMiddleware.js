/**
 * Authentication Middleware
 * JWT verification with token rotation and blacklist checking
 *
 * Author: HOOTNER Code Guardian
 */

const { AuthenticationError, ForbiddenError } = require('apollo-server-express')
const TokenManager = require('../utils/tokenManager')

/**
 * Extract token from request
 */
function extractToken(req) {
  const authHeader = req.headers.authorization || ''

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Also check cookies
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken
  }

  return null
}

/**
 * Authenticate request and attach user to context
 */
async function authenticateRequest(req) {
  const token = extractToken(req)

  if (!token) {
    return null
  }

  try {
    const decoded = await TokenManager.verifyAccessToken(token)

    // TODO: Fetch full user from database
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'USER',
      tokenId: decoded.tokenId,
    }
  } catch (error) {
    console.error('Authentication error:', error.message)
    return null
  }
}

/**
 * Require authentication (throw if not authenticated)
 */
function requireAuth(context) {
  if (!context.user) {
    throw new AuthenticationError('Authentication required')
  }
  return context.user
}

/**
 * Require specific role
 */
function requireRole(context, allowedRoles) {
  const user = requireAuth(context)

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(', ')}`)
  }

  return user
}

/**
 * Require ownership or admin
 */
function requireOwnership(context, resourceUserId) {
  const user = requireAuth(context)

  if (user.id !== resourceUserId && user.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to access this resource')
  }

  return user
}

/**
 * Express middleware for authentication
 */
function authMiddleware() {
  return async (req, res, next) => {
    req.user = await authenticateRequest(req)
    next()
  }
}

/**
 * GraphQL resolver wrapper for authentication
 */
function authenticated(resolver) {
  return function (parent, args, context, info) {
    requireAuth(context)
    return resolver(parent, args, context, info)
  }
}

/**
 * GraphQL resolver wrapper for role-based access
 */
function authorized(...allowedRoles) {
  return function (resolver) {
    return function (parent, args, context, info) {
      requireRole(context, allowedRoles)
      return resolver(parent, args, context, info)
    }
  }
}

module.exports = {
  extractToken,
  authenticateRequest,
  requireAuth,
  requireRole,
  requireOwnership,
  authMiddleware,
  authenticated,
  authorized,
}
