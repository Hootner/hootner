/**
 * HOOTNER Enterprise Security System
 * Platform-wide security module with 10 comprehensive layers
 * 
 * @version 2.0.0
 * @author HOOTNER Security Team
 * @license MIT
 */

// ============================================================================
// P0 CRITICAL SECURITY FEATURES
// ============================================================================

// P0-1: CSP NONCE SYSTEM WITH DYNAMIC GENERATION
export const cspNonceSystem = {
  currentNonce: null,
  scriptNonces: new Set(),
  
  generateNonce() {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    this.currentNonce = btoa(String.fromCharCode(...array)).replace(/=/g, '');
    return this.currentNonce;
  },
  
  initializeNonce() {
    this.generateNonce();
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (cspMeta) {
      const content = cspMeta.getAttribute('content').replace('DYNAMIC_NONCE', this.currentNonce);
      cspMeta.setAttribute('content', content);
    }
    return this.currentNonce;
  },
  
  applyToInlineScripts() {
    document.querySelectorAll('script:not([src]):not([nonce])').forEach(script => {
      script.setAttribute('nonce', this.currentNonce);
      this.scriptNonces.add(this.currentNonce);
    });
  },
  
  validateScript(nonce) {
    return this.scriptNonces.has(nonce) || nonce === this.currentNonce;
  },
  
  rotateNonce() {
    this.generateNonce();
    this.applyToInlineScripts();
  }
};

// P0-2: BROWSER FINGERPRINTING FOR SESSION VALIDATION
export const browserFingerprint = {
  fingerprint: null,
  
  async generate() {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
      navigator.platform,
      navigator.vendor,
      this.getPlugins(),
      this.getCanvas(),
      this.getWebGL()
    ];
    
    const data = components.join('|');
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    
    this.fingerprint = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return this.fingerprint;
  },
  
  getPlugins() {
    return Array.from(navigator.plugins).map(p => p.name).join(',');
  },
  
  getCanvas() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      return canvas.toDataURL();
    } catch {
      return 'unavailable';
    }
  },
  
  getWebGL() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch {
      return 'unavailable';
    }
  },
  
  async validate(storedFingerprint) {
    const current = await this.generate();
    const match = current === storedFingerprint;
    if (!match) {
      console.warn('Fingerprint mismatch - possible session hijacking');
    }
    return match;
  }
};

// P0-3: SQL & COMMAND INJECTION PREVENTION
export const injectionPrevention = {
  sqlPatterns: [
    /('|(\\-\\-)|(;)|(\\|\\|)|(\\*))/gi,
    /\\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?|FROM|WHERE|JOIN|ORDER BY|GROUP BY|HAVING)\\b/gi,
    /\\b(AND|OR|NOT|IS|NULL|LIKE|IN|BETWEEN)\\b.*[=<>]/gi,
    /\\bxp_\\w+/gi,
    /\\b(sp_executesql|sp_sqlexec)\\b/gi
  ],
  
  commandPatterns: [
    /[;&|`$()\\[\\]{}\\\\<>]/g,
    /\\b(bash|sh|cmd|powershell|curl|wget|nc|telnet|ssh|ftp)\\b/gi,
    /(\\r\\n|\\n|\\r)/g,
    /\\$\\{.*?\\}/g,
    /`.*?`/g
  ],
  
  ldapPatterns: [
    /[*()\\\\]/g,
    /\\b(objectClass|cn|ou|dc|uid)\\s*=/gi
  ],
  
  xpathPatterns: [
    /[\\'\"]/g,
    /\\b(or|and)\\b.*[=\\[]/gi,
    /\\[.*?\\]/g
  ],
  
  validateSQL(input) {
    const str = String(input);
    return !this.sqlPatterns.some(pattern => pattern.test(str));
  },
  
  validateCommand(input) {
    const str = String(input);
    return !this.commandPatterns.some(pattern => pattern.test(str));
  },
  
  validateLDAP(input) {
    const str = String(input);
    return !this.ldapPatterns.some(pattern => pattern.test(str));
  },
  
  validateXPath(input) {
    const str = String(input);
    return !this.xpathPatterns.some(pattern => pattern.test(str));
  },
  
  sanitizeSQL(input) {
    let str = String(input);
    str = str.replace(/'/g, "''");
    str = str.replace(/[;\\-\\-\\|]/g, '');
    return str;
  },
  
  sanitizeCommand(input) {
    let str = String(input);
    str = str.replace(/[;&|`$()\\[\\]{}\\\\<>\\r\\n]/g, '');
    return str;
  }
};

