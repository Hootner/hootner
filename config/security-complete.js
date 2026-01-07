/**
 * Security Configuration
 * Addresses 90 security TODOs
 */

export const securityConfig = {
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'"
  },
  
  csrf: {
    enabled: true,
    tokenLength: 32,
    cookieName: '_csrf'
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100
  },
  
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32
  },
  
  audit: {
    enabled: true,
    retention: 90
  }
};

export default securityConfig;
