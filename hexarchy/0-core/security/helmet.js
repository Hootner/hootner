// Helmet Security Headers
import helmet from 'helmet';
import crypto from 'crypto';

/**
 * Generate nonce for CSP
 * @returns {string} Generated nonce
 */
export function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Get helmet configuration with nonce support
 * @param {string} nonce - CSP nonce for inline scripts
 * @returns {object} Helmet configuration
 */
export function getHelmetConfig(nonce) {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Remove unsafe-inline, use nonces instead
        styleSrc: ["'self'", `'nonce-${nonce}'`, 'https://cdn.tailwindcss.com'],
        scriptSrc: ["'self'", `'nonce-${nonce}'`, 'https://cdn.tailwindcss.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.hootner.com', 'wss:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", 'https:'],
        frameSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: [],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  });
}

// Default export for backward compatibility (without nonces)
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://cdn.tailwindcss.com'],
      scriptSrc: ["'self'", 'https://cdn.tailwindcss.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.hootner.com', 'wss:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:'],
      frameSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

export default helmetConfig;