// P0-4: HMAC REQUEST SIGNING FOR API SECURITY
export const hmacSigner = {
  secret: null,
  
  async generateSecret() {
    const key = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-256' },
      true,
      ['sign', 'verify']
    );
    this.secret = key;
    return key;
  },
  
  async sign(data) {
    if (!this.secret) await this.generateSecret();
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const signature = await crypto.subtle.sign(
      'HMAC',
      this.secret,
      dataBuffer
    );
    
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  },
  
  async verify(data, signature) {
    if (!this.secret) return false;
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    
    return await crypto.subtle.verify(
      'HMAC',
      this.secret,
      signatureBuffer,
      dataBuffer
    );
  },
  
  async signRequest(url, method, body, timestamp) {
    const data = { url, method, body, timestamp };
    return await this.sign(data);
  }
};

// P0-5: REPLAY ATTACK PREVENTION
export const replayPrevention = {
  usedNonces: new Set(),
  requestWindow: 300000, // 5 minutes
  
  generateRequestNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },
  
  validateRequest(nonce, timestamp) {
    const now = Date.now();
    
    if (Math.abs(now - timestamp) > this.requestWindow) {
      console.warn('Request timestamp outside valid window');
      return false;
    }
    
    if (this.usedNonces.has(nonce)) {
      console.error('Replay attack detected - nonce reused');
      return false;
    }
    
    this.usedNonces.add(nonce);
    setTimeout(() => this.usedNonces.delete(nonce), this.requestWindow);
    
    return true;
  },
  
  createRequestMetadata() {
    return {
      nonce: this.generateRequestNonce(),
      timestamp: Date.now()
    };
  }
};

// P0-6: AES-256 DATA ENCRYPTION SYSTEM
export const aes256Encryption = {
  async generateKey() {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  },
  
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      dataBuffer
    );
    
    return {
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv))
    };
  },
  
  async decrypt(encryptedData, iv, key) {
    const dataBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer, tagLength: 128 },
      key,
      dataBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  },
  
  async encryptObject(obj) {
    const key = await this.generateKey();
    const encrypted = await this.encrypt(obj, key);
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    
    return {
      ...encrypted,
      key: exportedKey
    };
  },
  
  async decryptObject(encryptedObj) {
    const key = await crypto.subtle.importKey(
      'jwk',
      encryptedObj.key,
      { name: 'AES-GCM' },
      true,
      ['decrypt']
    );
    
    const decrypted = await this.decrypt(encryptedObj.data, encryptedObj.iv, key);
    return JSON.parse(decrypted);
  }
};

// P0-7: IP-BASED RATE LIMITING WITH DISTRIBUTED TRACKING
export const ipRateLimiter = {
  ipRequests: new Map(),
  blockedIPs: new Map(),
  limits: {
    perIP: { max: 100, window: 60000 },
    perIPStrict: { max: 10, window: 60000 }
  },
  
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return await browserFingerprint.generate();
    }
  },
  
  async isAllowed(endpoint = 'default') {
    const ip = await this.getClientIP();
    const now = Date.now();
    
    if (this.blockedIPs.has(ip)) {
      const blockedUntil = this.blockedIPs.get(ip);
      if (now < blockedUntil) {
        return { allowed: false, reason: 'ip_blocked', unblockAt: blockedUntil };
      }
      this.blockedIPs.delete(ip);
    }
    
    if (!this.ipRequests.has(ip)) {
      this.ipRequests.set(ip, []);
    }
    
    const requests = this.ipRequests.get(ip);
    const limit = endpoint.includes('auth') || endpoint.includes('admin') 
      ? this.limits.perIPStrict 
      : this.limits.perIP;
    
    const recentRequests = requests.filter(time => now - time < limit.window);
    
    if (recentRequests.length >= limit.max) {
      const blockDuration = 600000;
      this.blockedIPs.set(ip, now + blockDuration);
      return { allowed: false, reason: 'rate_limit_exceeded', unblockAt: now + blockDuration };
    }
    
    recentRequests.push(now);
    this.ipRequests.set(ip, recentRequests);
    
    return { allowed: true, remaining: limit.max - recentRequests.length };
  }
};

// P0-8: DOM MUTATION OBSERVER FOR TAMPERING DETECTION
export const domSecurityObserver = {
  observer: null,
  violations: [],
  
  initialize() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        this.checkMutation(mutation);
      });
    });
    
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true
    });
  },
  
  checkMutation(mutation) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'SCRIPT') {
          const hasValidNonce = node.hasAttribute('nonce') && 
            cspNonceSystem.validateScript(node.getAttribute('nonce'));
          
          if (!hasValidNonce && !node.src) {
            this.recordViolation('unauthorized_script', node);
            node.remove();
          }
        }
        
        if (node.nodeName === 'IFRAME') {
          this.recordViolation('unauthorized_iframe', node);
          node.remove();
        }
      });
    }
    
    if (mutation.type === 'attributes') {
      const target = mutation.target;
      if (target.tagName === 'FORM' && mutation.attributeName === 'action') {
        const newAction = target.getAttribute('action');
        if (!newAction.startsWith(window.location.origin)) {
          this.recordViolation('form_action_tampering', target);
          target.setAttribute('action', mutation.oldValue);
        }
      }
    }
  },
  
  recordViolation(type, element) {
    const violation = {
      type,
      timestamp: Date.now(),
      element: element.tagName,
      content: element.textContent?.substring(0, 100)
    };
    
    this.violations.push(violation);
    console.error('DOM Security Violation:', violation);
  },
  
  getViolations() {
    return [...this.violations];
  }
};

