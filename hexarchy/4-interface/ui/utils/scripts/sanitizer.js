/**
 * Input Sanitization with DOMPurify
 */

const Sanitizer = {
  clean(dirty, config = {}) {
    if (typeof DOMPurify === 'undefined') {
      console.warn('DOMPurify not loaded');
      return dirty.replace(/[<>]/g, '');
    }
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: config.tags || ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: config.attrs || ['href', 'title'],
      ...config
    });
  },

  sanitizeForm(form) {
    form.querySelectorAll('input[type="text"], textarea').forEach(input => {
      input.addEventListener('blur', () => {
        input.value = this.clean(input.value, {ALLOWED_TAGS: []});
      });
    });
  },

  sanitizeHTML(html) {
    return this.clean(html);
  }
};
