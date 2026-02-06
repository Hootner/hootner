/**
 * Content Security Policy Reporter
 */

const CSPReporter = {
  violations: [],
  sessionId: crypto.randomUUID(),

  init(endpoint = '/api/csp-report') {
    // Validate endpoint to prevent SSRF
    if (!endpoint.match(/^\/api\/[a-zA-Z0-9_-]+$/)) {
      throw new Error('Invalid CSP endpoint');
    }
    
    document.addEventListener('securitypolicyviolation', (e) => {
      const violation = {
        id: crypto.randomUUID(),
        sessionId: this.sessionId,
        blockedURI: this.sanitizeURI(e.blockedURI),
        violatedDirective: this.sanitizeDirective(e.violatedDirective),
        originalPolicy: e.originalPolicy.substring(0, 1000), // Limit length
        sourceFile: this.sanitizeURI(e.sourceFile),
        lineNumber: parseInt(e.lineNumber) || 0,
        timestamp: Date.now()
      };

      this.violations.push(violation);
      this.report(violation, endpoint);
    });
  },

  sanitizeURI(uri) {
    if (!uri || typeof uri !== 'string') return '';
    return uri.replace(/[<>"'&]/g, '').substring(0, 500);
  },

  sanitizeDirective(directive) {
    if (!directive || typeof directive !== 'string') return '';
    return directive.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 100);
  },

  report(violation, endpoint) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(violation));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSP-Session': this.sessionId.replace(/[^a-zA-Z0-9-]/g, '')
        },
        body: JSON.stringify(violation)
      }).catch(() => {});
    }
  },

  getViolations() {
    return this.violations;
  }
};

CSPReporter.init();
