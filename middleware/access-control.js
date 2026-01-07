/**
 * A01:2021 Broken Access Control - Role-based access control
 */
const { HTTP_STATUS } = require('../constants');
/**
 * ROLES
 */
const ROLES = { ADMIN: 'admin', MODERATOR: 'moderator', USER: 'user', GUEST: 'guest' };

/**
 * PERMISSIONS
 */
const PERMISSIONS = { READ: 'read', WRITE: 'write', DELETE: 'delete', ADMIN: 'admin' };

/**
 * ROLE_PERMISSIONS
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [PERMISSIONS.READ, PERMISSIONS.WRITE, PERMISSIONS.DELETE, PERMISSIONS.ADMIN],
  [ROLES.MODERATOR]: [PERMISSIONS.READ, PERMISSIONS.WRITE, PERMISSIONS.DELETE],
  [ROLES.USER]: [PERMISSIONS.READ, PERMISSIONS.WRITE],
  [ROLES.GUEST]: [PERMISSIONS.READ],
};

/**
 * requireAuth middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * requireRole
 */
export const _requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * requirePermission
 */
export const _requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' });
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      console.warn(`Permission denied: required ${requiredPermissions.join(', ')}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * requireOwnership
 */
export const _requireOwnership = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' });
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // Admins can access any resource
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // Check ownership
      if (String(resourceId) !== String(userId)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * rateLimitByRole middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export const _rateLimitByRole = (req, res, next) => {
  try {
    const limits = {
      [ROLES.ADMIN]: 1000,
      [ROLES.MODERATOR]: 500,
      [ROLES.USER]: 100,
      [ROLES.GUEST]: 10,
    };

    const role = req.user?.role || ROLES.GUEST;
    req.rateLimit = { max: limits[role] };

    next();
  } catch (error) {
    console.error('Rate limit error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export { PERMISSIONS, ROLES };
