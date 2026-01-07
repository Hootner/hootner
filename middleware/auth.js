import jwt from 'jsonwebtoken';
import logger from '../lib/logger.js';
import { HTTP_STATUS, TIMEOUTS } from '../constants/index.js';
/**
 * tokenBlacklist
 */
const tokenBlacklist = new Set();
/**
 * TOKEN_EXPIRY
 */
const TOKEN_EXPIRY = 2 * TIMEOUTS.ONE_HOUR; // 2 hours
const MAX_BLACKLIST_SIZE = 10000;
/**
 * CLEANUP_INTERVAL
 */
const CLEANUP_INTERVAL = TIMEOUTS.ONE_HOUR; // 1 hour
/**
 * JWT_ALGORITHM
 */
const JWT_ALGORITHM = 'HS256';
/**
 * JWT_MAX_AGE
 */
const JWT_MAX_AGE = '2h';
/**
 * JWT_ISSUER
 */
const JWT_ISSUER = 'hootner-auth';
/**
 * JWT_AUDIENCE
 */
const JWT_AUDIENCE = 'hootner-api';

/**
 * authenticateJWT middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const authenticateJWT = (req, res, next) => { try { const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) { return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' }); }

    const token = authHeader.slice(7);

    if (tokenBlacklist.has(token)) { return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Token revoked' }); }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: [JWT_ALGORITHM],
      maxAge: JWT_MAX_AGE,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE, });

    if (!decoded.userId || !decoded.email) { return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid token claims' }); }

    req.user = decoded;
    next(); } catch (error) { logger.warn('JWT verification failed', { error: error.message, ip: req.ip });
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid or expired token' }); } };

/**
 * authorize
 */
export const authorize = (...roles) => { return (req, res, next) => { try { if (!req.user) { return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' }); }

      if (roles.length && !roles.includes(req.user.role)) { logger.warn('Authorization failed', { userId: req.user.userId,
          requiredRoles: roles,
          userRole: req.user.role, });
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Insufficient permissions' }); }

      next(); } catch (error) { logger.error('Authorization error', { error: error.message });
      return res.status(500).json({ error: 'Internal server error' }); } }; };

/**
 * revokeToken
 */
export const revokeToken = (token) => { tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), TOKEN_EXPIRY); };

setInterval(() => { if (tokenBlacklist.size > MAX_BLACKLIST_SIZE) { tokenBlacklist.clear();
    logger.warn('Token blacklist cleared due to size limit'); } }, CLEANUP_INTERVAL);
