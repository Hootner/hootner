/**
 * HOOTNER Security Configuration
 * Customize security settings for different environments
 */

export const securityConfig = {
  // Environment
  production: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  
  // Session Management
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    enableFingerprinting: true,
    enableHijackDetection: true
  },
  
  // Rate Limiting
  rateLimits: {
    api: {
      max: 100,
      window: 60000 // 1 minute
    },
    auth: {
      max: 10,
      window: 60000
    },
    upload: {
      max: 5,
      window: 300000 // 5 minutes
    },
    perIP: {
      max: 100,
      window: 60000
    },
    perIPStrict: {
      max: 10,
      window: 60000
    }
  },
  
  // CSRF Protection
  csrf: {
    tokenRotation: true,
    rotationProbability: 0.1, // 10% chance per request
    doubleSubmit: true
  },
  
  // Content Security Policy
  csp: {
    enableNonces: true,
    rotateNonces: true,
    rotationInterval: 300000, // 5 minutes
    reportUri: '/api/security/csp-report'
  },
  
  // Input Validation
  validation: {
    maxInputLength: 10000,
    maxEmailLength: 320,
    maxUsernameLength: 30,
    maxUrlLength: 2048,
    maxBioLength: 500,
    enableSQLInjectionPrevention: true,
    enableCommandInjectionPrevention: true,
    enableXSSPrevention: true
  },
  
  // Encryption
  encryption: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    tagLength: 128,
    enableLocalStorageEncryption: true
  },
  
  // Logging
  logging: {
    maxEvents: 5000,
    severityLevels: ['debug', 'info', 'warning', 'error', 'critical'],
    sendCriticalToServer: true,
    serverEndpoint: '/api/security/events',
    enablePatternAnalysis: true,
    patternThreshold: 10 // Alert after 10 occurrences
  },
  
  // API Security
  api: {
    timeout: 10000, // 10 seconds
    enableHMAC: true,
    enableReplayPrevention: true,
    replayWindow: 300000, // 5 minutes
    requireHTTPS: true
  },
  
  // DOM Security
  dom: {
    enableMutationObserver: true,
    blockUnauthorizedScripts: true,
    blockUnauthorizedIframes: true,
    blockFormActionTampering: true
  },
  
  // SRI (Subresource Integrity)
  sri: {
    enabled: true,
    algorithm: 'sha384',
    validateOnLoad: true,
    blockInvalidScripts: false // Set to true in production
  },
  
  // IP-Based Protection
  ip: {
    enableTracking: true,
    blockDuration: 600000, // 10 minutes
    enableDistributedLimiting: true
  },
  
  // Production Hardening
  hardening: {
    disableConsole: true,
    detectDevTools: true,
    obfuscateErrors: true,
    enableIntegrityChecks: true
  },
  
  // Callbacks
  callbacks: {
    onSessionExpire: null,
    onSecurityViolation: null,
    onRateLimitExceeded: null,
    onCSRFFailure: null,
    onInjectionAttempt: null
  },
  
  // Feature Flags
  features: {
    enableP0Security: true,
    enableCSPNonces: true,
    enableBrowserFingerprinting: true,
    enableInjectionPrevention: true,
    enableHMACSignature: true,
    enableReplayPrevention: true,
    enableAES256: true,
    enableIPRateLimiting: true,
    enableDOMObserver: true,
    enableSRIValidation: true,
    enableEnhancedLogging: true
  }
};

export default securityConfig;
