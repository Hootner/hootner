// Authentication Middleware
import { verifyToken } from './jwt.js';
import usbPasskeyAuth from './usb-passkey.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const passkeyAuth = req.headers['x-passkey-auth'];

    if (!token && !passkeyAuth) {
      return res.status(401).json({ error: 'No authentication provided' });
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
      req.authMethod = 'jwt';
    }

    if (passkeyAuth) {
      // USB passkey authentication takes precedence for enhanced security
      const passkeyData = JSON.parse(passkeyAuth);
      const verification = await usbPasskeyAuth.verifyAuthentication(
        passkeyData.credential,
        passkeyData.challenge,
        passkeyData.userId
      );

      if (!verification.success) {
        return res.status(401).json({ error: 'USB passkey verification failed' });
      }

      req.user = {
        id: verification.userId,
        authMethod: 'usb-passkey',
        verified: verification.userVerified,
        credentialId: verification.credentialId
      };
      req.authMethod = 'usb-passkey';
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    next();
  } catch (error) {
    next(); // Continue without authentication
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Require USB passkey authentication for high-security operations
 * Used for admin functions, payment processing, and sensitive data access
 */
export const requireUSBPasskey = (req, res, next) => {
  if (!req.user || req.authMethod !== 'usb-passkey') {
    return res.status(403).json({
      error: 'USB passkey authentication required for this operation',
      requiredAuthMethod: 'usb-passkey',
      currentAuthMethod: req.authMethod || 'none'
    });
  }

  if (!req.user.verified) {
    return res.status(403).json({
      error: 'User verification required on USB passkey'
    });
  }

  next();
};

/**
 * Multi-factor authentication middleware
 * Requires both JWT and USB passkey for maximum security
 */
export const requireMFA = (req, res, next) => {
  const hasJWT = req.headers.authorization?.includes('Bearer ');
  const hasPasskey = req.headers['x-passkey-auth'];

  if (!hasJWT || !hasPasskey) {
    return res.status(403).json({
      error: 'Multi-factor authentication required',
      required: ['jwt-token', 'usb-passkey'],
      provided: {
        jwt: !!hasJWT,
        passkey: !!hasPasskey
      }
    });
  }

  next();
};

export default { authenticate, optionalAuth, requireRole, requireUSBPasskey, requireMFA };
