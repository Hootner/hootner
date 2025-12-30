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
        input.value = this.token;
        form.appendChild(input);
      }
    });
  },

  validate(token) {
    return token === this.token;
  },

  getHeaders() {
    return {'X-CSRF-Token': this.token};
  }
};

CSRF.init();
