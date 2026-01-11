/**
 * CSRF Token Validation
 */

const CSRF = {
  token: null,

  init() {
    this.token = document.querySelector('meta[name="csrf-token"]')?.content || this.generate();
    this.injectToken();
  },

  generate() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  },

  injectToken() {
    document.querySelectorAll('form').forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = this.sanitizeToken(this.token);
        form.appendChild(input);
      }
    });
  },

  sanitizeToken(token) {
    if (!token || typeof token !== 'string') return '';
    return token.replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  },

  validate(token) {
    const sanitizedToken = this.sanitizeToken(token);
    const sanitizedCurrentToken = this.sanitizeToken(this.token);
    return sanitizedToken === sanitizedCurrentToken && sanitizedToken.length > 0;
  },

  getHeaders() {
    return {'X-CSRF-Token': this.sanitizeToken(this.token)};
  }
};

CSRF.init();
