// Role-Based Access Control (RBAC) Helpers
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CREATOR: 'creator',
  USER: 'user',
  GUEST: 'guest'
};

export const PERMISSIONS = {
  // User management
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Video management
  VIDEO_CREATE: 'video.create',
  VIDEO_READ: 'video.read',
  VIDEO_UPDATE: 'video.update',
  VIDEO_DELETE: 'video.delete',
  VIDEO_PUBLISH: 'video.publish',

  // Content moderation
  CONTENT_MODERATE: 'content.moderate',
  COMMENT_DELETE: 'comment.delete',
  USER_BAN: 'user.ban',

  // Admin
  SETTINGS_MANAGE: 'settings.manage',
  ANALYTICS_VIEW: 'analytics.view',
  SYSTEM_CONFIGURE: 'system.configure'
};

// Role-permission mapping
const rolePermissions = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.VIDEO_READ,
    PERMISSIONS.VIDEO_UPDATE,
    PERMISSIONS.VIDEO_DELETE,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.COMMENT_DELETE,
    PERMISSIONS.USER_BAN,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.VIDEO_READ,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.COMMENT_DELETE
  ],
  [ROLES.CREATOR]: [
    PERMISSIONS.VIDEO_CREATE,
    PERMISSIONS.VIDEO_READ,
    PERMISSIONS.VIDEO_UPDATE,
    PERMISSIONS.VIDEO_DELETE,
    PERMISSIONS.VIDEO_PUBLISH
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIDEO_READ,
    PERMISSIONS.VIDEO_CREATE
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.VIDEO_READ
  ]
};

// Check if role has permission
export const hasPermission = (role, permission) => {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
};

// Check if user has permission
export const userHasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  return hasPermission(user.role, permission);
};

// Require permission middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!userHasPermission(req.user, permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Require any permission from list
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasAny = permissions.some(p => userHasPermission(req.user, p));
    
    if (!hasAny) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Require all permissions from list
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasAll = permissions.every(p => userHasPermission(req.user, p));
    
    if (!hasAll) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Check resource ownership
export const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user.id !== ownerId && !hasPermission(req.user.role, PERMISSIONS.ADMIN)) {
        return res.status(403).json({ error: 'You do not own this resource' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Ownership check failed' });
    }
  };
};

export default {
  ROLES,
  PERMISSIONS,
  hasPermission,
  userHasPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireOwnership
};
