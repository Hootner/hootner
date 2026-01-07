/**
 * CSRF protection
 */

class CSRFProtection { constructor() { this.token = this.generateToken();
    this.init(); }

  generateToken() { return [...Array(32)].map(() => Math.random().toString(36)[2]).join(''); }

  init() { document.addEventListener('DOMContentLoaded', () => { this.injectTokens();
      this.setupValidation(); }); }

  injectTokens() { document.querySelectorAll('form').forEach(form => { if (form.method.toUpperCase() !== 'GET') { const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '_csrf';
        input.value = this.token;
        form.appendChild(input); } }); }

  setupValidation() { document.querySelectorAll('form').forEach(form => { form.addEventListener('submit', event => { const csrfInput = form.querySelector('input[name="_csrf"]');
        if (csrfInput && csrfInput.value !== this.token) { event.preventDefault();
          console.error('CSRF validation failed'); } }); }); } }

const csrf = new CSRFProtection();

if (typeof module !== 'undefined' && module.exports) { module.exports = CSRFProtection; }
