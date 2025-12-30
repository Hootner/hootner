/**
 * Content Security Policy Reporter
 */

const CSPReporter = {
  violations: [],

  init(endpoint = '/api/csp-report') {
    document.addEventListener('securitypolicyviolation', (e) => {
      const violation = {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
        timestamp: Date.now()
      };

      this.violations.push(violation);
      this.report(violation, endpoint);
    });
  },

  report(violation, endpoint) {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(violation));
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(violation)
      }).catch(() => {});
    }
  },

  getViolations() {
    return this.violations;
  }
};

CSPReporter.init();
