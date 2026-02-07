// Multi-tenancy Utilities
export const extractTenantId = (req) => {
  // Extract tenant from subdomain, header, or user
  const subdomain = req.hostname.split('.')[0];
  const headerTenant = req.headers['x-tenant-id'];
  const userTenant = req.user?.tenantId;

  return headerTenant || userTenant || subdomain;
};

// Tenant isolation middleware
export const tenantMiddleware = (req, res, next) => {
  const tenantId = extractTenantId(req);

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant identification required' });
  }

  req.tenantId = tenantId;
  next();
};

// Tenant-scoped query builder
export const withTenant = (query, tenantId) => {
  return {
    ...query,
    FilterExpression: query.FilterExpression
      ? `${query.FilterExpression} AND tenantId = :tenantId`
      : 'tenantId = :tenantId',
    ExpressionAttributeValues: {
      ...(query.ExpressionAttributeValues || {}),
      ':tenantId': tenantId
    }
  };
};

// Tenant-scoped cache keys
export const tenantCacheKey = (tenantId, key) => {
  return `tenant:${tenantId}:${key}`;
};

// Validate tenant access
export const validateTenantAccess = (req, resourceTenantId) => {
  if (req.tenantId !== resourceTenantId) {
    throw new Error('Tenant access denied');
  }
};

// Get tenant config
export const getTenantConfig = async (tenantId) => {
  // Implement based on your tenant config storage
  return {
    id: tenantId,
    features: [],
    limits: {},
    branding: {}
  };
};

export default {
  extractTenantId,
  tenantMiddleware,
  withTenant,
  tenantCacheKey,
  validateTenantAccess,
  getTenantConfig
};
