/**
 * CSRF Token Validation
 */

const CSRF = {
  token: null,

  init() {
    try {
      this.token = document.querySelector('meta[name="csrf-token"]')?.content || this.generate();
      this.injectToken();
    } catch (error) {
      console.error('CSRF initialization error:', error);
      this.token = this.generate();
    }
  },

  generate() {
    try {
      if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
        throw new Error('Crypto API not available');
      }
      return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('CSRF token generation error:', error);
      return Date.now().toString(36) + Math.random().toString(36);
    }
  },

  injectToken() {
    try {
      if (!this.token) {
        throw new Error('CSRF token not initialized');
      }
      
      document.querySelectorAll('form').forEach(form => {
        if (!form.querySelector('input[name="csrfToken"]')) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'csrfToken';
          input.value = this.token;
          form.appendChild(input);
        }
      });
    } catch (error) {
      console.error('CSRF token injection error:', error);
    }
  },

  validate(token) {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      // Use constant-time comparison to prevent timing attacks
      if (token.length !== this.token.length) {
        return false;
      }
      
      let result = 0;
      for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ this.token.charCodeAt(i);
      }
      
      return result === 0;
    } catch (error) {
      console.error('CSRF validation error:', error);
      return false;
    }
  },

  getHeaders() {
    try {
      if (!this.token) {
        throw new Error('CSRF token not available');
      }
      return { 'X-CSRF-Token': this.token };
    } catch (error) {
      console.error('CSRF headers error:', error);
      return {};
    }
  }
};

if (typeof document !== 'undefined') {
  CSRF.init();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CSRF;
}
