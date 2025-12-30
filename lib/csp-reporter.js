/**
 * CSP violation reporter
 */

class CSPReporter {
  constructor(endpoint = '/csp-violations') {
    this.endpoint = endpoint;
    this.init();
  }

  init() {
    document.addEventListener('securitypolicyviolation', event => {
      this.report(event);
    });
  }

  report(event) {
    const report = {
      'blocked-uri': event.blockedURI,
      'document-uri': event.documentURI,
      'violated-directive': event.violatedDirective,
      'original-policy': event.originalPolicy,
      'disposition': event.disposition
    };

    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(error => console.error('CSP report failed:', error));
  }
}

const reporter = new CSPReporter();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSPReporter;
}
