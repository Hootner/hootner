# 🛡️ Platform-Wide Security Integration Guide

## Overview

The HOOTNER Enterprise Security System is now available as a reusable, platform-wide module that can be integrated into any page or application within the ecosystem.

## Quick Start

### 1. Add Security Headers to HTML

Add these meta tags to the `<head>` section of any HTML page:

```html
<!-- Security Headers - Enterprise Grade -->
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="DENY" />
<meta http-equiv="X-XSS-Protection" content="1; mode=block" />
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
<meta http-equiv="Permissions-Policy" content="geolocation=(), camera=(), microphone=(), payment=()" />
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp" />
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin" />
<meta http-equiv="Cross-Origin-Resource-Policy" content="same-origin" />
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-DYNAMIC_NONCE' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https: blob:; connect-src 'self' wss: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content" />
```

### 2. Import Security Module

```html
<!-- Import security module as ES6 module -->
<script type="module">
  import Security from './assets/security/enterprise-security.js';
  
  // Initialize with default config
  const result = await Security.initializeSecurity();
  
  if (result.success) {
    console.log('Security initialized:', result.nonce);
  }
</script>
```

### 3. Use Security Features

```javascript
import Security from './assets/security/enterprise-security.js';

// Initialize security
await Security.initializeSecurity({
  production: true,
  onSessionExpire: () => {
    window.location.href = '/login';
  }
});

// Make secure API calls
try {
  const response = await Security.secureRequest('/api/user/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John' })
  });
  const data = await response.json();
} catch (error) {
  console.error('Request failed:', error);
}

// Validate user input
if (Security.validate.email(userEmail)) {
  // Email is valid
}

if (Security.injectionPrevention.validateSQL(userInput)) {
  // Safe to use in SQL context
}

// Encrypt sensitive data
const encrypted = await Security.aes256Encryption.encryptObject({
  creditCard: '1234-5678-9012-3456'
});
localStorage.setItem('payment', JSON.stringify(encrypted));

// Decrypt when needed
const decrypted = await Security.aes256Encryption.decryptObject(
  JSON.parse(localStorage.getItem('payment'))
);

// Log security events
await Security.enhancedSecurityLogger.log(
  'user_action',
  { action: 'login', userId: 123 },
  'info',
  'authentication'
);
```

## Integration Examples

### React/Next.js Application

```jsx
// src/lib/security.js
import Security from '@/assets/security/enterprise-security.js';

export const initSecurity = async () => {
  return await Security.initializeSecurity({
    production: process.env.NODE_ENV === 'production',
    onSessionExpire: () => {
      // Handle session expiration
      router.push('/login');
    }
  });
};

export default Security;

// src/app/layout.jsx
import { useEffect } from 'react';
import { initSecurity } from '@/lib/security';

export default function RootLayout({ children }) {
  useEffect(() => {
    initSecurity();
  }, []);
  
  return (
    <html>
      <head>
        {/* Security headers */}
      </head>
      <body>{children}</body>
    </html>
  );
}

// src/components/UserForm.jsx
import Security from '@/lib/security';

export default function UserForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const email = e.target.email.value;
    
    // Validate input
    if (!Security.validate.email(email)) {
      alert('Invalid email');
      return;
    }
    
    // Make secure request
    try {
      const response = await Security.secureRequest('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (error) {
      console.error('Failed:', error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Express.js Backend Middleware

```javascript
// middleware/security.js
const security = require('../assets/security/enterprise-security.js');

module.exports = {
  // Verify HMAC signatures
  verifyHMAC: async (req, res, next) => {
    const signature = req.headers['x-hmac-signature'];
    const data = {
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      timestamp: req.headers['x-request-timestamp']
    };
    
    const isValid = await security.hmacSigner.verify(data, signature);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  },
  
  // Validate replay attacks
  validateReplay: (req, res, next) => {
    const nonce = req.headers['x-request-nonce'];
    const timestamp = parseInt(req.headers['x-request-timestamp']);
    
    if (!security.replayPrevention.validateRequest(nonce, timestamp)) {
      return res.status(401).json({ error: 'Replay attack detected' });
    }
    
    next();
  },
  
  // Rate limiting
  rateLimit: async (req, res, next) => {
    const result = await security.ipRateLimiter.isAllowed(req.path);
    
    if (!result.allowed) {
      return res.status(429).json({
        error: result.reason,
        unblockAt: result.unblockAt
      });
    }
    
    res.set('X-RateLimit-Remaining', result.remaining);
    next();
  }
};

// app.js
const express = require('express');
const { verifyHMAC, validateReplay, rateLimit } = require('./middleware/security');

const app = express();

// Apply security middleware
app.use(rateLimit);
app.use(verifyHMAC);
app.use(validateReplay);
```

### GraphQL API

```javascript
// api/graphql/server.js
import Security from '../../hexarchy/4-interface/ui/assets/security/enterprise-security.js';

// Initialize security
await Security.initializeSecurity({ production: true });