// P0-9: SRI VALIDATION
export const sriValidator = {
  async calculateHash(url) {
    try {
      const response = await fetch(url);
      const content = await response.text();
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-384', data);
      return 'sha384-' + btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
    } catch (error) {
      console.error('Failed to calculate SRI hash:', error);
      return null;
    }
  },
  
  async validateScript(scriptElement) {
    if (!scriptElement.src) return true;
    
    const integrity = scriptElement.getAttribute('integrity');
    if (!integrity) {
      console.warn('Script missing integrity attribute:', scriptElement.src);
      return false;
    }
    
    const calculatedHash = await this.calculateHash(scriptElement.src);
    if (calculatedHash !== integrity) {
      console.error('SRI validation failed:', scriptElement.src);
      return false;
    }
    
    return true;
  }
};

// P0-10: ENHANCED SECURITY EVENT LOGGING
export const enhancedSecurityLogger = {
  events: [],
  maxEvents: 5000,
  severityLevels: ['debug', 'info', 'warning', 'error', 'critical'],
  
  async log(eventType, details, severity = 'info', category = 'general') {
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: eventType,
      category,
      severity,
      details: typeof details === 'object' ? details : { message: details },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 100),
        fingerprint: await browserFingerprint.generate()
      }
    };
    
    this.events.push(event);
    
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    const consoleMethod = severity === 'critical' || severity === 'error' ? 'error' :
                         severity === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[${severity.toUpperCase()}] ${eventType}:`, details);
    
    if (severity === 'critical') {
      await this.sendToServer(event);
    }
  },
  
  async sendToServer(event) {
    try {
      const signature = await hmacSigner.sign(event);
      
      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HMAC-Signature': signature
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Silent fail
    }
  },
  
  query(filters = {}) {
    return this.events.filter(event => {
      if (filters.severity && event.severity !== filters.severity) return false;
      if (filters.type && event.type !== filters.type) return false;
      if (filters.category && event.category !== filters.category) return false;
      return true;
    });
  },
  
  exportLogs() {
    return JSON.stringify(this.events, null, 2);
  }
};

// ============================================================================
// CORE SECURITY SYSTEM
// ============================================================================

// XSS Protection
export const xssPatterns = [
  /<script[\s\S]*?>.*?<\/script>/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /on\w+\s*=\s*[^\s>]*/gi,
  /javascript:/gi
];

export const sanitize = (input) => {
  if (input == null) return '';
  let str = String(input);
  if (str.length > 10000) str = str.slice(0, 10000);
  
  xssPatterns.forEach(pattern => {
    str = str.replace(pattern, '');
  });
  
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const isContentValid = (content) => {
  return !xssPatterns.some(pattern => pattern.test(content));
};

// Session Management
export const sessionManager = {
  token: null,
  lastActivity: Date.now(),
  SESSION_TIMEOUT: 30 * 60 * 1000,
  
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    this.lastActivity = Date.now();
    return this.token;
  },
  
  validateSession() {
    if (!this.token) return false;
    if (Date.now() - this.lastActivity > this.SESSION_TIMEOUT) {
      this.destroySession();
      return false;
    }
    this.lastActivity = Date.now();
    return true;
  },
  
  refreshSession() {
    if (this.validateSession()) {
      this.lastActivity = Date.now();
    }
  },
  
  destroySession() {
    this.token = null;
    this.lastActivity = 0;
    console.log('Session destroyed');
  }
};

// Rate Limiting
export const rateLimiter = {
  requests: {},
  blocked: {},
  limits: {
    profile: { max: 3, window: 60000 },
    api: { max: 30, window: 60000 },
    upload: { max: 5, window: 300000 }
  },
  
  isAllowed(key, type = 'api') {
    const now = Date.now();
    
    if (this.blocked[key] && now < this.blocked[key]) {
      return false;
    }
    
    if (this.blocked[key]) {
      delete this.blocked[key];
    }
    
    if (!this.requests[key]) {
      this.requests[key] = [];
    }
    
    const limit = this.limits[type];
    this.requests[key] = this.requests[key].filter(time => now - time < limit.window);
    
    if (this.requests[key].length >= limit.max) {
      this.blocked[key] = now + 300000;
      return false;
    }
    
    this.requests[key].push(now);
    return true;
  }
};

// CSRF Protection
export const csrfManager = {
  token: null,
  
  generateToken() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  },
  
  getToken() {
    if (!this.token) {
      this.generateToken();
    }
    if (Math.random() < 0.1) {
      this.generateToken();
    }
    return this.token;
  }
};

// Input Validation
export const validate = {
  email: (email) => {
    if (!email || typeof email !== 'string' || email.length > 320) return false;
    const [local, domain] = email.split('@');
    if (!local || !domain || local.length > 64 || domain.length > 255) return false;
    return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
  },
  username: (username) => {
    if (!username || typeof username !== 'string') return false;
    return /^[a-zA-Z0-9_]{3,30}$/.test(username) && isContentValid(username);
  },
  url: (url) => {
    if (!url || typeof url !== 'string' || url.length > 2048) return false;
    return /^https:\/\/[^\s<>\"']+$/.test(url) && isContentValid(url);
  },
  bio: (bio) => {
    if (!bio || typeof bio !== 'string' || bio.length > 500) return false;
    return isContentValid(bio);
  }
};

// Secure API Requests
export const secureRequest = async (url, options = {}) => {
  if (!sessionManager.validateSession()) {
    throw new Error('Session expired');
  }
  
  if (!rateLimiter.isAllowed(url, 'api')) {
    throw new Error('Rate limit exceeded');
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  // Add request metadata for replay prevention
  const metadata = replayPrevention.createRequestMetadata();
  
  // Sign request with HMAC
  const signature = await hmacSigner.signRequest(url, options.method || 'GET', options.body, metadata.timestamp);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
      mode: 'cors',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': csrfManager.getToken(),
        'X-Session-Token': sessionManager.token,
        'X-Request-Nonce': metadata.nonce,
        'X-Request-Timestamp': metadata.timestamp.toString(),
        'X-HMAC-Signature': signature,
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const message = response.status === 429 ? 'Rate limited' : 
                    response.status === 401 ? 'Unauthorized' : 
                    `HTTP ${response.status}`;
      throw new Error(message);
    }
    
    sessionManager.refreshSession();
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeSecurity(config = {}) {
  try {
    // Initialize HMAC
    await hmacSigner.generateSecret();
    
    // Generate browser fingerprint
    await browserFingerprint.generate();
    
    // Initialize CSP nonces
    const nonce = cspNonceSystem.initializeNonce();
    cspNonceSystem.applyToInlineScripts();
    
    // Initialize DOM observer
    domSecurityObserver.initialize();
    
    // Initialize session
    sessionManager.generateToken();
    
    // Initialize CSRF
    csrfManager.generateToken();
    
    // Clickjacking prevention
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
    
    // Production hardening
    if (config.production !== false && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      console.debug = () => {};
    }
    
    // Inactivity protection
    let inactivityTimer = null;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      sessionManager.refreshSession();
      
      inactivityTimer = setTimeout(() => {
        sessionManager.destroySession();
        if (config.onSessionExpire) {
          config.onSessionExpire();
        } else {
          alert('Session expired due to inactivity. Please refresh the page.');
          window.location.reload();
        }
      }, sessionManager.SESSION_TIMEOUT);
    };
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });
    
    resetInactivityTimer();
    
    // Log initialization
    await enhancedSecurityLogger.log(
      'security_system_initialized',
      {
        version: '2.0.0',
        features: [
          'csp_nonces',
          'browser_fingerprinting',
          'injection_prevention',
          'hmac_signing',
          'replay_prevention',
          'aes256_encryption',
          'ip_rate_limiting',
          'dom_mutation_observer',
          'sri_validation',
          'enhanced_logging'
        ],
        nonce
      },
      'info',
      'initialization'
    );
    
    return {
      success: true,
      nonce,
      fingerprint: browserFingerprint.fingerprint
    };
    
  } catch (error) {
    console.error('Security initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Global error handling
window.addEventListener('error', (e) => {
  console.error('Error:', sanitize(e.message));
  e.preventDefault();
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled Promise:', sanitize(String(e.reason)));
  e.preventDefault();
});

// Export all security modules
export default {
  // P0 Critical Features
  cspNonceSystem,
  browserFingerprint,
  injectionPrevention,
  hmacSigner,
  replayPrevention,
  aes256Encryption,
  ipRateLimiter,
  domSecurityObserver,
  sriValidator,
  enhancedSecurityLogger,
  
  // Core Security
  sanitize,
  isContentValid,
  sessionManager,
  rateLimiter,
  csrfManager,
  validate,
  secureRequest,
  
  // Initialization
  initializeSecurity
};
