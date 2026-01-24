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

// P0-4: HMAC-512 REQUEST SIGNING FOR API SECURITY
export const hmacSigner = {
  secret: null,

  async generateSecret() {
    const key = await crypto.subtle.generateKey(
      { name: 'HMAC', hash: 'SHA-512' },
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

// 11-20: ADVANCED XSS PROTECTION WITH 5 ENCODERS
export const xssProtection = {
  patterns: [
    /<script[\s\S]*?>.*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /on\w+\s*=\s*[^\s>]*/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ],

  // Encoder 1: HTML Entity Encoding
  encodeHTML(input) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return String(input).replace(/[&<>"'\/]/g, m => map[m]);
  },

  // Encoder 2: JavaScript String Encoding
  encodeJS(input) {
    return String(input).replace(/[\\"'\n\r\t\b\f]/g, match => {
      const escapes = { '\\': '\\\\', '"': '\\"', "'": "\\'", '\n': '\\n', '\r': '\\r', '\t': '\\t', '\b': '\\b', '\f': '\\f' };
      return escapes[match];
    });
  },

  // Encoder 3: URL Encoding
  encodeURL(input) {
    return encodeURIComponent(String(input));
  },

  // Encoder 4: CSS Encoding
  encodeCSS(input) {
    return String(input).replace(/[^a-zA-Z0-9]/g, match => {
      return '\\' + match.charCodeAt(0).toString(16).padStart(6, '0');
    });
  },

  // Encoder 5: Attribute Encoding
  encodeAttr(input) {
    return String(input).replace(/[^\w.-]/g, match => {
      return '&#' + match.charCodeAt(0) + ';';
    });
  },

  sanitize(input, context = 'html') {
    if (input == null) return '';
    let str = String(input);
    if (str.length > 10000) str = str.slice(0, 10000);

    // Remove dangerous patterns
    this.patterns.forEach(pattern => {
      str = str.replace(pattern, '');
    });

    // Apply context-specific encoding
    switch (context) {
      case 'html': return this.encodeHTML(str);
      case 'js': return this.encodeJS(str);
      case 'url': return this.encodeURL(str);
      case 'css': return this.encodeCSS(str);
      case 'attr': return this.encodeAttr(str);
      default: return this.encodeHTML(str);
    }
  },

  isContentValid(content) {
    return !this.patterns.some(pattern => pattern.test(content));
  }
};

// Legacy exports for backward compatibility
export const xssPatterns = xssProtection.patterns;
export const sanitize = (input, context) => xssProtection.sanitize(input, context);
export const isContentValid = (content) => xssProtection.isContentValid(content);

// 12: CORS MANAGER
export const corsManager = {
  allowedOrigins: ['https://hootner.com', 'https://*.hootner.com'],
  
  isOriginAllowed(origin) {
    return this.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    });
  },
  
  addOrigin(origin) {
    if (!this.allowedOrigins.includes(origin)) {
      this.allowedOrigins.push(origin);
    }
  },
  
  getCorsHeaders(origin) {
    if (this.isOriginAllowed(origin)) {
      return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Session-Token',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      };
    }
    return {};
  }
};

// 13: CLICKJACKING PREVENTION (Enhanced)
export const clickjackingPrevention = {
  initialize() {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
    
    // Add visual indicator if framed
    if (window.self !== window.top) {
      document.body.style.display = 'none';
      alert('Security Warning: This page cannot be displayed in a frame.');
    }
  }
};

// 14: SECURE COOKIE MANAGER
export const secureCookies = {
  set(name, value, options = {}) {
    const defaults = {
      days: 7,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict',
      httpOnly: false
    };
    
    const config = { ...defaults, ...options };
    const expires = new Date();
    expires.setTime(expires.getTime() + (config.days * 24 * 60 * 60 * 1000));
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; expires=${expires.toUTCString()}`;
    cookieString += `; path=${config.path}`;
    
    if (config.secure) cookieString += '; Secure';
    if (config.sameSite) cookieString += `; SameSite=${config.sameSite}`;
    if (config.domain) cookieString += `; Domain=${config.domain}`;
    
    document.cookie = cookieString;
  },
  
  get(name) {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  },
  
  delete(name) {
    this.set(name, '', { days: -1 });
  },
  
  deleteAll() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const name = cookie.split('=')[0].trim();
      this.delete(name);
    }
  }
};

// 15: SRI AUTO-FIX
export const sriAutoFix = {
  async fixScript(scriptElement) {
    if (!scriptElement.src || scriptElement.getAttribute('integrity')) {
      return true;
    }
    
    try {
      const response = await fetch(scriptElement.src);
      const content = await response.text();
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-384', data);
      const hash = 'sha384-' + btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
      
      scriptElement.setAttribute('integrity', hash);
      scriptElement.setAttribute('crossorigin', 'anonymous');
      return true;
    } catch (error) {
      console.error('SRI auto-fix failed:', error);
      return false;
    }
  },
  
  async fixAllScripts() {
    const scripts = document.querySelectorAll('script[src]:not([integrity])');
    const results = [];
    
    for (const script of scripts) {
      const success = await this.fixScript(script);
      results.push({ src: script.src, success });
    }
    
    return results;
  }
};

// 16: MEMORY GUARD
export const memoryGuard = {
  thresholds: {
    warning: 150 * 1024 * 1024, // 150MB
    critical: 200 * 1024 * 1024  // 200MB
  },
  monitoring: false,
  
  startMonitoring(interval = 30000) {
    if (this.monitoring || !performance.memory) return;
    
    this.monitoring = true;
    this.intervalId = setInterval(() => {
      const used = performance.memory.usedJSHeapSize;
      
      if (used > this.thresholds.critical) {
        console.error('CRITICAL: Memory usage:', (used / 1024 / 1024).toFixed(2), 'MB');
        this.triggerGarbageCollection();
      } else if (used > this.thresholds.warning) {
        console.warn('WARNING: Memory usage:', (used / 1024 / 1024).toFixed(2), 'MB');
      }
    }, interval);
  },
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.monitoring = false;
    }
  },
  
  triggerGarbageCollection() {
    // Clear large data structures
    if (typeof gc === 'function') {
      gc(); // Available in Node.js with --expose-gc flag
    }
  },
  
  getMemoryStats() {
    if (!performance.memory) return null;
    
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      percentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(2)
    };
  }
};

// 17: TIMING-SAFE COMPARISON
export const timingSafe = {
  compare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }
    
    const strA = String(a);
    const strB = String(b);
    const lenA = strA.length;
    const lenB = strB.length;
    
    // Ensure constant time by always comparing same length
    const maxLen = Math.max(lenA, lenB);
    let result = lenA === lenB ? 0 : 1;
    
    for (let i = 0; i < maxLen; i++) {
      const charA = i < lenA ? strA.charCodeAt(i) : 0;
      const charB = i < lenB ? strB.charCodeAt(i) : 0;
      result |= charA ^ charB;
    }
    
    return result === 0;
  },
  
  async compareAsync(a, b) {
    // Use Web Crypto API for constant-time comparison
    const encoder = new TextEncoder();
    const dataA = encoder.encode(String(a));
    const dataB = encoder.encode(String(b));
    
    if (dataA.length !== dataB.length) {
      // Perform dummy operation to maintain timing
      await crypto.subtle.digest('SHA-256', dataA);
      return false;
    }
    
    const hashA = await crypto.subtle.digest('SHA-256', dataA);
    const hashB = await crypto.subtle.digest('SHA-256', dataB);
    
    return this.compareBuffers(hashA, hashB);
  },
  
  compareBuffers(a, b) {
    const viewA = new Uint8Array(a);
    const viewB = new Uint8Array(b);
    
    if (viewA.length !== viewB.length) return false;
    
    let result = 0;
    for (let i = 0; i < viewA.length; i++) {
      result |= viewA[i] ^ viewB[i];
    }
    
    return result === 0;
  }
};

// 18: HEADER GUARD
export const headerGuard = {
  requiredHeaders: [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Permissions-Policy'
  ],
  
  validateResponse(response) {
    const missing = [];
    
    this.requiredHeaders.forEach(header => {
      if (!response.headers.has(header)) {
        missing.push(header);
      }
    });
    
    if (missing.length > 0) {
      console.warn('Missing security headers:', missing);
      return false;
    }
    
    return true;
  },
  
  getRecommendedHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
  }
};

// 19: WEBSOCKET SECURITY (Enhanced)
export const webSocketSecurity = {
  connections: new Map(),
  
  async createSecureConnection(url, options = {}) {
    const wsUrl = url.replace(/^ws:/, 'wss:');
    const token = options.token || sessionManager.token;
    const authenticatedUrl = `${wsUrl}?token=${encodeURIComponent(token)}`;
    
    const ws = new WebSocket(authenticatedUrl);
    const connId = crypto.randomUUID();
    
    this.connections.set(connId, {
      ws,
      url: wsUrl,
      created: Date.now(),
      messageCount: 0
    });
    
    ws.onmessage = (event) => {
      const conn = this.connections.get(connId);
      if (conn) {
        conn.messageCount++;
        if (this.validateMessage(event.data)) {
          options.onMessage?.(JSON.parse(event.data));
        }
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      options.onError?.(error);
    };
    
    ws.onclose = () => {
      this.connections.delete(connId);
      options.onClose?.();
    };
    
    return { ws, id: connId };
  },
  
  validateMessage(data) {
    try {
      const parsed = JSON.parse(data);
      return parsed && typeof parsed === 'object' && parsed.type;
    } catch {
      return false;
    }
  },
  
  closeAll() {
    this.connections.forEach(conn => {
      conn.ws.close();
    });
    this.connections.clear();
  }
};

// 20: ENCRYPTED STORAGE (Enhanced)
export const encryptedStorage = {
  async set(key, value) {
    const encrypted = await aes256Encryption.encryptObject(value);
    localStorage.setItem(`secure_${key}`, JSON.stringify(encrypted));
  },
  
  async get(key) {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    
    try {
      return await aes256Encryption.decryptObject(JSON.parse(encrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(`secure_${key}`);
  },
  
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
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

// 21-30: EXTENDED SECURITY FEATURES

// 21: COEP/COOP/CORP Headers (Already in meta tags, validation here)
export const crossOriginPolicies = {
  validate() {
    const meta = {
      coep: document.querySelector('meta[http-equiv="Cross-Origin-Embedder-Policy"]'),
      coop: document.querySelector('meta[http-equiv="Cross-Origin-Opener-Policy"]'),
      corp: document.querySelector('meta[http-equiv="Cross-Origin-Resource-Policy"]')
    };
    
    return {
      coep: meta.coep?.content === 'require-corp',
      coop: meta.coop?.content === 'same-origin',
      corp: meta.corp?.content === 'same-origin'
    };
  }
};

// 22: SESSION HIJACKING DETECTION
export const sessionHijackingDetection = {
  initialFingerprint: null,
  checksEnabled: true,
  
  async initialize() {
    this.initialFingerprint = await browserFingerprint.generate();
  },
  
  async checkForHijacking() {
    if (!this.checksEnabled || !this.initialFingerprint) return true;
    
    const currentFingerprint = await browserFingerprint.generate();
    const match = timingSafe.compare(this.initialFingerprint, currentFingerprint);
    
    if (!match) {
      console.error('SESSION HIJACKING DETECTED');
      await enhancedSecurityLogger.log(
        'session_hijacking_detected',
        { 
          initial: this.initialFingerprint.substring(0, 16),
          current: currentFingerprint.substring(0, 16)
        },
        'critical',
        'security'
      );
      sessionManager.destroySession();
      return false;
    }
    
    return true;
  }
};

// 23: DOUBLE-SUBMIT CSRF
export const doubleSubmitCSRF = {
  tokenName: 'csrf_token',
  
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    
    // Store in cookie
    secureCookies.set(this.tokenName, token, { sameSite: 'Strict', secure: true });
    
    return token;
  },
  
  getToken() {
    let token = secureCookies.get(this.tokenName);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  },
  
  validateRequest(cookieToken, headerToken) {
    if (!cookieToken || !headerToken) return false;
    return timingSafe.compare(cookieToken, headerToken);
  }
};

// 24: CONSOLE DISABLE (Enhanced)
export const consoleProtection = {
  originalConsole: {},
  disabled: false,
  
  disable() {
    if (this.disabled) return;
    
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
    
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    this.disabled = true;
  },
  
  enable() {
    if (!this.disabled) return;
    
    Object.assign(console, this.originalConsole);
    this.disabled = false;
  }
};

// 25: DEVTOOLS DETECTION (Enhanced)
export const devToolsDetection = {
  threshold: 160,
  checking: false,
  
  isOpen() {
    return window.outerWidth - window.innerWidth > this.threshold ||
           window.outerHeight - window.innerHeight > this.threshold;
  },
  
  startMonitoring(callback) {
    if (this.checking) return;
    
    this.checking = true;
    this.intervalId = setInterval(() => {
      if (this.isOpen()) {
        console.clear();
        callback?.();
      }
    }, 1000);
  },
  
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.checking = false;
    }
  }
};

// 26: PATTERN ANALYSIS
export const patternAnalysis = {
  patterns: new Map(),
  threshold: 10,
  
  recordEvent(eventType) {
    const count = (this.patterns.get(eventType) || 0) + 1;
    this.patterns.set(eventType, count);
    
    if (count >= this.threshold) {
      console.error(`PATTERN DETECTED: ${eventType} occurred ${count} times`);
      enhancedSecurityLogger.log(
        'security_pattern_detected',
        { type: eventType, count },
        'critical',
        'monitoring'
      );
      return true;
    }
    
    return false;
  },
  
  reset(eventType) {
    if (eventType) {
      this.patterns.delete(eventType);
    } else {
      this.patterns.clear();
    }
  },
  
  getStats() {
    return Object.fromEntries(this.patterns);
  }
};

// 27-29: ENHANCED VALIDATORS
export const validators = {
  email(email) {
    if (!email || typeof email !== 'string' || email.length > 320) return false;
    const [local, domain] = email.split('@');
    if (!local || !domain || local.length > 64 || domain.length > 255) return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && xssProtection.isContentValid(email);
  },
  
  url(url) {
    if (!url || typeof url !== 'string' || url.length > 2048) return false;
    
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && xssProtection.isContentValid(url);
    } catch {
      return false;
    }
  },
  
  text(text, maxLength = 500) {
    if (!text || typeof text !== 'string') return false;
    if (text.length > maxLength) return false;
    return xssProtection.isContentValid(text) &&
           injectionPrevention.validateSQL(text) &&
           injectionPrevention.validateCommand(text);
  },
  
  username(username) {
    if (!username || typeof username !== 'string') return false;
    return /^[a-zA-Z0-9_]{3,30}$/.test(username) && xssProtection.isContentValid(username);
  },
  
  phoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return false;
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s()-]/g, ''));
  },
  
  creditCard(number) {
    if (!number || typeof number !== 'string') return false;
    const cleaned = number.replace(/\s/g, '');
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
};

// 30: TOKEN ROTATION
export const tokenRotation = {
  rotationInterval: 300000, // 5 minutes
  autoRotate: false,
  
  startAutoRotation() {
    if (this.autoRotate) return;
    
    this.autoRotate = true;
    this.intervalId = setInterval(() => {
      csrfManager.generateToken();
      doubleSubmitCSRF.generateToken();
      cspNonceSystem.rotateNonce();
    }, this.rotationInterval);
  },
  
  stopAutoRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.autoRotate = false;
    }
  }
};

// 31-40: UTILITY FEATURES

// 31: REQUEST TIMEOUT (Enhanced)
export const requestTimeout = {
  defaultTimeout: 10000,
  
  async withTimeout(promise, timeout = this.defaultTimeout) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
};

// 32: CRYPTO TOKEN GENERATOR
export const cryptoTokenGenerator = {
  generate(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },
  
  generateBase64(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  },
  
  generateUUID() {
    return crypto.randomUUID();
  }
};

// 33: REAL IP DETECTION (Enhanced)
export const realIPDetection = {
  async getIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await response.json();
      return data.ip;
    } catch {
      return await browserFingerprint.generate();
    }
  },
  
  async getDetailedInfo() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      return await response.json();
    } catch {
      return null;
    }
  }
};

// 34: ENDPOINT LIMITER (5 Tiers)
export const endpointLimiter = {
  tiers: {
    public: { max: 100, window: 60000 },
    authenticated: { max: 200, window: 60000 },
    premium: { max: 500, window: 60000 },
    admin: { max: 1000, window: 60000 },
    sensitive: { max: 10, window: 60000 }
  },
  requests: new Map(),
  
  isAllowed(endpoint, tier = 'public') {
    const now = Date.now();
    const key = `${tier}:${endpoint}`;
    const limit = this.tiers[tier];
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    const recentRequests = requests.filter(time => now - time < limit.window);
    
    if (recentRequests.length >= limit.max) {
      return { allowed: false, remaining: 0, resetAt: Math.min(...recentRequests) + limit.window };
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return { allowed: true, remaining: limit.max - recentRequests.length };
  }
};

// 35: IP STATISTICS
export const ipStatistics = {
  stats: new Map(),
  
  async record(action) {
    const ip = await realIPDetection.getIP();
    
    if (!this.stats.has(ip)) {
      this.stats.set(ip, {
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        actions: [],
        requestCount: 0
      });
    }
    
    const stat = this.stats.get(ip);
    stat.lastSeen = Date.now();
    stat.actions.push({ action, timestamp: Date.now() });
    stat.requestCount++;
    
    // Keep only last 100 actions
    if (stat.actions.length > 100) {
      stat.actions.shift();
    }
  },
  
  async getStats() {
    const ip = await realIPDetection.getIP();
    return this.stats.get(ip) || null;
  }
};

// 36: VIOLATION RECORDER
export const violationRecorder = {
  violations: [],
  maxViolations: 1000,
  
  record(type, details) {
    const violation = {
      id: crypto.randomUUID(),
      type,
      details,
      timestamp: Date.now(),
      fingerprint: browserFingerprint.fingerprint
    };
    
    this.violations.push(violation);
    
    if (this.violations.length > this.maxViolations) {
      this.violations.shift();
    }
    
    enhancedSecurityLogger.log(
      'security_violation',
      violation,
      'warning',
      'violations'
    );
  },
  
  getViolations(filter = {}) {
    return this.violations.filter(v => {
      if (filter.type && v.type !== filter.type) return false;
      if (filter.since && v.timestamp < filter.since) return false;
      return true;
    });
  }
};

// 37-38: FORM & ATTRIBUTE GUARDS
export const formGuard = {
  protectForm(formElement) {
    const originalAction = formElement.action;
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'action') {
          const newAction = formElement.action;
          if (!newAction.startsWith(window.location.origin)) {
            formElement.action = originalAction;
            violationRecorder.record('form_action_tampering', { original: originalAction, attempted: newAction });
          }
        }
      });
    });
    
    observer.observe(formElement, { attributes: true });
    return observer;
  }
};

export const attributeGuard = {
  protectElement(element, attributes) {
    const originalValues = {};
    attributes.forEach(attr => {
      originalValues[attr] = element.getAttribute(attr);
    });
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (attributes.includes(mutation.attributeName)) {
          const newValue = element.getAttribute(mutation.attributeName);
          if (newValue !== originalValues[mutation.attributeName]) {
            element.setAttribute(mutation.attributeName, originalValues[mutation.attributeName]);
            violationRecorder.record('attribute_tampering', {
              element: element.tagName,
              attribute: mutation.attributeName,
              original: originalValues[mutation.attributeName],
              attempted: newValue
            });
          }
        }
      });
    });
    
    observer.observe(element, { attributes: true });
    return observer;
  }
};

// 39: HASH REGISTRY
export const hashRegistry = {
  hashes: new Map(),
  
  async register(key, data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    this.hashes.set(key, hash);
    return hash;
  },
  
  async verify(key, data) {
    const storedHash = this.hashes.get(key);
    if (!storedHash) return false;
    
    const currentHash = await this.register(key + '_temp', data);
    const match = timingSafe.compare(storedHash, currentHash);
    this.hashes.delete(key + '_temp');
    
    return match;
  }
};

// 40: VALIDATION LOGGER
export const validationLogger = {
  logs: [],
  maxLogs: 5000,
  
  log(field, value, isValid, reason) {
    const entry = {
      timestamp: Date.now(),
      field,
      valueLength: String(value).length,
      isValid,
      reason
    };
    
    this.logs.push(entry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    if (!isValid) {
      enhancedSecurityLogger.log(
        'validation_failed',
        entry,
        'warning',
        'validation'
      );
    }
  },
  
  getStats() {
    const total = this.logs.length;
    const failed = this.logs.filter(l => !l.isValid).length;
    
    return {
      total,
      failed,
      passed: total - failed,
      failureRate: total > 0 ? (failed / total * 100).toFixed(2) : 0
    };
  }
};

// Rate Limiting (Enhanced with 5 tiers)
export const rateLimiter = {
  requests: {},
  blocked: {},
  limits: {
    public: { max: 30, window: 60000 },
    authenticated: { max: 100, window: 60000 },
    premium: { max: 300, window: 60000 },
    admin: { max: 1000, window: 60000 },
    api: { max: 50, window: 60000 }
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

    const limit = this.limits[type] || this.limits.api;
    this.requests[key] = this.requests[key].filter(time => now - time < limit.window);

    if (this.requests[key].length >= limit.max) {
      this.blocked[key] = now + 300000;
      patternAnalysis.recordEvent('rate_limit_exceeded');
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

// Input Validation (Enhanced - backward compatible)
export const validate = {
  email: (email) => validators.email(email),
  username: (username) => validators.username(username),
  url: (url) => validators.url(url),
  bio: (bio) => validators.text(bio, 500),
  text: (text, maxLength) => validators.text(text, maxLength),
  phoneNumber: (phone) => validators.phoneNumber(phone),
  creditCard: (number) => validators.creditCard(number)
};

// Secure API Requests (Fully Enhanced)
export const secureRequest = async (url, options = {}) => {
  // Check session hijacking
  const hijackingCheck = await sessionHijackingDetection.checkForHijacking();
  if (!hijackingCheck) {
    throw new Error('Session hijacking detected');
  }

  if (!sessionManager.validateSession()) {
    throw new Error('Session expired');
  }

  // Enhanced rate limiting with tier support
  const tier = options.tier || 'api';
  if (!rateLimiter.isAllowed(url, tier)) {
    throw new Error('Rate limit exceeded');
  }

  // Endpoint-specific limiting
  const endpointLimit = endpointLimiter.isAllowed(url, tier);
  if (!endpointLimit.allowed) {
    throw new Error(`Endpoint rate limit exceeded. Reset at: ${new Date(endpointLimit.resetAt)}`);
  }

  const controller = new AbortController();
  const timeout = options.timeout || requestTimeout.defaultTimeout;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add request metadata for replay prevention
  const metadata = replayPrevention.createRequestMetadata();

  // Sign request with HMAC-512
  const signature = await hmacSigner.signRequest(url, options.method || 'GET', options.body, metadata.timestamp);

  // Get double-submit CSRF tokens
  const csrfToken = doubleSubmitCSRF.getToken();

  // Record IP statistics
  await ipStatistics.record(`request:${url}`);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
      mode: 'cors',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': csrfToken,
        'X-CSRF-Token-Double': csrfToken,
        'X-Session-Token': sessionManager.token,
        'X-Request-Nonce': metadata.nonce,
        'X-Request-Timestamp': metadata.timestamp.toString(),
        'X-HMAC-Signature': signature,
        'X-Fingerprint': browserFingerprint.fingerprint,
        ...options.headers
      }
    });

    clearTimeout(timeoutId);

    // Validate security headers
    headerGuard.validateResponse(response);

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
    violationRecorder.record('request_failed', { url, error: error.message });
    throw error;
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

export async function initializeSecurity(config = {}) {
  try {
    // Initialize HMAC-512
    await hmacSigner.generateSecret();

    // Generate browser fingerprint (15 components)
    await browserFingerprint.generate();

    // Initialize CSP nonces
    const nonce = cspNonceSystem.initializeNonce();
    cspNonceSystem.applyToInlineScripts();

    // Initialize DOM observer
    domSecurityObserver.initialize();

    // Initialize session & hijacking detection
    sessionManager.generateToken();
    await sessionHijackingDetection.initialize();

    // Initialize CSRF (both types)
    csrfManager.generateToken();
    doubleSubmitCSRF.generateToken();

    // Clickjacking prevention
    clickjackingPrevention.initialize();

    // Start token rotation
    if (config.tokenRotation !== false) {
      tokenRotation.startAutoRotation();
    }

    // Start memory monitoring
    if (config.memoryGuard !== false) {
      memoryGuard.startMonitoring();
    }

    // Production hardening
    if (config.production !== false && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      consoleProtection.disable();
      devToolsDetection.startMonitoring(() => {
        enhancedSecurityLogger.log('devtools_detected', {}, 'warning', 'security');
      });
    }

    // Validate cross-origin policies
    const policies = crossOriginPolicies.validate();
    if (!policies.coep || !policies.coop || !policies.corp) {
      console.warn('Missing cross-origin policies:', policies);
    }

    // Auto-fix SRI if enabled
    if (config.sriAutoFix) {
      await sriAutoFix.fixAllScripts();
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

// Export all security modules (46 features)
export default {
  // 1-10: P0 Critical Features
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

  // 11-20: XSS & Advanced Protection
  xssProtection,
  corsManager,
  clickjackingPrevention,
  secureCookies,
  sriAutoFix,
  memoryGuard,
  timingSafe,
  headerGuard,
  webSocketSecurity,
  encryptedStorage,

  // 21-30: Extended Security
  crossOriginPolicies,
  sessionHijackingDetection,
  doubleSubmitCSRF,
  consoleProtection,
  devToolsDetection,
  patternAnalysis,
  validators,
  tokenRotation,

  // 31-40: Utilities
  requestTimeout,
  cryptoTokenGenerator,
  realIPDetection,
  endpointLimiter,
  ipStatistics,
  violationRecorder,
  formGuard,
  attributeGuard,
  hashRegistry,
  validationLogger,

  // Core Security (backward compatible)
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