// Context function with security
const context = async ({ req }) => {
  // Verify session
  const sessionToken = req.headers['x-session-token'];
  if (!Security.sessionManager.validateSession()) {
    throw new Error('Invalid session');
  }
  
  // Get client fingerprint
  const fingerprint = req.headers['x-browser-fingerprint'];
  
  return {
    sessionToken,
    fingerprint,
    security: Security
  };
};

// Resolvers with security
const resolvers = {
  Mutation: {
    createUser: async (parent, { input }, context) => {
      // Validate input
      if (!context.security.validate.email(input.email)) {
        throw new Error('Invalid email');
      }
      
      // Check for SQL injection
      if (!context.security.injectionPrevention.validateSQL(input.name)) {
        throw new Error('Invalid input');
      }
      
      // Log security event
      await context.security.enhancedSecurityLogger.log(
        'user_created',
        { email: input.email },
        'info',
        'user_management'
      );
      
      // Create user...
    }
  }
};
```

## Configuration

### Custom Security Config

```javascript
import Security from './assets/security/enterprise-security.js';
import securityConfig from './assets/security/security-config.js';

// Customize config
const customConfig = {
  ...securityConfig,
  session: {
    ...securityConfig.session,
    timeout: 60 * 60 * 1000 // 1 hour
  },
  callbacks: {
    onSessionExpire: () => {
      // Custom handler
    },
    onSecurityViolation: (violation) => {
      // Send to monitoring service
      sendToDatadog(violation);
    }
  }
};

await Security.initializeSecurity(customConfig);
```

## API Reference

### Core Functions

- `initializeSecurity(config)` - Initialize all security systems
- `secureRequest(url, options)` - Make HMAC-signed, CSRF-protected API request
- `sanitize(input)` - Sanitize user input for XSS prevention
- `validate.email(email)` - Validate email format
- `validate.username(username)` - Validate username
- `validate.url(url)` - Validate URL (HTTPS only)

### P0 Critical Features

- `cspNonceSystem` - CSP nonce generation and management
- `browserFingerprint` - Browser fingerprinting for session validation
- `injectionPrevention` - SQL, command, LDAP, XPath injection prevention
- `hmacSigner` - HMAC request signing
- `replayPrevention` - Replay attack prevention
- `aes256Encryption` - AES-256-GCM encryption
- `ipRateLimiter` - IP-based rate limiting
- `domSecurityObserver` - DOM tampering detection
- `sriValidator` - Subresource integrity validation
- `enhancedSecurityLogger` - Structured security logging

## Testing

```javascript
// Test security features
import Security from './assets/security/enterprise-security.js';

// Test XSS prevention
console.assert(
  Security.sanitize('<script>alert("xss")</script>') === '',
  'XSS sanitization failed'
);

// Test SQL injection prevention
console.assert(
  !Security.injectionPrevention.validateSQL("admin' OR '1'='1"),
  'SQL injection validation failed'
);

// Test rate limiting
for (let i = 0; i < 150; i++) {
  const result = await Security.ipRateLimiter.isAllowed('test');
  if (i >= 100) {
    console.assert(!result.allowed, 'Rate limit not enforced');
  }
}

// Test encryption
const original = { secret: 'password123' };
const encrypted = await Security.aes256Encryption.encryptObject(original);
const decrypted = await Security.aes256Encryption.decryptObject(encrypted);
console.assert(
  decrypted.secret === original.secret,
  'Encryption/decryption failed'
);
```

## Server-Side Setup

### 1. Create Security Event Endpoint

```javascript
// api/routes/security.js
app.post('/api/security/events', async (req, res) => {
  const event = req.body;
  const signature = req.headers['x-hmac-signature'];
  
  // Verify HMAC
  const isValid = await hmacSigner.verify(event, signature);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Store in database
  await db.collection('security_events').insertOne(event);
  
  // Alert on critical events
  if (event.severity === 'critical') {
    await alertSecurityTeam(event);
  }
  
  res.status(200).json({ success: true });
});
```

### 2. Add CSP Report Endpoint

```javascript
app.post('/api/security/csp-report', (req, res) => {
  const report = req.body['csp-report'];
  
  console.error('CSP Violation:', {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri']
  });
  
  // Log to monitoring service
  
  res.status(204).send();
});
```

## Deployment Checklist

- [ ] Copy `enterprise-security.js` to all frontend projects
- [ ] Copy `security-config.js` and customize per environment
- [ ] Add security meta tags to all HTML templates
- [ ] Initialize security in app entry point
- [ ] Update API routes to verify HMAC signatures
- [ ] Add replay prevention validation
- [ ] Set up security event logging endpoint
- [ ] Configure CSP report endpoint
- [ ] Test all security features
- [ ] Enable production mode
- [ ] Monitor security logs

## File Locations

- **Security Module:** `hexarchy/4-interface/ui/assets/security/enterprise-security.js`
- **Configuration:** `hexarchy/4-interface/ui/assets/security/security-config.js`
- **This Guide:** `docs/PLATFORM_SECURITY_INTEGRATION.md`

## Support

For security issues or questions:
- 📧 Email: security@hootner.com
- 📝 Docs: https://docs.hootner.com/security
- 🐛 Issues: https://github.com/Hootner/hootner/issues

## License

MIT License - see LICENSE file for details
